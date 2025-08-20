import { api } from '../lib/apiClient';
import { Linking } from 'react-native';

// Types matching backend exactly
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'VNPAY' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  appointmentId: string;
  patientId: string;
  appointment?: {
    id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    doctor: {
      user: {
        firstName: string;
        lastName: string;
      };
      specialty: {
        name: string;
      };
      consultationFee: number;
    };
    clinic?: {
      name: string;
      address: string;
    };
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethod;
  description: string;
  isActive: boolean;
  icon?: string;
  processingFee?: number;
}

export interface CreatePaymentRequest {
  appointmentId: string;
  returnUrl?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    paymentUrl: string;
    payment: {
      id: string;
      amount: number;
      status: PaymentStatus;
      method: PaymentMethod;
    };
    appointment: {
      id: string;
      appointmentDate: string;
      startTime: string;
      doctor: {
        name: string;
        specialty: string;
      };
    };
  };
}

export interface PaymentHistoryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    payment: Payment;
    appointment: Payment['appointment'];
  };
}

export interface VNPayCallbackParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface PaymentsError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Create VNPay payment URL
 */
export async function createPayment(request: CreatePaymentRequest): Promise<{
  success: boolean;
  data?: CreatePaymentResponse['data'];
  error?: PaymentsError;
}> {
  try {
    console.log('💳 Creating VNPay payment for appointment:', request.appointmentId);
    
    const response = await api.post('/payments/vnpay/create', request);
    
    if (response.status === 200) {
      console.log('✅ VNPay payment URL created successfully');
      return {
        success: true,
        data: response.data.data
      };
    } else {
      console.log('❌ Failed to create VNPay payment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Create payment error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to create payment',
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
 * Get payment history with pagination and filters
 */
export async function getPaymentHistory(params?: PaymentHistoryParams): Promise<{
  success: boolean;
  data?: PaymentHistoryResponse;
  error?: PaymentsError;
}> {
  try {
    console.log('📋 Fetching payment history with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (response.status === 200) {
      console.log('✅ Payment history fetched successfully:', response.data.data.length, 'payments found');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to fetch payment history - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get payment history error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch payment history',
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
 * Get available payment methods
 */
export async function getPaymentMethods(): Promise<{
  success: boolean;
  data?: PaymentMethod[];
  error?: PaymentsError;
}> {
  try {
    console.log('💳 Fetching available payment methods');
    
    const response = await api.get('/payments/methods');
    
    if (response.status === 200) {
      console.log('✅ Payment methods fetched successfully:', response.data.data.length, 'methods found');
      return {
        success: true,
        data: response.data.data
      };
    } else {
      console.log('❌ Failed to fetch payment methods - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get payment methods error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch payment methods',
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
 * Process VNPay payment by opening payment URL
 */
export async function processVNPayPayment(paymentUrl: string): Promise<{
  success: boolean;
  error?: PaymentsError;
}> {
  try {
    console.log('🌐 Opening VNPay payment URL');
    
    const supported = await Linking.canOpenURL(paymentUrl);
    
    if (!supported) {
      return {
        success: false,
        error: {
          message: 'Cannot open VNPay payment URL',
          code: 'URL_NOT_SUPPORTED'
        }
      };
    }

    await Linking.openURL(paymentUrl);
    
    console.log('✅ VNPay payment URL opened successfully');
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Process VNPay payment error:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to open payment URL',
        code: 'PAYMENT_URL_ERROR'
      }
    };
  }
}

/**
 * Get payment status by payment ID
 */
export async function getPaymentStatus(paymentId: string): Promise<{
  success: boolean;
  data?: PaymentStatusResponse['data'];
  error?: PaymentsError;
}> {
  try {
    console.log('🔍 Fetching payment status for:', paymentId);
    
    const response = await api.get(`/payments/${paymentId}/status`);
    
    if (response.status === 200) {
      console.log('✅ Payment status fetched successfully:', response.data.data.payment.status);
      return {
        success: true,
        data: response.data.data
      };
    } else {
      console.log('❌ Failed to fetch payment status - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Get payment status error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to fetch payment status',
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
 * Cancel pending payment
 */
export async function cancelPayment(paymentId: string): Promise<{
  success: boolean;
  data?: { message: string };
  error?: PaymentsError;
}> {
  try {
    console.log('❌ Cancelling payment:', paymentId);
    
    const response = await api.post(`/payments/${paymentId}/cancel`);
    
    if (response.status === 200) {
      console.log('✅ Payment cancelled successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.log('❌ Failed to cancel payment - invalid response');
      return {
        success: false,
        error: { message: 'Invalid response from server' }
      };
    }
  } catch (error: any) {
    console.error('❌ Cancel payment error:', error);
    
    if (error.response) {
      const errorData = error.response.data?.error || {};
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to cancel payment',
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
 * Parse VNPay callback URL parameters
 */
export function parseVNPayCallback(url: string): VNPayCallbackParams | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Check if this is a VNPay callback URL
    if (!params.get('vnp_TxnRef') || !params.get('vnp_SecureHash')) {
      return null;
    }

    const callbackParams: VNPayCallbackParams = {
      vnp_Amount: params.get('vnp_Amount') || '',
      vnp_BankCode: params.get('vnp_BankCode') || '',
      vnp_BankTranNo: params.get('vnp_BankTranNo') || '',
      vnp_CardType: params.get('vnp_CardType') || '',
      vnp_OrderInfo: params.get('vnp_OrderInfo') || '',
      vnp_PayDate: params.get('vnp_PayDate') || '',
      vnp_ResponseCode: params.get('vnp_ResponseCode') || '',
      vnp_TmnCode: params.get('vnp_TmnCode') || '',
      vnp_TransactionNo: params.get('vnp_TransactionNo') || '',
      vnp_TransactionStatus: params.get('vnp_TransactionStatus') || '',
      vnp_TxnRef: params.get('vnp_TxnRef') || '',
      vnp_SecureHash: params.get('vnp_SecureHash') || '',
    };

    return callbackParams;
  } catch (error) {
    console.error('❌ Failed to parse VNPay callback URL:', error);
    return null;
  }
}

/**
 * Check if VNPay payment was successful
 */
export function isVNPayPaymentSuccessful(callbackParams: VNPayCallbackParams): boolean {
  return callbackParams.vnp_ResponseCode === '00' && callbackParams.vnp_TransactionStatus === '00';
}

/**
 * Get VNPay payment result message
 */
export function getVNPayPaymentMessage(callbackParams: VNPayCallbackParams): string {
  const responseCode = callbackParams.vnp_ResponseCode;

  const messages: { [key: string]: string } = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
  };

  return messages[responseCode] || 'Giao dịch không thành công do lỗi không xác định';
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'PAID':
      return '#10B981'; // Green
    case 'PENDING':
      return '#F59E0B'; // Yellow
    case 'FAILED':
      return '#DC2626'; // Red
    case 'CANCELLED':
      return '#6B7280'; // Gray
    case 'REFUNDED':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Get payment status text for display
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'PENDING':
      return 'Đang chờ thanh toán';
    case 'FAILED':
      return 'Thanh toán thất bại';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    default:
      return 'Không xác định';
  }
}

/**
 * Get payment method icon name
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  switch (method) {
    case 'VNPAY':
      return 'account-balance-wallet';
    case 'CREDIT_CARD':
      return 'credit-card';
    case 'BANK_TRANSFER':
      return 'account-balance';
    case 'CASH':
      return 'money';
    default:
      return 'payment';
  }
}
