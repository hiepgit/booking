import { api } from '../lib/apiClient';

// Types matching backend exactly
export type NotificationType = 
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'DOCTOR_AVAILABLE'
  | 'DOCTOR_UNAVAILABLE'
  | 'NEW_APPOINTMENT_REQUEST'
  | 'SYSTEM_MAINTENANCE'
  | 'SYSTEM_UPDATE'
  | 'WELCOME'
  | 'VERIFICATION_REMINDER'
  | 'GENERAL';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Additional notification data
  channels: NotificationChannel[];
  priority: NotificationPriority;
  isRead: boolean;
  isDelivered: boolean;
  scheduledFor?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  // Relations
  appointment?: {
    id: string;
    appointmentDate: string;
    startTime: string;
    doctor: {
      user: {
        firstName: string;
        lastName: string;
      };
      specialty: {
        name: string;
      };
    };
    clinic: {
      name: string;
    };
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface NotificationsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Get user's notifications with pagination and filters
 */
export async function getNotifications(params?: GetNotificationsParams): Promise<{
  success: boolean;
  data?: NotificationsResponse;
  error?: NotificationsError;
}> {
  try {
    console.log('🔔 Fetching notifications with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    if (params?.type) queryParams.append('type', params.type);

    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ Notifications fetched successfully:', response.data.data.length, 'notifications found');
      return {
        success: true,
        data: {
          success: response.data.success,
          data: response.data.data,
          pagination: response.data.pagination
        }
      };
    } else {
      console.log('❌ Failed to fetch notifications - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get notifications error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch notifications',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<{
  success: boolean;
  data?: { message: string };
  error?: NotificationsError;
}> {
  try {
    console.log('📖 Marking notification as read:', notificationId);
    
    const response = await api.put(`/notifications/${notificationId}/read`);
    
    if (response.status === 200) {
      console.log('✅ Notification marked as read successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to mark notification as read - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Mark as read error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to mark notification as read',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{
  success: boolean;
  data?: { message: string; count: number };
  error?: NotificationsError;
}> {
  try {
    console.log('📖 Marking all notifications as read');
    
    const response = await api.put('/notifications/mark-all-read');
    
    if (response.status === 200) {
      console.log('✅ All notifications marked as read successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to mark all notifications as read - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Mark all as read error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to mark all notifications as read',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{
  success: boolean;
  data?: { message: string };
  error?: NotificationsError;
}> {
  try {
    console.log('🗑️ Deleting notification:', notificationId);
    
    const response = await api.delete(`/notifications/${notificationId}`);
    
    if (response.status === 200) {
      console.log('✅ Notification deleted successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to delete notification - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Delete notification error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to delete notification',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<{
  success: boolean;
  data?: { count: number };
  error?: NotificationsError;
}> {
  try {
    console.log('🔢 Fetching unread notifications count');
    
    const response = await api.get('/notifications/unread-count');
    
    if (response.status === 200) {
      console.log('✅ Unread count fetched successfully:', response.data.data.count);
      return {
        success: true,
        data: response.data.data
      };
    } else {
      console.log('❌ Failed to fetch unread count - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get unread count error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch unread count',
          code: errorData.code,
          details: errorData.details
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
}
