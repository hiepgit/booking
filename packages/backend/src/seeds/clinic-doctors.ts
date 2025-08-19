import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clinicDoctorsData = [
  // Bệnh viện Tim Hà Nội - Cardiology doctors
  {
    id: 'cd_001',
    clinicId: 'clinic_001',
    doctorId: 'doctor_001', // Assuming this doctor exists from doctor seeds
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '08:00',
    endTime: '16:00',
  },
  {
    id: 'cd_002',
    clinicId: 'clinic_001',
    doctorId: 'doctor_002',
    workingDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    startTime: '09:00',
    endTime: '17:00',
  },
  
  // Phòng khám Đa khoa Medlatec - Multiple specialties
  {
    id: 'cd_003',
    clinicId: 'clinic_002',
    doctorId: 'doctor_003',
    workingDays: ['TUESDAY', 'THURSDAY', 'SATURDAY'],
    startTime: '08:00',
    endTime: '17:00',
  },
  {
    id: 'cd_004',
    clinicId: 'clinic_002',
    doctorId: 'doctor_004',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '07:30',
    endTime: '16:30',
  },
  
  // Bệnh viện Thần kinh Trung ương - Neurology doctors
  {
    id: 'cd_005',
    clinicId: 'clinic_003',
    doctorId: 'doctor_005',
    workingDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    startTime: '08:00',
    endTime: '16:00',
  },
  
  // Phòng khám Nhi khoa Sunshine - Pediatrics
  {
    id: 'cd_006',
    clinicId: 'clinic_004',
    doctorId: 'doctor_006',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    startTime: '08:30',
    endTime: '17:00',
  },
  
  // Bệnh viện Mắt Sài Gòn - Ophthalmology
  {
    id: 'cd_007',
    clinicId: 'clinic_005',
    doctorId: 'doctor_007',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '07:00',
    endTime: '18:00',
  },
  {
    id: 'cd_008',
    clinicId: 'clinic_005',
    doctorId: 'doctor_008',
    workingDays: ['TUESDAY', 'THURSDAY', 'SATURDAY'],
    startTime: '08:00',
    endTime: '17:00',
  },
  
  // Phòng khám Da liễu Dr. Skin - Dermatology
  {
    id: 'cd_009',
    clinicId: 'clinic_006',
    doctorId: 'doctor_009',
    workingDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    startTime: '09:00',
    endTime: '18:00',
  },
  
  // Bệnh viện Răng Hàm Mặt Quốc tế - Dentistry
  {
    id: 'cd_010',
    clinicId: 'clinic_007',
    doctorId: 'doctor_010',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '08:00',
    endTime: '19:00',
  },
  {
    id: 'cd_011',
    clinicId: 'clinic_007',
    doctorId: 'doctor_011',
    workingDays: ['TUESDAY', 'THURSDAY', 'SATURDAY'],
    startTime: '09:00',
    endTime: '20:00',
  },
  
  // Phòng khám Sản phụ khoa Hạnh Phúc - Obstetrics & Gynecology
  {
    id: 'cd_012',
    clinicId: 'clinic_008',
    doctorId: 'doctor_012',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '07:30',
    endTime: '16:30',
  },
];

export async function seedClinicDoctors() {
  console.log('👨‍⚕️ Seeding clinic-doctor associations...');
  
  try {
    // Delete existing associations
    await prisma.clinicDoctor.deleteMany();
    console.log('✅ Deleted existing clinic-doctor associations');

    // Create new associations
    let createdCount = 0;
    for (const association of clinicDoctorsData) {
      try {
        // Check if clinic and doctor exist
        const clinic = await prisma.clinic.findUnique({
          where: { id: association.clinicId },
        });
        
        const doctor = await prisma.doctor.findUnique({
          where: { id: association.doctorId },
        });

        if (clinic && doctor) {
          await prisma.clinicDoctor.create({
            data: association,
          });
          console.log(`✅ Associated doctor ${association.doctorId} with clinic ${association.clinicId}`);
          createdCount++;
        } else {
          console.log(`⚠️  Skipped association ${association.id}: clinic or doctor not found`);
        }
      } catch (error) {
        console.log(`⚠️  Skipped association ${association.id}: ${error}`);
      }
    }

    console.log(`🎉 Successfully created ${createdCount} clinic-doctor associations`);
  } catch (error) {
    console.error('❌ Error seeding clinic-doctor associations:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedClinicDoctors()
    .then(() => {
      console.log('✅ Clinic-doctor association seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Clinic-doctor association seeding failed:', error);
      process.exit(1);
    });
}
