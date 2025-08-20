import { Linking, Alert } from 'react-native';
import { 
  parseVNPayCallback, 
  isVNPayPaymentSuccessful, 
  getVNPayPaymentMessage,
  VNPayCallbackParams 
} from './payments.service';

export interface VNPayConfig {
  returnUrl: string;
  cancelUrl?: string;
}

export interface VNPayCallbackHandler {
  onSuccess: (params: VNPayCallbackParams) => void;
  onFailure: (params: VNPayCallbackParams, message: string) => void;
  onCancel: (params: VNPayCallbackParams) => void;
}

export class VNPayService {
  private static instance: VNPayService;
  private callbackHandler: VNPayCallbackHandler | null = null;
  private isListening = false;

  private constructor() {}

  static getInstance(): VNPayService {
    if (!VNPayService.instance) {
      VNPayService.instance = new VNPayService();
    }
    return VNPayService.instance;
  }

  /**
   * Initialize VNPay service with deep link listener
   */
  initialize(config: VNPayConfig): void {
    console.log('🏦 Initializing VNPay service with config:', config);
    
    if (!this.isListening) {
      this.setupDeepLinkListener();
      this.isListening = true;
    }
  }

  /**
   * Setup deep link listener for VNPay callbacks
   */
  private setupDeepLinkListener(): void {
    // Listen for deep link events
    const handleDeepLink = (event: { url: string }): void => {
      console.log('🔗 VNPay deep link received:', event.url);
      this.handleCallback(event.url);
    };

    Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 VNPay initial URL:', url);
        this.handleCallback(url);
      }
    }).catch((error) => {
      console.error('❌ Error getting initial URL:', error);
    });
  }

  /**
   * Set callback handler for VNPay results
   */
  setCallbackHandler(handler: VNPayCallbackHandler): void {
    this.callbackHandler = handler;
  }

  /**
   * Clear callback handler
   */
  clearCallbackHandler(): void {
    this.callbackHandler = null;
  }

  /**
   * Handle VNPay callback URL
   */
  private handleCallback(url: string): void {
    const callbackParams = parseVNPayCallback(url);
    
    if (!callbackParams) {
      console.log('⚠️ Not a VNPay callback URL:', url);
      return;
    }

    console.log('💳 Processing VNPay callback:', {
      txnRef: callbackParams.vnp_TxnRef,
      responseCode: callbackParams.vnp_ResponseCode,
      transactionStatus: callbackParams.vnp_TransactionStatus
    });

    if (!this.callbackHandler) {
      console.warn('⚠️ No callback handler set for VNPay result');
      this.showDefaultAlert(callbackParams);
      return;
    }

    const isSuccessful = isVNPayPaymentSuccessful(callbackParams);
    const message = getVNPayPaymentMessage(callbackParams);

    if (isSuccessful) {
      this.callbackHandler.onSuccess(callbackParams);
    } else if (callbackParams.vnp_ResponseCode === '24') {
      // User cancelled payment
      this.callbackHandler.onCancel(callbackParams);
    } else {
      this.callbackHandler.onFailure(callbackParams, message);
    }
  }

  /**
   * Show default alert when no callback handler is set
   */
  private showDefaultAlert(callbackParams: VNPayCallbackParams): void {
    const isSuccessful = isVNPayPaymentSuccessful(callbackParams);
    const message = getVNPayPaymentMessage(callbackParams);

    Alert.alert(
      isSuccessful ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      message,
      [{ text: 'OK' }]
    );
  }

  /**
   * Open VNPay payment URL
   */
  async openPaymentUrl(paymentUrl: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🌐 Opening VNPay payment URL');
      
      const supported = await Linking.canOpenURL(paymentUrl);
      
      if (!supported) {
        return {
          success: false,
          error: 'Cannot open VNPay payment URL'
        };
      }

      await Linking.openURL(paymentUrl);
      
      console.log('✅ VNPay payment URL opened successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Error opening VNPay payment URL:', error);
      return {
        success: false,
        error: error.message || 'Failed to open payment URL'
      };
    }
  }

  /**
   * Validate VNPay callback parameters
   */
  validateCallback(params: VNPayCallbackParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required parameters
    if (!params.vnp_TxnRef) {
      errors.push('Missing transaction reference');
    }

    if (!params.vnp_Amount) {
      errors.push('Missing amount');
    }

    if (!params.vnp_ResponseCode) {
      errors.push('Missing response code');
    }

    if (!params.vnp_TransactionStatus) {
      errors.push('Missing transaction status');
    }

    if (!params.vnp_SecureHash) {
      errors.push('Missing secure hash');
    }

    // Validate amount format
    if (params.vnp_Amount && !/^\d+$/.test(params.vnp_Amount)) {
      errors.push('Invalid amount format');
    }

    // Validate response code format
    if (params.vnp_ResponseCode && !/^\d{2}$/.test(params.vnp_ResponseCode)) {
      errors.push('Invalid response code format');
    }

    // Validate transaction status format
    if (params.vnp_TransactionStatus && !/^\d{2}$/.test(params.vnp_TransactionStatus)) {
      errors.push('Invalid transaction status format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get payment amount from VNPay callback (convert from VND cents to VND)
   */
  getPaymentAmount(params: VNPayCallbackParams): number {
    const amountInCents = parseInt(params.vnp_Amount, 10);
    return amountInCents / 100; // VNPay returns amount in cents
  }

  /**
   * Get formatted payment date from VNPay callback
   */
  getPaymentDate(params: VNPayCallbackParams): Date | null {
    if (!params.vnp_PayDate) {
      return null;
    }

    try {
      // VNPay date format: yyyyMMddHHmmss
      const dateStr = params.vnp_PayDate;
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8), 10);
      const hour = parseInt(dateStr.substring(8, 10), 10);
      const minute = parseInt(dateStr.substring(10, 12), 10);
      const second = parseInt(dateStr.substring(12, 14), 10);

      return new Date(year, month, day, hour, minute, second);
    } catch (error) {
      console.error('❌ Error parsing VNPay payment date:', error);
      return null;
    }
  }

  /**
   * Check if payment was cancelled by user
   */
  isPaymentCancelled(params: VNPayCallbackParams): boolean {
    return params.vnp_ResponseCode === '24';
  }

  /**
   * Check if payment failed due to insufficient funds
   */
  isInsufficientFunds(params: VNPayCallbackParams): boolean {
    return params.vnp_ResponseCode === '51';
  }

  /**
   * Check if payment failed due to card/account issues
   */
  isCardAccountIssue(params: VNPayCallbackParams): boolean {
    const cardIssues = ['09', '10', '12', '13', '79'];
    return cardIssues.includes(params.vnp_ResponseCode);
  }

  /**
   * Check if payment failed due to timeout
   */
  isPaymentTimeout(params: VNPayCallbackParams): boolean {
    return params.vnp_ResponseCode === '11';
  }

  /**
   * Get user-friendly error category
   */
  getErrorCategory(params: VNPayCallbackParams): string {
    if (this.isPaymentCancelled(params)) {
      return 'CANCELLED';
    } else if (this.isInsufficientFunds(params)) {
      return 'INSUFFICIENT_FUNDS';
    } else if (this.isCardAccountIssue(params)) {
      return 'CARD_ACCOUNT_ISSUE';
    } else if (this.isPaymentTimeout(params)) {
      return 'TIMEOUT';
    } else {
      return 'OTHER';
    }
  }

  /**
   * Cleanup VNPay service
   */
  cleanup(): void {
    console.log('🧹 Cleaning up VNPay service');
    
    this.callbackHandler = null;
    
    if (this.isListening) {
      Linking.removeAllListeners('url');
      this.isListening = false;
    }
  }

  /**
   * Get VNPay transaction info for display
   */
  getTransactionInfo(params: VNPayCallbackParams): {
    transactionId: string;
    amount: number;
    bankCode: string;
    cardType: string;
    paymentDate: Date | null;
    isSuccessful: boolean;
    message: string;
    category: string;
  } {
    return {
      transactionId: params.vnp_TransactionNo || params.vnp_TxnRef,
      amount: this.getPaymentAmount(params),
      bankCode: params.vnp_BankCode,
      cardType: params.vnp_CardType,
      paymentDate: this.getPaymentDate(params),
      isSuccessful: isVNPayPaymentSuccessful(params),
      message: getVNPayPaymentMessage(params),
      category: this.getErrorCategory(params)
    };
  }
}

// Export singleton instance
export const vnpayService = VNPayService.getInstance();

// Export convenience functions
export const initializeVNPay = (config: VNPayConfig): void => {
  vnpayService.initialize(config);
};

export const setVNPayCallbackHandler = (handler: VNPayCallbackHandler): void => {
  vnpayService.setCallbackHandler(handler);
};

export const clearVNPayCallbackHandler = (): void => {
  vnpayService.clearCallbackHandler();
};

export const openVNPayPayment = (paymentUrl: string): Promise<{ success: boolean; error?: string }> => {
  return vnpayService.openPaymentUrl(paymentUrl);
};

export const cleanupVNPay = (): void => {
  vnpayService.cleanup();
};
