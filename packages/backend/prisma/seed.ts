// @ts-nocheck
import {
  PrismaClient,
  UserRole,
  Gender,
  ScheduleStatus,
  AppointmentStatus,
  AppointmentType,
  MedicalRecordType,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1) Specialty & Clinic
  const specialty = await prisma.specialty.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: { name: 'Cardiology', description: 'Heart & cardiovascular', icon: '❤️' },
  });

  const clinic = await prisma.clinic.upsert({
    where: { id: 'seed-clinic-1' },
    update: {},
    create: {
      id: 'seed-clinic-1',
      name: 'City Health Clinic',
      address: '123 Nguyen Trai, Hanoi',
      phone: '0123456789',
      email: 'info@cityclinic.vn',
      openTime: '08:00',
      closeTime: '17:00',
      images: [],
      description: 'Primary care & specialty clinic',
    },
  });

  // 2) Users (include để có patient/doctor trả về)
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient1@example.com' },
    update: {},
    create: {
      email: 'patient1@example.com',
      phone: '0900000001',
      passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
      role: UserRole.PATIENT,
      firstName: 'An',
      lastName: 'Nguyen',
      gender: Gender.MALE,
      address: 'Hanoi, VN',
      isVerified: true,
      patient: {
        create: {
          bloodType: 'O+',
          allergies: 'None',
        },
      },
    },
    include: { patient: true },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor1@example.com' },
    update: {},
    create: {
      email: 'doctor1@example.com',
      phone: '0900000002',
      passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
      role: UserRole.DOCTOR,
      firstName: 'Binh',
      lastName: 'Tran',
      gender: Gender.FEMALE,
      address: 'Hanoi, VN',
      isVerified: true,
      doctor: {
        create: {
          licenseNumber: 'VN-123456',
          specialtyId: specialty.id,
          experience: 8,
          biography: 'Board-certified cardiologist.',
          consultationFee: '350000.00',
          isAvailable: true,
        },
      },
    },
    include: { doctor: true },
  });

  if (!patientUser.patient) throw new Error('Patient relation missing');
  if (!doctorUser.doctor) throw new Error('Doctor relation missing');

  // Liên kết doctor với clinic (upsert để không trùng)
  await prisma.clinicDoctor.upsert({
    where: {
      clinicId_doctorId: { clinicId: clinic.id, doctorId: doctorUser.doctor.id },
    },
    update: {},
    create: {
      clinicId: clinic.id,
      doctorId: doctorUser.doctor.id,
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      startTime: '08:30',
      endTime: '16:30',
    },
  });

  // 3) Schedule cho hôm nay (date-only)
  const today = new Date();
  const dateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const schedule = await prisma.schedule.upsert({
    where: {
      doctorId_date_startTime: {
        doctorId: doctorUser.doctor.id,
        date: dateOnly,
        startTime: '09:00',
      },
    },
    update: {},
    create: {
      doctorId: doctorUser.doctor.id,
      date: dateOnly,
      startTime: '09:00',
      endTime: '12:00',
      status: ScheduleStatus.AVAILABLE,
      note: 'Morning slots',
    },
  });

  // 4) Appointment minh họa
  const appt = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      clinicId: clinic.id,
      scheduleId: schedule.id,
      appointmentDate: new Date(),
      startTime: '09:00',
      endTime: '09:15',
      type: AppointmentType.OFFLINE,
      status: AppointmentStatus.CONFIRMED,
      symptoms: 'Chest discomfort',
      notes: 'First visit',
    },
  });

  // 5) Payment & Medical record
  await prisma.payment.create({
    data: {
      appointmentId: appt.id,
      patientId: patientUser.patient.id,
      amount: '350000.00',
      method: PaymentMethod.CASH,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  await prisma.medicalRecord.create({
    data: {
      appointmentId: appt.id,
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      type: MedicalRecordType.DIAGNOSIS,
      diagnosis: 'Suspected angina',
      treatmentPlan: 'ECG, lifestyle changes',
      attachments: [],
    },
  });

  console.log('Seed completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
