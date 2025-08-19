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
  console.log('🌱 Starting database seeding...');

  // 1) Specialties
  console.log('Creating specialties...');
  const specialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name: 'Cardiology' },
      update: {},
      create: { name: 'Cardiology', description: 'Heart & cardiovascular diseases', icon: '❤️' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Neurology' },
      update: {},
      create: { name: 'Neurology', description: 'Nervous system disorders', icon: '🧠' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Orthopedics' },
      update: {},
      create: { name: 'Orthopedics', description: 'Bones, joints & muscles', icon: '🦴' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Dermatology' },
      update: {},
      create: { name: 'Dermatology', description: 'Skin conditions', icon: '🩺' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Pediatrics' },
      update: {},
      create: { name: 'Pediatrics', description: 'Children\'s health', icon: '👶' },
    }),
    prisma.specialty.upsert({
      where: { name: 'General Medicine' },
      update: {},
      create: { name: 'General Medicine', description: 'Primary care & general health', icon: '🏥' },
    }),
  ]);

  // 2) Clinics
  console.log('Creating clinics...');
  const clinics = await Promise.all([
    prisma.clinic.upsert({
      where: { id: 'seed-clinic-1' },
      update: {},
      create: {
        id: 'seed-clinic-1',
        name: 'City Health Clinic',
        address: '123 Nguyen Trai, Ba Dinh, Hanoi',
        phone: '02412345678',
        email: 'info@cityclinic.vn',
        latitude: 21.0278,
        longitude: 105.8342,
        openTime: '08:00',
        closeTime: '17:00',
        images: ['https://example.com/clinic1-1.jpg', 'https://example.com/clinic1-2.jpg'],
        description: 'Primary care & specialty clinic in central Hanoi',
      },
    }),
    prisma.clinic.upsert({
      where: { id: 'seed-clinic-2' },
      update: {},
      create: {
        id: 'seed-clinic-2',
        name: 'Modern Medical Center',
        address: '456 Le Loi, District 1, Ho Chi Minh City',
        phone: '02812345678',
        email: 'info@modernmedical.vn',
        latitude: 10.7769,
        longitude: 106.7009,
        openTime: '07:00',
        closeTime: '18:00',
        images: ['https://example.com/clinic2-1.jpg'],
        description: 'Advanced medical center with modern equipment',
      },
    }),
    prisma.clinic.upsert({
      where: { id: 'seed-clinic-3' },
      update: {},
      create: {
        id: 'seed-clinic-3',
        name: 'Family Health Clinic',
        address: '789 Tran Phu, Hai Chau, Da Nang',
        phone: '02361234567',
        email: 'info@familyhealth.vn',
        latitude: 16.0544,
        longitude: 108.2022,
        openTime: '08:30',
        closeTime: '16:30',
        images: ['https://example.com/clinic3-1.jpg'],
        description: 'Family-oriented healthcare services',
      },
    }),
  ]);

  // 3) Users & Patients
  console.log('Creating users and patients...');
  const patients = await Promise.all([
    prisma.user.upsert({
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
        dateOfBirth: new Date('1990-05-15'),
        address: 'Hanoi, Vietnam',
        isVerified: true,
        patient: {
          create: {
            bloodType: 'O+',
            allergies: 'None',
            emergencyContact: '0900000009',
            insuranceNumber: 'INS001',
          },
        },
      },
      include: { patient: true },
    }),
    prisma.user.upsert({
      where: { email: 'patient2@example.com' },
      update: {},
      create: {
        email: 'patient2@example.com',
        phone: '0900000002',
        passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
        role: UserRole.PATIENT,
        firstName: 'Mai',
        lastName: 'Tran',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1985-08-22'),
        address: 'Ho Chi Minh City, Vietnam',
        isVerified: true,
        patient: {
          create: {
            bloodType: 'A+',
            allergies: 'Penicillin',
            emergencyContact: '0900000010',
            insuranceNumber: 'INS002',
          },
        },
      },
      include: { patient: true },
    }),
    prisma.user.upsert({
      where: { email: 'patient3@example.com' },
      update: {},
      create: {
        email: 'patient3@example.com',
        phone: '0900000003',
        passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
        role: UserRole.PATIENT,
        firstName: 'Hai',
        lastName: 'Le',
        gender: Gender.MALE,
        dateOfBirth: new Date('1992-03-10'),
        address: 'Da Nang, Vietnam',
        isVerified: true,
        patient: {
          create: {
            bloodType: 'B+',
            allergies: 'Dust, Pollen',
            emergencyContact: '0900000011',
            insuranceNumber: 'INS003',
          },
        },
      },
      include: { patient: true },
    }),
  ]);

  // 4) Users & Doctors
  console.log('Creating users and doctors...');
  const doctors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'doctor1@example.com' },
      update: {},
      create: {
        email: 'doctor1@example.com',
        phone: '0900000004',
        passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
        role: UserRole.DOCTOR,
        firstName: 'Binh',
        lastName: 'Tran',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1980-12-05'),
        address: 'Hanoi, Vietnam',
        isVerified: true,
        doctor: {
          create: {
            licenseNumber: 'VN-123456',
            specialtyId: specialties[0].id, // Cardiology
            experience: 8,
            biography: 'Board-certified cardiologist with 8 years of experience in treating heart diseases.',
            consultationFee: '350000.00',
            isAvailable: true,
          },
        },
      },
      include: { doctor: true },
    }),
    prisma.user.upsert({
      where: { email: 'doctor2@example.com' },
      update: {},
      create: {
        email: 'doctor2@example.com',
        phone: '0900000005',
        passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
        role: UserRole.DOCTOR,
        firstName: 'Cuong',
        lastName: 'Pham',
        gender: Gender.MALE,
        dateOfBirth: new Date('1975-06-18'),
        address: 'Ho Chi Minh City, Vietnam',
        isVerified: true,
        doctor: {
          create: {
            licenseNumber: 'VN-123457',
            specialtyId: specialties[1].id, // Neurology
            experience: 15,
            biography: 'Senior neurologist specializing in stroke treatment and neurological disorders.',
            consultationFee: '450000.00',
            isAvailable: true,
          },
        },
      },
      include: { doctor: true },
    }),
    prisma.user.upsert({
      where: { email: 'doctor3@example.com' },
      update: {},
      create: {
        email: 'doctor3@example.com',
        phone: '0900000006',
        passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
        role: UserRole.DOCTOR,
        firstName: 'Lan',
        lastName: 'Hoang',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('1982-09-25'),
        address: 'Da Nang, Vietnam',
        isVerified: true,
        doctor: {
          create: {
            licenseNumber: 'VN-123458',
            specialtyId: specialties[2].id, // Orthopedics
            experience: 12,
            biography: 'Orthopedic surgeon with expertise in joint replacement and sports injuries.',
            consultationFee: '400000.00',
            isAvailable: true,
          },
        },
      },
      include: { doctor: true },
    }),
  ]);

  // 5) Admin User
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@healthcare.com' },
    update: {},
    create: {
      email: 'admin@healthcare.com',
      phone: '0900000000',
      passwordHash: '$2a$10$RUM3qQk0tY9E8hGkQdKQOe3r1rX6gGx0s7y0QZ0T0d5U0uVb1d3fS',
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'System',
      gender: Gender.MALE,
      address: 'System',
      isVerified: true,
    },
  });

  // 6) Clinic-Doctor Relationships
  console.log('Creating clinic-doctor relationships...');
  await Promise.all([
    prisma.clinicDoctor.upsert({
      where: {
        clinicId_doctorId: { clinicId: clinics[0].id, doctorId: doctors[0].doctor.id },
      },
      update: {},
      create: {
        clinicId: clinics[0].id,
        doctorId: doctors[0].doctor.id,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        startTime: '08:00',
        endTime: '17:00',
      },
    }),
    prisma.clinicDoctor.upsert({
      where: {
        clinicId_doctorId: { clinicId: clinics[1].id, doctorId: doctors[1].doctor.id },
      },
      update: {},
      create: {
        clinicId: clinics[1].id,
        doctorId: doctors[1].doctor.id,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
        startTime: '07:00',
        endTime: '18:00',
      },
    }),
    prisma.clinicDoctor.upsert({
      where: {
        clinicId_doctorId: { clinicId: clinics[2].id, doctorId: doctors[2].doctor.id },
      },
      update: {},
      create: {
        clinicId: clinics[2].id,
        doctorId: doctors[2].doctor.id,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        startTime: '08:30',
        endTime: '16:30',
      },
    }),
  ]);

  // 7) Schedules
  console.log('Creating sample schedules...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Promise.all([
    // Today's schedule for doctor 1
    prisma.schedule.create({
      data: {
        doctorId: doctors[0].doctor.id,
        date: today,
        startTime: '09:00',
        endTime: '09:30',
        status: ScheduleStatus.AVAILABLE,
      },
    }),
    prisma.schedule.create({
      data: {
        doctorId: doctors[0].doctor.id,
        date: today,
        startTime: '09:30',
        endTime: '10:00',
        status: ScheduleStatus.AVAILABLE,
      },
    }),
    prisma.schedule.create({
      data: {
        doctorId: doctors[0].doctor.id,
        date: today,
        startTime: '10:00',
        endTime: '10:30',
        status: ScheduleStatus.AVAILABLE,
      },
    }),
    // Tomorrow's schedule for doctor 1
    prisma.schedule.create({
      data: {
        doctorId: doctors[0].doctor.id,
        date: tomorrow,
        startTime: '09:00',
        endTime: '09:30',
        status: ScheduleStatus.AVAILABLE,
      },
    }),
    prisma.schedule.create({
      data: {
        doctorId: doctors[0].doctor.id,
        date: tomorrow,
        startTime: '09:30',
        endTime: '10:00',
        status: ScheduleStatus.AVAILABLE,
      },
    }),
  ]);

  // 8) Sample Appointments
  console.log('Creating sample appointments...');
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patients[0].patient.id,
      doctorId: doctors[0].doctor.id,
      clinicId: clinics[0].id,
      appointmentDate: tomorrow,
      startTime: '09:00',
      endTime: '09:30',
      type: AppointmentType.OFFLINE,
      status: AppointmentStatus.CONFIRMED,
      symptoms: 'Chest pain, shortness of breath',
      notes: 'Patient has history of hypertension',
    },
  });

  // 9) Sample Payment
  console.log('Creating sample payment...');
  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      patientId: patients[0].patient.id,
      amount: '350000.00',
      method: PaymentMethod.VNPAY,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      transactionId: 'TXN001',
    },
  });

  // 10) Sample Medical Record
  console.log('Creating sample medical record...');
  await prisma.medicalRecord.create({
    data: {
      appointmentId: appointment.id,
      patientId: patients[0].patient.id,
      doctorId: doctors[0].doctor.id,
      type: MedicalRecordType.DIAGNOSIS,
      diagnosis: 'Hypertension, suspected angina',
      prescription: 'Amlodipine 5mg daily, Nitroglycerin as needed',
      treatmentPlan: 'Monitor blood pressure weekly, follow up in 1 month',
      notes: 'Patient advised to reduce salt intake and exercise regularly',
      attachments: ['https://example.com/lab_results.pdf'],
    },
  });

  // 11) Sample Review
  console.log('Creating sample review...');
  await prisma.review.create({
    data: {
      patientId: patients[0].patient.id,
      doctorId: doctors[0].doctor.id,
      rating: 5,
      comment: 'Excellent doctor, very professional and caring. Explained everything clearly.',
    },
  });

  // 12) Sample Notifications
  console.log('Creating sample notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: patients[0].id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Lịch hẹn đã được xác nhận',
        message: 'Lịch hẹn với Dr. Binh Tran vào ngày mai lúc 09:00 đã được xác nhận.',
        data: {
          appointmentId: appointment.id,
          doctorName: 'Dr. Binh Tran',
          appointmentDate: tomorrow.toISOString(),
          startTime: '09:00',
        },
      },
    }),
    prisma.notification.create({
      data: {
        userId: patients[0].id,
        type: 'PAYMENT_SUCCESS',
        title: 'Thanh toán thành công',
        message: 'Bạn đã thanh toán thành công 350,000 VND cho lịch hẹn.',
        data: {
          paymentId: 'payment_001',
          amount: '350000.00',
          appointmentId: appointment.id,
        },
      },
    }),
  ]);

  // 13) Sample Messages
  console.log('Creating sample messages...');
  await prisma.message.create({
    data: {
      senderId: patients[0].id,
      receiverId: doctors[0].id,
      content: 'Xin chào bác sĩ, tôi muốn hỏi về thuốc Amlodipine có tác dụng phụ gì không?',
      messageType: 'text',
    },
  });

  // 14) App Configuration
  console.log('Creating app configuration...');
  await Promise.all([
    prisma.appConfig.upsert({
      where: { key: 'app_name' },
      update: {},
      create: {
        key: 'app_name',
        value: 'Healthcare Booking System',
        description: 'Application name',
      },
    }),
    prisma.appConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: {},
      create: {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Maintenance mode flag',
      },
    }),
    prisma.appConfig.upsert({
      where: { key: 'max_appointments_per_day' },
      update: {},
      create: {
        key: 'max_appointments_per_day',
        value: '50',
        description: 'Maximum appointments per day per doctor',
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Seeded data summary:');
  console.log(`   - ${specialties.length} specialties`);
  console.log(`   - ${clinics.length} clinics`);
  console.log(`   - ${patients.length} patients`);
  console.log(`   - ${doctors.length} doctors`);
  console.log(`   - 1 admin user`);
  console.log(`   - Sample appointments, payments, medical records, reviews, notifications, and messages`);
  console.log('');
  console.log('🔑 Test accounts:');
  console.log('   Patient: patient1@example.com / password123');
  console.log('   Doctor: doctor1@example.com / password123');
  console.log('   Admin: admin@healthcare.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
