import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createServer } from '../app.js';
import { prisma } from '../libs/prisma.js';
import { signAccessToken } from '../services/jwt.service.js';
import type { Express } from 'express';

describe('Payment Integration Tests', () => {
  let app: Express;
  let testUserId: string;
  let testPatientId: string;
  let testDoctorId: string;
  let testAppointmentId: string;
  let authToken: string;

  beforeEach(async () => {
    const { app: testApp } = createServer();
    app = testApp;

    // Create test user (patient)
    const testUser = await prisma.user.create({
      data: {
        email: 'test-patient@example.com',
        passwordHash: 'hashed-password',
        firstName: 'Test',
        lastName: 'Patient',
        role: 'PATIENT',
        isVerified: true,
      }
    });
    testUserId = testUser.id;

    // Create test patient
    const testPatient = await prisma.patient.create({
      data: {
        userId: testUserId,
      }
    });
    testPatientId = testPatient.id;

    // Create test doctor user
    const testDoctorUser = await prisma.user.create({
      data: {
        email: 'test-doctor@example.com',
        passwordHash: 'hashed-password',
        firstName: 'Test',
        lastName: 'Doctor',
        role: 'DOCTOR',
        isVerified: true,
      }
    });

    // Create test specialty
    const testSpecialty = await prisma.specialty.create({
      data: {
        name: 'Test Specialty',
        description: 'Test specialty description',
      }
    });

    // Create test doctor
    const testDoctor = await prisma.doctor.create({
      data: {
        userId: testDoctorUser.id,
        licenseNumber: 'TEST-LICENSE-123',
        specialtyId: testSpecialty.id,
        experience: 5,
        consultationFee: 350000,
        isAvailable: true,
      }
    });
    testDoctorId = testDoctor.id;

    // Create test appointment
    const testAppointment = await prisma.appointment.create({
      data: {
        patientId: testPatientId,
        doctorId: testDoctorId,
        appointmentDate: new Date('2024-12-25'),
        startTime: '09:00',
        endTime: '09:30',
        type: 'OFFLINE',
        status: 'PENDING',
        symptoms: 'Test symptoms',
      }
    });
    testAppointmentId = testAppointment.id;

    // Generate auth token
    authToken = signAccessToken({
      sub: testUserId as any,
      email: 'test@example.com',
      role: 'PATIENT'
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.specialty.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('POST /payments/vnpay/create', () => {
    it('should create VNPay payment URL successfully', async () => {
      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appointmentId: testAppointmentId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentUrl');
      expect(response.body.data.paymentUrl).toContain('sandbox.vnpayment.vn');
      expect(response.body.data.paymentUrl).toContain('vnp_TmnCode=00LSAFK3');
      expect(response.body.data.paymentUrl).toContain('vnp_Amount=35000000'); // 350,000 * 100
      expect(response.body.data.paymentUrl).toContain(`vnp_TxnRef=${testAppointmentId}`);

      expect(response.body.data.payment).toHaveProperty('id');
      expect(response.body.data.payment.amount).toBe(350000);
      expect(response.body.data.payment.status).toBe('PENDING');
      expect(response.body.data.payment.method).toBe('VNPAY');

      expect(response.body.data.appointment).toHaveProperty('id', testAppointmentId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/payments/vnpay/create')
        .send({
          appointmentId: testAppointmentId,
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appointmentId: 'non-existent-id',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('APPOINTMENT_NOT_FOUND');
    });

    it('should return 400 for already paid appointment', async () => {
      // Create a payment for the appointment first
      await prisma.payment.create({
        data: {
          appointmentId: testAppointmentId,
          patientId: testPatientId,
          amount: 350000,
          method: 'VNPAY',
          status: 'PAID',
          transactionId: 'test-transaction-id',
        }
      });

      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appointmentId: testAppointmentId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_PAID');
    });

    it('should return 400 for invalid appointment status', async () => {
      // Update appointment to cancelled status
      await prisma.appointment.update({
        where: { id: testAppointmentId },
        data: { status: 'CANCELLED' }
      });

      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appointmentId: testAppointmentId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_APPOINTMENT_STATUS');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing appointmentId
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept custom return URL', async () => {
      const customReturnUrl = 'https://custom.com/payment/result';

      const response = await request(app)
        .post('/payments/vnpay/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          appointmentId: testAppointmentId,
          returnUrl: customReturnUrl,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.paymentUrl).toContain(encodeURIComponent(customReturnUrl));
    });
  });

  describe('GET /payments/:paymentId/status', () => {
    let testPaymentId: string;

    beforeEach(async () => {
      const testPayment = await prisma.payment.create({
        data: {
          appointmentId: testAppointmentId,
          patientId: testPatientId,
          amount: 350000,
          method: 'VNPAY',
          status: 'PAID',
          transactionId: 'test-transaction-id',
          paidAt: new Date(),
        }
      });
      testPaymentId = testPayment.id;
    });

    it('should get payment status successfully', async () => {
      const response = await request(app)
        .get(`/payments/${testPaymentId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testPaymentId);
      expect(response.body.data.amount).toBe(350000);
      expect(response.body.data.status).toBe('PAID');
      expect(response.body.data.method).toBe('VNPAY');
      expect(response.body.data.transactionId).toBe('test-transaction-id');
      expect(response.body.data).toHaveProperty('paidAt');
      expect(response.body.data).toHaveProperty('createdAt');

      expect(response.body.data.appointment).toHaveProperty('id', testAppointmentId);
      expect(response.body.data.appointment.doctor).toHaveProperty('name');
      expect(response.body.data.appointment.doctor).toHaveProperty('specialty');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/payments/${testPaymentId}/status`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/payments/non-existent-id/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('PAYMENT_NOT_FOUND');
    });
  });

  describe('GET /payments/vnpay/callback', () => {
    it('should handle successful payment callback', async () => {
      // Create a pending payment first
      await prisma.payment.create({
        data: {
          appointmentId: testAppointmentId,
          patientId: testPatientId,
          amount: 350000,
          method: 'VNPAY',
          status: 'PENDING',
        }
      });

      // Mock VNPay callback parameters (successful payment)
      const callbackParams = {
        vnp_Amount: '35000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: '20241225123456',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
        vnp_PayDate: '20241225090000',
        vnp_ResponseCode: '00', // Success code
        vnp_TmnCode: '00LSAFK3',
        vnp_TransactionNo: '14123456',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: testAppointmentId,
        vnp_SecureHash: 'mock-hash', // This would be calculated properly in real scenario
      };

      // Mock VNPay service verification
      vi.mock('../services/vnpay.service.js', () => ({
        VNPayService: {
          verifyCallback: vi.fn().mockReturnValue(true),
          processCallback: vi.fn().mockResolvedValue({
            success: true,
            payment: { id: 'payment-id', amount: 350000 },
            appointment: { id: 'test-appointment-id' },
            message: 'Payment successful'
          })
        }
      }));

      const response = await request(app)
        .get('/payments/vnpay/callback')
        .query(callbackParams);

      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toContain('success=true');
      expect(response.headers.location).toContain(`appointmentId=${testAppointmentId}`);
    });
  });
});
