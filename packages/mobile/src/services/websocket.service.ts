import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Notification } from './notifications.service';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3001';
const ACCESS_KEY = 'accessToken';

// WebSocket event types matching backend
export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  
  // Notification events
  'notification:new': (notification: Notification) => void;
  'notification:unread:count': (data: { count: number }) => void;
  'notification:unread:count:error': (data: { error: string }) => void;
  
  // Appointment events
  'appointment:updated': (data: {
    appointmentId: string;
    oldStatus: string;
    newStatus: string;
    updatedAt: string;
    appointment: any;
  }) => void;
  
  // System events
  'system:notification': (notification: Notification) => void;
  
  // User status events
  'user:status:changed': (data: {
    userId: string;
    status: 'online' | 'offline';
    timestamp: string;
  }) => void;
  
  // Doctor status events (for doctors)
  'doctor:status:changed': (data: {
    doctorId: string;
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  }) => void;
  'doctor:status:update:error': (data: { error: string }) => void;
  
  // General events
  pong: () => void;
}

export type WebSocketEventName = keyof WebSocketEvents;

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private connectionState: WebSocketConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  };
  private eventListeners = new Map<WebSocketEventName, Set<Function>>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    try {
      this.connectionState.isConnecting = true;
      this.connectionState.error = null;

      // Get auth token
      const token = await SecureStore.getItemAsync(ACCESS_KEY);
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔌 Connecting to WebSocket server...');

      // Create socket connection
      this.socket = io(API_BASE, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
      });

      // Setup event handlers
      this.setupEventHandlers();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.connectionState.isConnected = true;
      this.connectionState.isConnecting = false;
      this.connectionState.reconnectAttempts = 0;

      // Start ping interval
      this.startPingInterval();

      console.log('✅ WebSocket connected successfully');

    } catch (error: any) {
      console.error('❌ WebSocket connection failed:', error);
      this.connectionState.isConnecting = false;
      this.connectionState.error = error.message;
      
      // Attempt reconnection
      this.scheduleReconnect();
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Reset state
    this.connectionState = {
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    };

    console.log('✅ WebSocket disconnected');
  }

  /**
   * Setup event handlers for socket
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.connectionState.isConnected = true;
      this.connectionState.isConnecting = false;
      this.connectionState.error = null;
      this.connectionState.reconnectAttempts = 0;
      this.emitToListeners('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.connectionState.isConnected = false;
      this.emitToListeners('disconnect', reason);
      
      // Attempt reconnection if not manually disconnected
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connectionState.error = error.message;
      this.emitToListeners('connect_error', error);
      this.scheduleReconnect();
    });

    // Notification events
    this.socket.on('notification:new', (notification: Notification) => {
      console.log('🔔 New notification received:', notification.title);
      this.emitToListeners('notification:new', notification);
    });

    this.socket.on('notification:unread:count', (data: { count: number }) => {
      console.log('🔢 Unread count updated:', data.count);
      this.emitToListeners('notification:unread:count', data);
    });

    this.socket.on('notification:unread:count:error', (data: { error: string }) => {
      console.error('❌ Unread count error:', data.error);
      this.emitToListeners('notification:unread:count:error', data);
    });

    // Appointment events
    this.socket.on('appointment:updated', (data) => {
      console.log('📅 Appointment updated:', data.appointmentId);
      this.emitToListeners('appointment:updated', data);
    });

    // System events
    this.socket.on('system:notification', (notification: Notification) => {
      console.log('🔔 System notification received:', notification.title);
      this.emitToListeners('system:notification', notification);
    });

    // User status events
    this.socket.on('user:status:changed', (data) => {
      console.log('👤 User status changed:', data.userId, data.status);
      this.emitToListeners('user:status:changed', data);
    });

    // Doctor status events
    this.socket.on('doctor:status:changed', (data) => {
      console.log('👨‍⚕️ Doctor status changed:', data.doctorId, data.status);
      this.emitToListeners('doctor:status:changed', data);
    });

    this.socket.on('doctor:status:update:error', (data) => {
      console.error('❌ Doctor status update error:', data.error);
      this.emitToListeners('doctor:status:update:error', data);
    });

    // Ping/pong
    this.socket.on('pong', () => {
      this.emitToListeners('pong');
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts);
    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${this.connectionState.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Emit event to all registered listeners
   */
  private emitToListeners(eventName: WebSocketEventName, ...args: any[]): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`❌ Error in WebSocket event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Add event listener
   */
  on<T extends WebSocketEventName>(eventName: T, listener: WebSocketEvents[T]): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(listener);
  }

  /**
   * Remove event listener
   */
  off<T extends WebSocketEventName>(eventName: T, listener: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners(eventName?: WebSocketEventName): void {
    if (eventName) {
      this.eventListeners.delete(eventName);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Emit event to server
   */
  emit(eventName: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Cannot emit event - WebSocket not connected');
    }
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    this.emit('join', { room });
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.emit('leave', { room });
  }

  /**
   * Join appointment room for real-time updates
   */
  joinAppointment(appointmentId: string): void {
    this.emit('appointment:join', { appointmentId });
  }

  /**
   * Leave appointment room
   */
  leaveAppointment(appointmentId: string): void {
    this.emit('appointment:leave', { appointmentId });
  }

  /**
   * Request unread notification count
   */
  requestUnreadCount(): void {
    this.emit('notification:unread:count');
  }

  /**
   * Update doctor status (for doctors only)
   */
  updateDoctorStatus(status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'): void {
    this.emit('doctor:status:update', { status });
  }

  /**
   * Get connection state
   */
  getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState.isConnected && this.socket?.connected === true;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

/**
 * Get WebSocket service instance
 */
export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService();
  }
  return webSocketService;
};

/**
 * Initialize WebSocket connection
 */
export const initializeWebSocket = async (): Promise<void> => {
  const service = getWebSocketService();
  await service.connect();
};

/**
 * Cleanup WebSocket connection
 */
export const cleanupWebSocket = (): void => {
  if (webSocketService) {
    webSocketService.disconnect();
    webSocketService = null;
  }
};
