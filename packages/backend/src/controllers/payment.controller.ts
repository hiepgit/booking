import type { Request, Response } from 'express';
import { z } from 'zod';
import { VNPayService, type VNPayCallbackData } from '../services/vnpay.service.js';
import { RealtimeNotificationService } from '../services/realtime-notification.service.js';
import { prisma } from '../libs/prisma.js';

// Validation schemas
const CreatePaymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  returnUrl: z.string().url().optional(),
});

const VNPayCallbackSchema = z.object({
  vnp_Amount: z.string(),
  vnp_BankCode: z.string(),
  vnp_BankTranNo: z.string().optional(),
  vnp_CardType: z.string(),
  vnp_OrderInfo: z.string(),
  vnp_PayDate: z.string(),
  vnp_ResponseCode: z.string(),
  vnp_TmnCode: z.string(),
  vnp_TransactionNo: z.string(),
  vnp_TransactionStatus: z.string(),
  vnp_TxnRef: z.string(),
  vnp_SecureHash: z.string(),
});

export class PaymentController {
  /**
   * Create VNPay payment URL
   * POST /payments/vnpay/create
   */
  static async createVNPayPayment(req: Request, res: Response) {
    try {
      const { appointmentId, returnUrl } = CreatePaymentSchema.parse(req.body);
      const userId = req.user.sub;

      // Find appointment and verify ownership
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patient: {
            userId: userId
          }
        },
        include: {
          doctor: {
            include: {
              user: true,
              specialty: true
            }
          },
          clinic: true,
          payment: true
        }
      });

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found or access denied',
            code: 'APPOINTMENT_NOT_FOUND'
          }
        });
      }

      // Check if appointment is already paid
      if (appointment.payment?.status === 'PAID') {
        return res.status(400).json({
          error: {
            message: 'Appointment is already paid',
            code: 'ALREADY_PAID'
          }
        });
      }

      // Check if appointment is in valid status for payment
      if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
        return res.status(400).json({
          error: {
            message: 'Appointment is not in valid status for payment',
            code: 'INVALID_APPOINTMENT_STATUS'
          }
        });
      }

      // Calculate amount (consultation fee)
      const amount = parseFloat(appointment.doctor.consultationFee.toString());

      // Create order info
      const orderInfo = `Thanh toan kham benh - BS ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} - ${appointment.doctor.specialty.name}`;

      // Create payment URL
      const paymentUrl = VNPayService.createPaymentUrl({
        appointmentId: appointment.id,
        amount: amount,
        orderInfo: orderInfo,
        returnUrl: returnUrl
      });

      // Create or update payment record with PENDING status
      const paymentData = {
        amount: amount,
        method: 'VNPAY' as const,
        status: 'PENDING' as const,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
      };

      let payment;
      if (appointment.payment) {
        payment = await prisma.payment.update({
          where: { id: appointment.payment.id },
          data: paymentData
        });
      } else {
        payment = await prisma.payment.create({
          data: paymentData
        });
      }

      res.json({
        success: true,
        data: {
          paymentUrl,
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method
          },
          appointment: {
            id: appointment.id,
            appointmentDate: appointment.appointmentDate,
            startTime: appointment.startTime,
            doctor: {
              name: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
              specialty: appointment.doctor.specialty.name
            }
          }
        }
      });

    } catch (error) {
      console.error('Create VNPay payment error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          message: 'Failed to create payment',
          code: 'PAYMENT_CREATION_FAILED'
        }
      });
    }
  }

  /**
   * Handle VNPay callback (return URL)
   * GET /payments/vnpay/callback
   */
  static async handleVNPayCallback(req: Request, res: Response) {
    try {
      const callbackData = VNPayCallbackSchema.parse(req.query) as VNPayCallbackData;
      
      const result = await VNPayService.processCallback(callbackData);

      // Send real-time notification
      if (result.success) {
        await RealtimeNotificationService.handlePaymentStatusChange(
          result.appointment.id,
          'SUCCESS',
          result.payment.amount
        );
      } else {
        await RealtimeNotificationService.handlePaymentStatusChange(
          result.appointment.id,
          'FAILED'
        );
      }

      // Redirect to frontend with result
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/result?success=${result.success}&appointmentId=${result.appointment.id}&message=${encodeURIComponent(result.message)}`;
      
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('VNPay callback error:', error);
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/result?success=false&message=${encodeURIComponent('Payment processing failed')}`;
      
      res.redirect(redirectUrl);
    }
  }

  /**
   * Handle VNPay IPN (Instant Payment Notification)
   * POST /payments/vnpay/ipn
   */
  static async handleVNPayIPN(req: Request, res: Response) {
    try {
      const callbackData = VNPayCallbackSchema.parse(req.body) as VNPayCallbackData;
      
      const result = await VNPayService.processCallback(callbackData);

      // Send real-time notification
      if (result.success) {
        await RealtimeNotificationService.handlePaymentStatusChange(
          result.appointment.id,
          'SUCCESS',
          result.payment.amount
        );
      }

      // Respond to VNPay
      res.json({
        RspCode: '00',
        Message: 'success'
      });

    } catch (error) {
      console.error('VNPay IPN error:', error);
      
      // Respond to VNPay with error
      res.json({
        RspCode: '99',
        Message: 'error'
      });
    }
  }

  /**
   * Get payment status
   * GET /payments/:paymentId/status
   */
  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.sub;

      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          patient: {
            userId: userId
          }
        },
        include: {
          appointment: {
            include: {
              doctor: {
                include: {
                  user: true,
                  specialty: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        return res.status(404).json({
          error: {
            message: 'Payment not found',
            code: 'PAYMENT_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          appointment: {
            id: payment.appointment.id,
            appointmentDate: payment.appointment.appointmentDate,
            startTime: payment.appointment.startTime,
            status: payment.appointment.status,
            doctor: {
              name: `${payment.appointment.doctor.user.firstName} ${payment.appointment.doctor.user.lastName}`,
              specialty: payment.appointment.doctor.specialty.name
            }
          }
        }
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      
      res.status(500).json({
        error: {
          message: 'Failed to get payment status',
          code: 'GET_PAYMENT_STATUS_FAILED'
        }
      });
    }
  }
}
