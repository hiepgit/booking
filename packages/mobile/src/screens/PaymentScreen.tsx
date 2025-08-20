import React, { useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  createPayment, 
  processVNPayPayment, 
  getPaymentMethods,
  parseVNPayCallback,
  isVNPayPaymentSuccessful,
  getVNPayPaymentMessage,
  formatPaymentAmount,
  getPaymentMethodIcon,
  PaymentMethod as PaymentMethodType,
  CreatePaymentRequest
} from '../services/payments.service';

interface PaymentScreenProps {
  appointmentId: string;
  appointmentDetails?: {
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    startTime: string;
    consultationFee: number;
    clinicName?: string;
  };
  onNavigateBack?: () => void;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentFailed?: (error: string) => void;
}

export default function PaymentScreen({
  appointmentId,
  appointmentDetails,
  onNavigateBack,
  onPaymentSuccess,
  onPaymentFailed,
}: PaymentScreenProps): ReactElement {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
    setupDeepLinkListener();
    
    return () => {
      // Cleanup deep link listener
      Linking.removeAllListeners('url');
    };
  }, []);

  const fetchPaymentMethods = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getPaymentMethods();

      if (result.success && result.data) {
        const activeMethods = result.data.filter(method => method.isActive);
        setPaymentMethods(activeMethods);
        
        // Auto-select VNPay if available
        const vnpayMethod = activeMethods.find(method => method.type === 'VNPAY');
        if (vnpayMethod) {
          setSelectedMethod(vnpayMethod);
        } else if (activeMethods.length > 0) {
          setSelectedMethod(activeMethods[0]);
        }
        
        console.log('✅ Payment methods loaded:', activeMethods.length);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch payment methods');
      }
    } catch (error: any) {
      console.error('❌ Fetch payment methods error:', error);
      setError(error.message || 'Không thể tải phương thức thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  const setupDeepLinkListener = (): void => {
    // Listen for deep link returns from VNPay
    const handleDeepLink = (event: { url: string }): void => {
      console.log('🔗 Deep link received:', event.url);
      handleVNPayCallback(event.url);
    };

    Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleVNPayCallback(url);
      }
    });
  };

  const handleVNPayCallback = (url: string): void => {
    const callbackParams = parseVNPayCallback(url);
    
    if (!callbackParams) {
      console.log('⚠️ Not a VNPay callback URL');
      return;
    }

    console.log('💳 VNPay callback received:', callbackParams);

    const isSuccessful = isVNPayPaymentSuccessful(callbackParams);
    const message = getVNPayPaymentMessage(callbackParams);

    if (isSuccessful) {
      Alert.alert(
        'Thanh toán thành công',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onPaymentSuccess) {
                onPaymentSuccess(callbackParams.vnp_TxnRef);
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Thanh toán thất bại',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onPaymentFailed) {
                onPaymentFailed(message);
              }
            }
          }
        ]
      );
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!selectedMethod) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      if (selectedMethod.type === 'VNPAY') {
        await handleVNPayPayment();
      } else {
        // Handle other payment methods
        Alert.alert('Thông báo', 'Phương thức thanh toán này chưa được hỗ trợ');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Không thể thực hiện thanh toán');
      Alert.alert('Lỗi thanh toán', error.message || 'Không thể thực hiện thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVNPayPayment = async (): Promise<void> => {
    const request: CreatePaymentRequest = {
      appointmentId,
      returnUrl: 'healthpal://payment/callback', // Deep link for return
    };

    const result = await createPayment(request);

    if (result.success && result.data) {
      console.log('✅ VNPay payment URL created:', result.data.paymentUrl);
      
      // Open VNPay payment URL
      const processResult = await processVNPayPayment(result.data.paymentUrl);
      
      if (!processResult.success) {
        throw new Error(processResult.error?.message || 'Cannot open payment URL');
      }
    } else {
      throw new Error(result.error?.message || 'Failed to create payment');
    }
  };

  const renderPaymentMethod = (method: PaymentMethodType) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod?.id === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodIcon}>
          <MaterialIcons 
            name={getPaymentMethodIcon(method.type) as any} 
            size={24} 
            color={selectedMethod?.id === method.id ? '#007AFF' : '#6B7280'} 
          />
        </View>
        
        <View style={styles.paymentMethodInfo}>
          <Text style={[
            styles.paymentMethodName,
            selectedMethod?.id === method.id && styles.selectedPaymentMethodText
          ]}>
            {method.name}
          </Text>
          <Text style={styles.paymentMethodDescription}>
            {method.description}
          </Text>
          {method.processingFee && method.processingFee > 0 && (
            <Text style={styles.processingFee}>
              Phí xử lý: {formatPaymentAmount(method.processingFee)}
            </Text>
          )}
        </View>
        
        <View style={styles.radioButton}>
          {selectedMethod?.id === method.id && (
            <View style={styles.radioButtonSelected} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải phương thức thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchPaymentMethods} style={styles.retryButton}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Appointment Details */}
        {appointmentDetails && (
          <View style={styles.appointmentSection}>
            <Text style={styles.sectionTitle}>Chi tiết cuộc hẹn</Text>
            <View style={styles.appointmentCard}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.doctorName}>{appointmentDetails.doctorName}</Text>
                <Text style={styles.specialty}>{appointmentDetails.specialty}</Text>
                {appointmentDetails.clinicName && (
                  <Text style={styles.clinicName}>{appointmentDetails.clinicName}</Text>
                )}
                <Text style={styles.appointmentTime}>
                  {new Date(appointmentDetails.appointmentDate).toLocaleDateString('vi-VN')} • {appointmentDetails.startTime}
                </Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={styles.feeLabel}>Phí khám:</Text>
                <Text style={styles.feeAmount}>
                  {formatPaymentAmount(appointmentDetails.consultationFee)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.length === 0 ? (
            <View style={styles.noMethodsContainer}>
              <MaterialIcons name="payment" size={48} color="#9CA3AF" />
              <Text style={styles.noMethodsText}>Không có phương thức thanh toán</Text>
            </View>
          ) : (
            paymentMethods.map(renderPaymentMethod)
          )}
        </View>

        {/* Payment Summary */}
        {appointmentDetails && selectedMethod && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Tổng kết thanh toán</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí khám bệnh:</Text>
                <Text style={styles.summaryValue}>
                  {formatPaymentAmount(appointmentDetails.consultationFee)}
                </Text>
              </View>
              {selectedMethod.processingFee && selectedMethod.processingFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phí xử lý:</Text>
                  <Text style={styles.summaryValue}>
                    {formatPaymentAmount(selectedMethod.processingFee)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>
                  {formatPaymentAmount(
                    appointmentDetails.consultationFee + (selectedMethod.processingFee || 0)
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Payment Button */}
      {selectedMethod && appointmentDetails && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="payment" size={20} color="#FFFFFF" />
                <Text style={styles.paymentButtonText}>
                  Thanh toán {formatPaymentAmount(appointmentDetails.consultationFee)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
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
  placeholder: {
    width: 34, // Same width as back button for centering
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Appointment Section
  appointmentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appointmentInfo: {
    marginBottom: 15,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  clinicName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  feeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Payment Methods Section
  paymentMethodsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noMethodsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMethodsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedPaymentMethodText: {
    color: '#007AFF',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  processingFee: {
    fontSize: 12,
    color: '#F59E0B',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },

  // Summary Section
  summarySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  bottomSpacing: {
    height: 100, // Space for payment button
  },

  // Payment Button
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
