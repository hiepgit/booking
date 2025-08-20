import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VNPayService } from '../services/vnpay.service.js';
import type { VNPayPaymentData, VNPayCallbackData } from '../services/vnpay.service.js';

// Mock environment variables
vi.mock('../config/env.js', () => ({
  loadEnv: () => ({
    VNPAY_TMN_CODE: 'TEST_TMN_CODE',
    VNPAY_HASH_SECRET: 'TEST_HASH_SECRET',
    VNPAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    VNPAY_RETURN_URL: 'https://test.com/callback',
    VNPAY_IPN_URL: 'https://test.com/ipn',
  })
}));

// Mock prisma
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    appointment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      update: vi.fn(),
    }
  }
}));

describe('VNPayService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentUrl', () => {
    it('should create a valid VNPay payment URL', () => {
      const paymentData: VNPayPaymentData = {
        appointmentId: 'test-appointment-id',
        amount: 350000,
        orderInfo: 'Test payment for appointment',
      };

      const paymentUrl = VNPayService.createPaymentUrl(paymentData);

      expect(paymentUrl).toContain('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
      expect(paymentUrl).toContain('vnp_TmnCode=TEST_TMN_CODE');
      expect(paymentUrl).toContain('vnp_Amount=35000000'); // Amount in cents
      expect(paymentUrl).toContain('vnp_TxnRef=test-appointment-id');
      expect(paymentUrl).toContain('vnp_OrderInfo=Test%20payment%20for%20appointment');
      expect(paymentUrl).toContain('vnp_SecureHash=');
    });

    it('should use custom return URL when provided', () => {
      const paymentData: VNPayPaymentData = {
        appointmentId: 'test-appointment-id',
        amount: 350000,
        orderInfo: 'Test payment',
        returnUrl: 'https://custom.com/return',
      };

      const paymentUrl = VNPayService.createPaymentUrl(paymentData);

      expect(paymentUrl).toContain('vnp_ReturnUrl=https%3A%2F%2Fcustom.com%2Freturn');
    });

    it('should convert amount to VND cents correctly', () => {
      const paymentData: VNPayPaymentData = {
        appointmentId: 'test-appointment-id',
        amount: 100000, // 100,000 VND
        orderInfo: 'Test payment',
      };

      const paymentUrl = VNPayService.createPaymentUrl(paymentData);

      expect(paymentUrl).toContain('vnp_Amount=10000000'); // 100,000 * 100 = 10,000,000 cents
    });
  });

  describe('verifyCallback', () => {
    it('should verify valid callback signature', () => {
      // Create a mock callback with known parameters
      const mockCallback: VNPayCallbackData = {
        vnp_Amount: '35000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: '20240101123456',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
        vnp_PayDate: '20240101123000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN_CODE',
        vnp_TransactionNo: '14123456',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'test-appointment-id',
        vnp_SecureHash: 'mock-hash', // This would be calculated in real scenario
      };

      // Mock the hash verification to return true for this test
      const originalCreateSecureHash = (VNPayService as any).createSecureHash;
      (VNPayService as any).createSecureHash = vi.fn().mockReturnValue('mock-hash');

      const isValid = VNPayService.verifyCallback(mockCallback);

      expect(isValid).toBe(true);

      // Restore original method
      (VNPayService as any).createSecureHash = originalCreateSecureHash;
    });

    it('should reject invalid callback signature', () => {
      const mockCallback: VNPayCallbackData = {
        vnp_Amount: '35000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: '20240101123456',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
        vnp_PayDate: '20240101123000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN_CODE',
        vnp_TransactionNo: '14123456',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'test-appointment-id',
        vnp_SecureHash: 'invalid-hash',
      };

      // Mock the hash verification to return different hash
      const originalCreateSecureHash = (VNPayService as any).createSecureHash;
      (VNPayService as any).createSecureHash = vi.fn().mockReturnValue('correct-hash');

      const isValid = VNPayService.verifyCallback(mockCallback);

      expect(isValid).toBe(false);

      // Restore original method
      (VNPayService as any).createSecureHash = originalCreateSecureHash;
    });
  });

  describe('formatDate', () => {
    it('should format date correctly for VNPay', () => {
      const testDate = new Date('2024-01-15T10:30:45');
      const formatted = (VNPayService as any).formatDate(testDate);

      expect(formatted).toBe('20240115103045');
    });

    it('should pad single digits with zeros', () => {
      const testDate = new Date('2024-01-05T09:05:05');
      const formatted = (VNPayService as any).formatDate(testDate);

      expect(formatted).toBe('20240105090505');
    });
  });

  describe('parseVNPayDate', () => {
    it('should parse VNPay date format correctly', () => {
      const vnpayDate = '20240115103045';
      const parsed = (VNPayService as any).parseVNPayDate(vnpayDate);

      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // January (0-indexed)
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getHours()).toBe(10);
      expect(parsed.getMinutes()).toBe(30);
      expect(parsed.getSeconds()).toBe(45);
    });
  });

  describe('sortParams', () => {
    it('should sort parameters alphabetically', () => {
      const params = {
        vnp_Version: '2.1.0',
        vnp_Amount: '35000000',
        vnp_Command: 'pay',
        vnp_TmnCode: 'TEST_TMN_CODE',
      };

      const sorted = (VNPayService as any).sortParams(params);
      const keys = Object.keys(sorted);

      expect(keys).toEqual(['vnp_Amount', 'vnp_Command', 'vnp_TmnCode', 'vnp_Version']);
    });

    it('should exclude empty values', () => {
      const params = {
        vnp_Version: '2.1.0',
        vnp_Amount: '35000000',
        vnp_EmptyField: '',
        vnp_NullField: null as any,
        vnp_Command: 'pay',
      };

      const sorted = (VNPayService as any).sortParams(params);

      expect(sorted).not.toHaveProperty('vnp_EmptyField');
      expect(sorted).not.toHaveProperty('vnp_NullField');
      expect(sorted).toHaveProperty('vnp_Version');
      expect(sorted).toHaveProperty('vnp_Amount');
      expect(sorted).toHaveProperty('vnp_Command');
    });
  });

  describe('createQueryString', () => {
    it('should create properly encoded query string', () => {
      const params = {
        vnp_OrderInfo: 'Test payment with special chars: &=?',
        vnp_Amount: '35000000',
        vnp_Command: 'pay',
      };

      const queryString = (VNPayService as any).createQueryString(params);

      expect(queryString).toContain('vnp_OrderInfo=Test%20payment%20with%20special%20chars%3A%20%26%3D%3F');
      expect(queryString).toContain('vnp_Amount=35000000');
      expect(queryString).toContain('vnp_Command=pay');
      expect(queryString).toContain('&');
    });
  });
});
