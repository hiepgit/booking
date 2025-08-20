import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { requireAuth } from '../security/requireAuth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = Router();

/**
 * @openapi
 * /payments/vnpay/create:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create VNPay payment URL
 *     description: Create a VNPay payment URL for an appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: ID of the appointment to pay for
 *                 example: "clp123456789"
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *                 description: Custom return URL after payment (optional)
 *                 example: "https://myapp.com/payment/result"
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl:
 *                       type: string
 *                       format: uri
 *                       description: VNPay payment URL
 *                       example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "clp987654321"
 *                         amount:
 *                           type: number
 *                           example: 350000
 *                         status:
 *                           type: string
 *                           enum: [PENDING, PAID, FAILED, REFUNDED]
 *                           example: "PENDING"
 *                         method:
 *                           type: string
 *                           enum: [VNPAY, MOMO, CASH, BANK_TRANSFER]
 *                           example: "VNPAY"
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "clp123456789"
 *                         appointmentDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         startTime:
 *                           type: string
 *                           example: "09:00"
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Dr. Nguyen Van A"
 *                             specialty:
 *                               type: string
 *                               example: "Cardiology"
 *       400:
 *         description: Bad request - validation error or invalid appointment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Appointment is already paid"
 *                     code:
 *                       type: string
 *                       example: "ALREADY_PAID"
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/vnpay/create', requireAuth, authRateLimit, PaymentController.createVNPayPayment);

/**
 * @openapi
 * /payments/vnpay/callback:
 *   get:
 *     tags:
 *       - Payments
 *     summary: VNPay payment callback
 *     description: Handle VNPay payment callback (return URL)
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment amount in VND cents
 *       - in: query
 *         name: vnp_BankCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank code
 *       - in: query
 *         name: vnp_BankTranNo
 *         schema:
 *           type: string
 *         description: Bank transaction number
 *       - in: query
 *         name: vnp_CardType
 *         required: true
 *         schema:
 *           type: string
 *         description: Card type
 *       - in: query
 *         name: vnp_OrderInfo
 *         required: true
 *         schema:
 *           type: string
 *         description: Order information
 *       - in: query
 *         name: vnp_PayDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment date (yyyyMMddHHmmss)
 *       - in: query
 *         name: vnp_ResponseCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Response code (00 = success)
 *       - in: query
 *         name: vnp_TmnCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal code
 *       - in: query
 *         name: vnp_TransactionNo
 *         required: true
 *         schema:
 *           type: string
 *         description: VNPay transaction number
 *       - in: query
 *         name: vnp_TransactionStatus
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction status
 *       - in: query
 *         name: vnp_TxnRef
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference (appointment ID)
 *       - in: query
 *         name: vnp_SecureHash
 *         required: true
 *         schema:
 *           type: string
 *         description: Secure hash for verification
 *     responses:
 *       302:
 *         description: Redirect to frontend with payment result
 */
router.get('/vnpay/callback', PaymentController.handleVNPayCallback);

/**
 * @openapi
 * /payments/vnpay/ipn:
 *   post:
 *     tags:
 *       - Payments
 *     summary: VNPay IPN (Instant Payment Notification)
 *     description: Handle VNPay IPN webhook for payment status updates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vnp_Amount
 *               - vnp_BankCode
 *               - vnp_CardType
 *               - vnp_OrderInfo
 *               - vnp_PayDate
 *               - vnp_ResponseCode
 *               - vnp_TmnCode
 *               - vnp_TransactionNo
 *               - vnp_TransactionStatus
 *               - vnp_TxnRef
 *               - vnp_SecureHash
 *             properties:
 *               vnp_Amount:
 *                 type: string
 *               vnp_BankCode:
 *                 type: string
 *               vnp_BankTranNo:
 *                 type: string
 *               vnp_CardType:
 *                 type: string
 *               vnp_OrderInfo:
 *                 type: string
 *               vnp_PayDate:
 *                 type: string
 *               vnp_ResponseCode:
 *                 type: string
 *               vnp_TmnCode:
 *                 type: string
 *               vnp_TransactionNo:
 *                 type: string
 *               vnp_TransactionStatus:
 *                 type: string
 *               vnp_TxnRef:
 *                 type: string
 *               vnp_SecureHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: IPN processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RspCode:
 *                   type: string
 *                   example: "00"
 *                 Message:
 *                   type: string
 *                   example: "success"
 */
router.post('/vnpay/ipn', PaymentController.handleVNPayIPN);

/**
 * @openapi
 * /payments/{paymentId}/status:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment status
 *     description: Get the current status of a payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *         example: "clp987654321"
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clp987654321"
 *                     amount:
 *                       type: number
 *                       example: 350000
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PAID, FAILED, REFUNDED]
 *                       example: "PAID"
 *                     method:
 *                       type: string
 *                       enum: [VNPAY, MOMO, CASH, BANK_TRANSFER]
 *                       example: "VNPAY"
 *                     transactionId:
 *                       type: string
 *                       example: "14123456"
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:25:00Z"
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "clp123456789"
 *                         appointmentDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         startTime:
 *                           type: string
 *                           example: "09:00"
 *                         status:
 *                           type: string
 *                           example: "CONFIRMED"
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Dr. Nguyen Van A"
 *                             specialty:
 *                               type: string
 *                               example: "Cardiology"
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:paymentId/status', requireAuth, PaymentController.getPaymentStatus);

export default router;
