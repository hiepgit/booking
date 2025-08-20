import type { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { ReminderService } from '../services/reminder.service.js';
import { EmailTemplateService } from '../services/email-template.service.js';
import { prisma } from '../libs/prisma.js';
import { z } from 'zod';

// Validation schemas
const CreateNotificationSchema = z.object({
  userId: z.string().optional(),
  type: z.string(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.any().optional(),
  channels: z.array(z.string()).optional(),
  priority: z.string().optional(),
  scheduledFor: z.string().optional(),
  appointmentId: z.string().optional()
});

// UpdatePreferencesSchema removed - not implemented yet

export class NotificationController {
  /**
   * Get user's notifications with pagination
   */
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
      const type = req.query.type as string;

      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (isRead !== undefined) where.isRead = isRead;
      if (type) where.type = type;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            appointment: {
              select: {
                id: true,
                appointmentDate: true,
                startTime: true,
                doctor: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    },
                    specialty: {
                      select: {
                        name: true
                      }
                    }
                  }
                },
                clinic: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get notifications'
        }
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const notification = await prisma.notification.update({
        where: {
          id,
          userId // Ensure user can only update their own notifications
        },
        data: {
          isRead: true
        }
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark notification as read'
        }
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;

      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      res.json({
        success: true,
        data: {
          updatedCount: result.count
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark all notifications as read'
        }
      });
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;

      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      res.json({
        success: true,
        data: {
          count
        }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get unread count'
        }
      });
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;

      const preferences = await prisma.notificationPreference.findMany({
        where: { userId },
        orderBy: { type: 'asc' }
      });

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get notification preferences'
        }
      });
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(_req: Request, res: Response) {
    try {
      // TODO: Implement updateUserPreferences method in NotificationService
      const updatedPreference = { success: true };

      res.json({
        success: true,
        data: updatedPreference
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid preference data',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification preferences'
        }
      });
    }
  }

  /**
   * Create notification (Admin only)
   */
  static async createNotification(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        });
      }

      const data = CreateNotificationSchema.parse(req.body);
      
      // If no userId provided, send to all users
      if (!data.userId) {
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true }
        });

        const notifications = [];
        for (const user of users) {
          const notification = await NotificationService.createNotification({
            ...data,
            type: data.type as any,
            userId: user.id
          });
          notifications.push(notification);
        }

        return res.json({
          success: true,
          data: {
            message: `Notification sent to ${notifications.length} users`,
            notifications: notifications.slice(0, 5) // Return first 5 as sample
          }
        });
      }

      const notification = await NotificationService.createNotification({
        ...data,
        type: data.type as any,
        userId: data.userId || req.user!.sub
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid notification data',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create notification'
        }
      });
    }
  }

  /**
   * Get notification statistics (Admin only)
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        totalNotifications,
        todayNotifications,
        unreadNotifications,
        deliveredNotifications,
        reminderStats
      ] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }),
        prisma.notification.count({
          where: { isRead: false }
        }),
        prisma.notification.count({
          where: { isDelivered: true }
        }),
        ReminderService.getReminderStats()
      ]);

      // Get notification types distribution
      const typeDistribution = await prisma.notification.groupBy({
        by: ['type'],
        _count: {
          type: true
        },
        orderBy: {
          _count: {
            type: 'desc'
          }
        }
      });

      res.json({
        success: true,
        data: {
          total: totalNotifications,
          today: todayNotifications,
          unread: unreadNotifications,
          delivered: deliveredNotifications,
          deliveryRate: totalNotifications > 0 ? (deliveredNotifications / totalNotifications * 100).toFixed(2) : 0,
          typeDistribution,
          reminders: reminderStats
        }
      });
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get notification statistics'
        }
      });
    }
  }

  /**
   * Get email templates (Admin only)
   */
  static async getEmailTemplates(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        });
      }

      const templates = await EmailTemplateService.getAllTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting email templates:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get email templates'
        }
      });
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      await prisma.notification.delete({
        where: {
          id,
          userId // Ensure user can only delete their own notifications
        }
      });

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete notification'
        }
      });
    }
  }
}
