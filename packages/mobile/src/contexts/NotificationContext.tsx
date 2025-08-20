import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Notification, getUnreadCount } from '../services/notifications.service';
import { getWebSocketService, WebSocketService, WebSocketConnectionState } from '../services/websocket.service';

interface NotificationContextType {
  // Notification state
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // WebSocket state
  connectionState: WebSocketConnectionState;
  
  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  updateUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
  
  // WebSocket actions
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  joinAppointment: (appointmentId: string) => void;
  leaveAppointment: (appointmentId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket state
  const [webSocketService] = useState<WebSocketService>(() => getWebSocketService());
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    webSocketService.getConnectionState()
  );

  // Initialize WebSocket connection and fetch initial data
  useEffect(() => {
    initializeNotifications();
    setupAppStateListener();
    
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Setup WebSocket event listeners
  useEffect(() => {
    setupWebSocketListeners();
    
    return () => {
      webSocketService.removeAllListeners();
    };
  }, [webSocketService]);

  const initializeNotifications = async (): Promise<void> => {
    try {
      // Connect WebSocket
      await connectWebSocket();
      
      // Fetch initial unread count
      await refreshUnreadCount();
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  };

  const setupWebSocketListeners = (): void => {
    // Connection state updates
    webSocketService.on('connect', () => {
      setConnectionState(webSocketService.getConnectionState());
      console.log('🔔 NotificationContext: WebSocket connected');
    });

    webSocketService.on('disconnect', (reason) => {
      setConnectionState(webSocketService.getConnectionState());
      console.log('🔔 NotificationContext: WebSocket disconnected:', reason);
    });

    webSocketService.on('connect_error', (error) => {
      setConnectionState(webSocketService.getConnectionState());
      setError(error.message);
      console.error('🔔 NotificationContext: WebSocket connection error:', error);
    });

    // New notification
    webSocketService.on('notification:new', (notification: Notification) => {
      console.log('🔔 NotificationContext: New notification received:', notification.title);
      addNotification(notification);
      
      // Update unread count if notification is unread
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Unread count updates
    webSocketService.on('notification:unread:count', (data: { count: number }) => {
      console.log('🔔 NotificationContext: Unread count updated:', data.count);
      setUnreadCount(data.count);
    });

    webSocketService.on('notification:unread:count:error', (data: { error: string }) => {
      console.error('🔔 NotificationContext: Unread count error:', data.error);
      setError(data.error);
    });

    // System notifications
    webSocketService.on('system:notification', (notification: Notification) => {
      console.log('🔔 NotificationContext: System notification received:', notification.title);
      addNotification(notification);
      
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Appointment updates
    webSocketService.on('appointment:updated', (data) => {
      console.log('📅 NotificationContext: Appointment updated:', data.appointmentId);
      // You can emit custom events here for appointment updates
    });
  };

  const setupAppStateListener = (): void => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState === 'active') {
        // App became active, reconnect WebSocket if needed
        if (!webSocketService.isConnected()) {
          connectWebSocket().catch(console.error);
        }
        // Refresh unread count
        refreshUnreadCount().catch(console.error);
      } else if (nextAppState === 'background') {
        // App went to background, keep WebSocket connected for notifications
        // but you might want to reduce ping frequency
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  };

  // Actions
  const addNotification = useCallback((notification: Notification): void => {
    setNotifications(prev => {
      // Avoid duplicates
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      // Add to beginning of array (newest first)
      return [notification, ...prev];
    });
  }, []);

  const removeNotification = useCallback((notificationId: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const markAsRead = useCallback((notificationId: string): void => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    
    // Decrease unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const updateUnreadCount = useCallback((count: number): void => {
    setUnreadCount(count);
  }, []);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getUnreadCount();
      
      if (result.success && result.data) {
        setUnreadCount(result.data.count);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch unread count');
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh unread count:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket actions
  const connectWebSocket = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await webSocketService.connect();
      setConnectionState(webSocketService.getConnectionState());
    } catch (error: any) {
      console.error('❌ Failed to connect WebSocket:', error);
      setError(error.message);
      setConnectionState(webSocketService.getConnectionState());
      throw error;
    }
  }, [webSocketService]);

  const disconnectWebSocket = useCallback((): void => {
    webSocketService.disconnect();
    setConnectionState(webSocketService.getConnectionState());
  }, [webSocketService]);

  const joinAppointment = useCallback((appointmentId: string): void => {
    webSocketService.joinAppointment(appointmentId);
  }, [webSocketService]);

  const leaveAppointment = useCallback((appointmentId: string): void => {
    webSocketService.leaveAppointment(appointmentId);
  }, [webSocketService]);

  const contextValue: NotificationContextType = {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    connectionState,
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    updateUnreadCount,
    refreshUnreadCount,
    
    // WebSocket actions
    connectWebSocket,
    disconnectWebSocket,
    joinAppointment,
    leaveAppointment,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}

// Hook to use only unread count (for performance)
export function useUnreadCount(): {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
} {
  const { unreadCount, refreshUnreadCount, isLoading } = useNotifications();
  
  return {
    unreadCount,
    refreshUnreadCount,
    isLoading,
  };
}

// Hook to use WebSocket connection state
export function useWebSocketConnection(): {
  connectionState: WebSocketConnectionState;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  isConnected: boolean;
} {
  const { connectionState, connectWebSocket, disconnectWebSocket } = useNotifications();
  
  return {
    connectionState,
    connectWebSocket,
    disconnectWebSocket,
    isConnected: connectionState.isConnected,
  };
}
