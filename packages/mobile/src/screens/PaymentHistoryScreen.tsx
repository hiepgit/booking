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
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  getPaymentHistory, 
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentHistoryParams,
  formatPaymentAmount,
  getPaymentStatusColor,
  getPaymentStatusText,
  getPaymentMethodIcon
} from '../services/payments.service';

interface PaymentHistoryScreenProps {
  onNavigateBack?: () => void;
  onNavigatePaymentDetails?: (paymentId: string) => void;
}

export default function PaymentHistoryScreen({
  onNavigateBack,
  onNavigatePaymentDetails,
}: PaymentHistoryScreenProps): ReactElement {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  // Filters
  const [filters, setFilters] = useState<{
    status?: PaymentStatus;
    method?: PaymentMethod;
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    fetchPaymentHistory();
  }, [filters]);

  const fetchPaymentHistory = async (loadMore: boolean = false): Promise<void> => {
    try {
      if (!loadMore) {
        setIsLoading(true);
        setError(null);
        setCurrentPage(1);
        setPayments([]);
      }

      const page = loadMore ? currentPage + 1 : 1;
      const params: PaymentHistoryParams = {
        page,
        limit: 20,
        ...filters
      };

      const result = await getPaymentHistory(params);

      if (result.success && result.data) {
        const newPayments = result.data.data;
        
        if (loadMore) {
          setPayments(prev => [...prev, ...newPayments]);
        } else {
          setPayments(newPayments);
        }
        
        setCurrentPage(page);
        setHasMoreData(newPayments.length === 20);
        
        console.log('✅ Payment history loaded:', newPayments.length, 'payments');
      } else {
        throw new Error(result.error?.message || 'Failed to fetch payment history');
      }
    } catch (error: any) {
      console.error('❌ Fetch payment history error:', error);
      setError(error.message || 'Không thể tải lịch sử thanh toán');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback((): void => {
    setIsRefreshing(true);
    fetchPaymentHistory();
  }, [filters]);

  const handleLoadMore = (): void => {
    if (!isLoading && hasMoreData) {
      fetchPaymentHistory(true);
    }
  };

  const handlePaymentPress = (payment: Payment): void => {
    if (onNavigatePaymentDetails) {
      onNavigatePaymentDetails(payment.id);
    } else {
      showPaymentDetails(payment);
    }
  };

  const showPaymentDetails = (payment: Payment): void => {
    const details = [
      `Mã giao dịch: ${payment.transactionId || payment.id}`,
      `Số tiền: ${formatPaymentAmount(payment.amount)}`,
      `Phương thức: ${payment.method}`,
      `Trạng thái: ${getPaymentStatusText(payment.status)}`,
      `Ngày tạo: ${new Date(payment.createdAt).toLocaleString('vi-VN')}`,
    ];

    if (payment.paidAt) {
      details.push(`Ngày thanh toán: ${new Date(payment.paidAt).toLocaleString('vi-VN')}`);
    }

    if (payment.appointment) {
      details.push(`Bác sĩ: ${payment.appointment.doctor.user.firstName} ${payment.appointment.doctor.user.lastName}`);
      details.push(`Chuyên khoa: ${payment.appointment.doctor.specialty.name}`);
    }

    Alert.alert('Chi tiết thanh toán', details.join('\n'));
  };

  const applyFilters = (newFilters: typeof filters): void => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = (): void => {
    setFilters({});
    setShowFilters(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPaymentItem = (payment: Payment) => (
    <TouchableOpacity
      key={payment.id}
      style={styles.paymentItem}
      onPress={() => handlePaymentPress(payment)}
    >
      <View style={styles.paymentContent}>
        <View style={styles.paymentIcon}>
          <MaterialIcons 
            name={getPaymentMethodIcon(payment.method) as any} 
            size={24} 
            color="#FFFFFF" 
          />
        </View>
        
        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentAmount}>
              {formatPaymentAmount(payment.amount)}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getPaymentStatusColor(payment.status) }
            ]}>
              <Text style={styles.statusText}>
                {getPaymentStatusText(payment.status)}
              </Text>
            </View>
          </View>
          
          {payment.appointment && (
            <Text style={styles.appointmentInfo}>
              {payment.appointment.doctor.user.firstName} {payment.appointment.doctor.user.lastName} • {payment.appointment.doctor.specialty.name}
            </Text>
          )}
          
          <View style={styles.paymentMeta}>
            <Text style={styles.paymentDate}>
              {formatDate(payment.createdAt)} • {formatTime(payment.createdAt)}
            </Text>
            <Text style={styles.paymentMethod}>
              {payment.method}
            </Text>
          </View>
          
          {payment.transactionId && (
            <Text style={styles.transactionId}>
              ID: {payment.transactionId}
            </Text>
          )}
        </View>
        
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCancelText}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={() => applyFilters(filters)}>
            <Text style={styles.modalApplyText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Trạng thái</Text>
            <View style={styles.filterOptions}>
              {(['PAID', 'PENDING', 'FAILED', 'CANCELLED', 'REFUNDED'] as PaymentStatus[]).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filters.status === status && styles.activeFilterOption
                  ]}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    status: prev.status === status ? undefined : status 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.status === status && styles.activeFilterOptionText
                  ]}>
                    {getPaymentStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Method Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Phương thức</Text>
            <View style={styles.filterOptions}>
              {(['VNPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'CASH'] as PaymentMethod[]).map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.filterOption,
                    filters.method === method && styles.activeFilterOption
                  ]}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    method: prev.method === method ? undefined : method 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.method === method && styles.activeFilterOptionText
                  ]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Xóa tất cả bộ lọc</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử thanh toán</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#1F2937" />
        </TouchableOpacity>
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
        {isLoading && payments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải lịch sử thanh toán...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchPaymentHistory()} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="payment" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
            <Text style={styles.emptyText}>
              Lịch sử thanh toán của bạn sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {payments.length} giao dịch
              </Text>
            </View>

            {/* Payments List */}
            {payments.map(renderPaymentItem)}

            {/* Load More Indicator */}
            {isLoading && payments.length > 0 && (
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

      {/* Filters Modal */}
      {renderFiltersModal()}
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
  filterButton: {
    padding: 5,
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
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Payment Item
  paymentItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  appointmentInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  paymentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 25,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    marginTop: 30,
    marginBottom: 50,
    paddingVertical: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
  },
});
