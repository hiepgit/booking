import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../libs/prisma.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
  userEmail: string;
}

export interface SocketUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private userSockets = new Map<string, SocketUser>(); // socketId -> user info

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
        
        // Get user details from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        // Attach user info to socket
        socket.userId = user.id;
        socket.userRole = user.role;
        socket.userEmail = user.email;
        socket.user = user;

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`User ${socket.user.email} connected with socket ${socket.id}`);
      
      // Track connected user
      this.trackUserConnection(socket);
      
      // Join user-specific room
      socket.join(`user:${socket.userId}`);
      
      // Join role-specific room
      socket.join(`role:${socket.userRole.toLowerCase()}`);
      
      // Handle notification events
      this.setupNotificationHandlers(socket);
      
      // Handle appointment events
      this.setupAppointmentHandlers(socket);
      
      // Handle general events
      this.setupGeneralHandlers(socket);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.email} disconnected from socket ${socket.id}`);
        this.handleUserDisconnection(socket);
      });
    });
  }

  private trackUserConnection(socket: any) {
    const userId = socket.userId;
    
    // Add to connected users map
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);
    
    // Store user info for this socket
    this.userSockets.set(socket.id, socket.user);
    
    // Emit user online status to relevant users
    this.emitUserStatusChange(userId, 'online');
  }

  private handleUserDisconnection(socket: any) {
    const userId = socket.userId;
    
    // Remove from connected users map
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId)!.delete(socket.id);
      
      // If no more connections for this user, mark as offline
      if (this.connectedUsers.get(userId)!.size === 0) {
        this.connectedUsers.delete(userId);
        this.emitUserStatusChange(userId, 'offline');
      }
    }
    
    // Remove socket user info
    this.userSockets.delete(socket.id);
  }

  private setupNotificationHandlers(socket: any) {
    // Mark notification as read
    socket.on('notification:read', async (data: { notificationId: string }) => {
      try {
        await prisma.notification.update({
          where: { 
            id: data.notificationId,
            userId: socket.userId 
          },
          data: { isRead: true }
        });
        
        socket.emit('notification:read:success', { notificationId: data.notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('notification:read:error', { error: 'Failed to mark notification as read' });
      }
    });

    // Mark all notifications as read
    socket.on('notification:read:all', async () => {
      try {
        await prisma.notification.updateMany({
          where: { 
            userId: socket.userId,
            isRead: false 
          },
          data: { isRead: true }
        });
        
        socket.emit('notification:read:all:success');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        socket.emit('notification:read:all:error', { error: 'Failed to mark notifications as read' });
      }
    });

    // Get unread notification count
    socket.on('notification:unread:count', async () => {
      try {
        const count = await prisma.notification.count({
          where: { 
            userId: socket.userId,
            isRead: false 
          }
        });
        
        socket.emit('notification:unread:count', { count });
      } catch (error) {
        console.error('Error getting unread count:', error);
        socket.emit('notification:unread:count:error', { error: 'Failed to get unread count' });
      }
    });
  }

  private setupAppointmentHandlers(socket: any) {
    // Join appointment-specific room when viewing appointment
    socket.on('appointment:join', (data: { appointmentId: string }) => {
      socket.join(`appointment:${data.appointmentId}`);
    });

    // Leave appointment-specific room
    socket.on('appointment:leave', (data: { appointmentId: string }) => {
      socket.leave(`appointment:${data.appointmentId}`);
    });

    // Doctor availability status update
    if (socket.userRole === 'DOCTOR') {
      socket.on('doctor:status:update', async (data: { status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' }) => {
        try {
          await prisma.doctor.update({
            where: { userId: socket.userId },
            data: { isAvailable: data.status === 'AVAILABLE' }
          });
          
          // Notify relevant users about doctor status change
          this.io.to(`doctor:${socket.userId}`).emit('doctor:status:changed', {
            doctorId: socket.userId,
            status: data.status
          });
        } catch (error) {
          console.error('Error updating doctor status:', error);
          socket.emit('doctor:status:update:error', { error: 'Failed to update status' });
        }
      });
    }
  }

  private setupGeneralHandlers(socket: any) {
    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Get online users (for admin)
    if (socket.userRole === 'ADMIN') {
      socket.on('admin:online:users', () => {
        const onlineUsers = Array.from(this.userSockets.values());
        socket.emit('admin:online:users', { users: onlineUsers, count: onlineUsers.length });
      });
    }
  }

  private emitUserStatusChange(userId: string, status: 'online' | 'offline') {
    // Emit to doctors and admins about user status changes
    this.io.to('role:doctor').to('role:admin').emit('user:status:changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Public methods for sending notifications
  public async sendNotificationToUser(userId: string, notification: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.size > 0) {
      this.io.to(`user:${userId}`).emit('notification:new', notification);
      return true; // Successfully sent via WebSocket
    }
    return false; // User not connected
  }

  public async sendNotificationToRole(role: string, notification: any) {
    this.io.to(`role:${role.toLowerCase()}`).emit('notification:new', notification);
  }

  public async sendAppointmentUpdate(appointmentId: string, update: any) {
    this.io.to(`appointment:${appointmentId}`).emit('appointment:updated', update);
  }

  public async broadcastSystemNotification(notification: any) {
    this.io.emit('system:notification', notification);
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsersByRole(role: string): number {
    return Array.from(this.userSockets.values())
      .filter(user => user.role.toLowerCase() === role.toLowerCase()).length;
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getSocketServer(): SocketIOServer {
    return this.io;
  }
}

// Global socket server instance
let socketServer: SocketServer | null = null;

export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  if (!socketServer) {
    socketServer = new SocketServer(httpServer);
    console.log('✅ Socket.IO server initialized');
  }
  return socketServer;
};

export const getSocketServer = (): SocketServer | null => {
  return socketServer;
};
