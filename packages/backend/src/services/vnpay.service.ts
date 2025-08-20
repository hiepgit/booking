import crypto from 'crypto';
import { loadEnv } from '../config/env.js';
import { prisma } from '../libs/prisma.js';
import type { PaymentStatus, PaymentMethod } from '@prisma/client';

const env = loadEnv();

export interface VNPayPaymentData {
  appointmentId: string;
  amount: number;
  orderInfo: string;
  returnUrl?: string;
  ipnUrl?: string;
}

export interface VNPayCallbackData {
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
  [key: string]: string;
}

export class VNPayService {
  private static readonly VERSION = '2.1.0';
  private static readonly COMMAND = 'pay';
  private static readonly CURRENCY_CODE = 'VND';
  private static readonly LOCALE = 'vn';

  /**
   * Create VNPay payment URL
   */
  static createPaymentUrl(data: VNPayPaymentData): string {
    const createDate = this.formatDate(new Date());
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

    const vnpParams: Record<string, string> = {
      vnp_Version: this.VERSION,
      vnp_Command: this.COMMAND,
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Amount: (data.amount * 100).toString(), // VNPay expects amount in VND cents
      vnp_CurrCode: this.CURRENCY_CODE,
      vnp_TxnRef: data.appointmentId,
      vnp_OrderInfo: data.orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: this.LOCALE,
      vnp_ReturnUrl: data.returnUrl || env.VNPAY_RETURN_URL,
      vnp_IpnUrl: data.ipnUrl || env.VNPAY_IPN_URL,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sort parameters
    const sortedParams = this.sortParams(vnpParams);
    
    // Create query string
    const queryString = this.createQueryString(sortedParams);
    
    // Create secure hash
    const secureHash = this.createSecureHash(queryString);
    
    // Add secure hash to params
    sortedParams.vnp_SecureHash = secureHash;
    
    // Create final query string with hash
    const finalQueryString = this.createQueryString(sortedParams);
    
    return `${env.VNPAY_URL}?${finalQueryString}`;
  }

  /**
   * Verify VNPay callback signature
   */
  static verifyCallback(callbackData: VNPayCallbackData): boolean {
    const { vnp_SecureHash, ...params } = callbackData;
    
    // Sort parameters
    const sortedParams = this.sortParams(params);
    
    // Create query string
    const queryString = this.createQueryString(sortedParams);
    
    // Create secure hash
    const expectedHash = this.createSecureHash(queryString);
    
    return vnp_SecureHash === expectedHash;
  }

  /**
   * Process VNPay callback
   */
  static async processCallback(callbackData: VNPayCallbackData) {
    try {
      // Verify signature
      if (!this.verifyCallback(callbackData)) {
        throw new Error('Invalid VNPay signature');
      }

      const appointmentId = callbackData.vnp_TxnRef;
      const amount = parseInt(callbackData.vnp_Amount) / 100; // Convert from cents
      const responseCode = callbackData.vnp_ResponseCode;
      const transactionNo = callbackData.vnp_TransactionNo;
      const bankTranNo = callbackData.vnp_BankTranNo;
      const payDate = this.parseVNPayDate(callbackData.vnp_PayDate);

      // Determine payment status
      const paymentStatus: PaymentStatus = responseCode === '00' ? 'PAID' : 'FAILED';

      // Find appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          payment: true,
          patient: {
            include: { user: true }
          },
          doctor: {
            include: { user: true }
          }
        }
      });

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      // Update or create payment record
      const paymentData = {
        amount: amount,
        method: 'VNPAY' as PaymentMethod,
        status: paymentStatus,
        transactionId: transactionNo,
        gatewayTransactionId: bankTranNo,
        gatewayResponse: JSON.stringify(callbackData),
        paidAt: paymentStatus === 'PAID' ? payDate : null,
      };

      let payment;
      if (appointment.payment) {
        // Update existing payment
        payment = await prisma.payment.update({
          where: { id: appointment.payment.id },
          data: paymentData
        });
      } else {
        // Create new payment
        payment = await prisma.payment.create({
          data: {
            ...paymentData,
            appointmentId: appointmentId,
            patientId: appointment.patientId,
          }
        });
      }

      // Update appointment status if payment successful
      if (paymentStatus === 'PAID') {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: 'CONFIRMED' }
        });
      }

      return {
        success: paymentStatus === 'PAID',
        payment,
        appointment,
        message: paymentStatus === 'PAID' ? 'Payment successful' : 'Payment failed'
      };

    } catch (error) {
      console.error('VNPay callback processing error:', error);
      throw error;
    }
  }

  /**
   * Sort parameters alphabetically
   */
  private static sortParams(params: Record<string, string>): Record<string, string> {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams: Record<string, string> = {};
    
    for (const key of sortedKeys) {
      if (params[key] && params[key] !== '') {
        sortedParams[key] = params[key];
      }
    }
    
    return sortedParams;
  }

  /**
   * Create query string from parameters
   */
  private static createQueryString(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  }

  /**
   * Create secure hash using HMAC SHA512
   */
  private static createSecureHash(data: string): string {
    return crypto
      .createHmac('sha512', env.VNPAY_HASH_SECRET)
      .update(data)
      .digest('hex');
  }

  /**
   * Format date for VNPay (yyyyMMddHHmmss)
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Parse VNPay date format (yyyyMMddHHmmss)
   */
  private static parseVNPayDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateString.substring(6, 8));
    const hours = parseInt(dateString.substring(8, 10));
    const minutes = parseInt(dateString.substring(10, 12));
    const seconds = parseInt(dateString.substring(12, 14));
    
    return new Date(year, month, day, hours, minutes, seconds);
  }
}
