import React, { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SwipeRow,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
  NotificationType
} from '../services/notifications.service';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationScreenProps {
  onNavigateBack?: () => void;
  onNavigateAppointment?: (appointmentId: string) => void;
}

export default function NotificationScreen({
  onNavigateBack,
  onNavigateAppointment,
}: NotificationScreenProps): ReactElement {
  // Use notification context
  const {
    notifications: contextNotifications,
    unreadCount,
    isLoading: contextLoading,
    error: contextError,
    refreshUnreadCount,
  } = useNotifications();

  // Local state for screen-specific functionality
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  // Filters
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | NotificationType>('all');

  useEffect(() => {
    fetchNotifications();
  }, [selectedFilter]);

  const fetchNotifications = async (loadMore: boolean = false): Promise<void> => {
    try {
      if (!loadMore) {
        setIsLoading(true);
        setError(null);
        setCurrentPage(1);
        setNotifications([]);
      }

      const page = loadMore ? currentPage + 1 : 1;
      const params = {
        page,
        limit: 20,
        ...(selectedFilter === 'unread' && { isRead: false }),
        ...(selectedFilter !== 'all' && selectedFilter !== 'unread' && { type: selectedFilter as NotificationType })
      };

      const result = await getNotifications(params);

      if (result.success && result.data) {
        const newNotifications = result.data.data;
        
        if (loadMore) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setCurrentPage(page);
        setHasMoreData(newNotifications.length === 20);
        
        console.log('✅ Notifications loaded:', newNotifications.length);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('❌ Fetch notifications error:', error);
      setError(error.message || 'Không thể tải thông báo');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback((): void => {
    setIsRefreshing(true);
    fetchNotifications();
    refreshUnreadCount();
  }, [selectedFilter, refreshUnreadCount]);

  const handleLoadMore = (): void => {
    if (!isLoading && hasMoreData) {
      fetchNotifications(true);
    }
  };

  const handleNotificationPress = async (notification: Notification): Promise<void> => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        const result = await markAsRead(notification.id);
        if (result.success) {
          setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
          );
          // Context will handle unread count update via WebSocket
        }
      } catch (error) {
        console.error('❌ Mark as read error:', error);
      }
    }

    // Handle navigation based on notification type
    if (notification.appointment && onNavigateAppointment) {
      onNavigateAppointment(notification.appointment.id);
    } else if (notification.data?.appointmentId && onNavigateAppointment) {
      onNavigateAppointment(notification.data.appointmentId);
    } else {
      // Show notification details
      Alert.alert(notification.title, notification.message);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      const result = await markAllAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        // Context will handle unread count update via WebSocket
        Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
      } else {
        throw new Error(result.error?.message || 'Failed to mark all as read');
      }
    } catch (error: any) {
      console.error('❌ Mark all as read error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể đánh dấu tất cả thông báo');
    }
  };

  const handleDeleteNotification = async (notificationId: string): Promise<void> => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        Alert.alert('Thành công', 'Đã xóa thông báo');
      } else {
        throw new Error(result.error?.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      console.error('❌ Delete notification error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xóa thông báo');
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_CANCELLED':
      case 'APPOINTMENT_RESCHEDULED':
      case 'APPOINTMENT_COMPLETED':
        return 'event';
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_FAILED':
      case 'PAYMENT_REFUNDED':
        return 'payment';
      case 'DOCTOR_AVAILABLE':
      case 'DOCTOR_UNAVAILABLE':
        return 'person';
      case 'SYSTEM_MAINTENANCE':
      case 'SYSTEM_UPDATE':
        return 'settings';
      case 'WELCOME':
        return 'celebration';
      case 'VERIFICATION_REMINDER':
        return 'verified';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMED':
        return '#007AFF';
      case 'APPOINTMENT_CANCELLED':
        return '#DC2626';
      case 'PAYMENT_SUCCESS':
        return '#10B981';
      case 'PAYMENT_FAILED':
        return '#DC2626';
      case 'SYSTEM_MAINTENANCE':
        return '#F59E0B';
      case 'WELCOME':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const renderNotificationItem = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(notification.type) }
        ]}>
          <MaterialIcons 
            name={getNotificationIcon(notification.type) as any} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {!notification.isRead && <View style={styles.unreadDot} />}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Xóa thông báo',
                'Bạn có chắc chắn muốn xóa thông báo này?',
                [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Xóa', style: 'destructive', onPress: () => handleDeleteNotification(notification.id) }
                ]
              );
            }}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filterOptions = [
    { key: 'all', label: 'Tất cả', count: notifications.length },
    { key: 'unread', label: 'Chưa đọc', count: unreadCount },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(option.key as any)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === option.key && styles.activeFilterText
              ]}>
                {option.label} ({option.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchNotifications()} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'unread' 
                ? 'Bạn đã đọc hết tất cả thông báo'
                : 'Chưa có thông báo nào được gửi đến bạn'
              }
            </Text>
          </View>
        ) : (
          <>
            {notifications.map(renderNotificationItem)}
            
            {/* Load More Indicator */}
            {isLoading && notifications.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
              </View>
            )}
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  markAllButton: {
    padding: 5,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  filtersContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginLeft: 16,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Notification Item
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionsContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 50,
  },
});
