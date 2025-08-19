import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clinicsData = [
  {
    id: 'clinic_001',
    name: 'Bệnh viện Tim Hà Nội',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '+84281234567',
    email: 'info@timhanoi.com',
    latitude: 10.762622,
    longitude: 106.660172,
    openTime: '08:00',
    closeTime: '17:00',
    images: [
      'https://example.com/clinic1_1.jpg',
      'https://example.com/clinic1_2.jpg'
    ],
    description: 'Bệnh viện chuyên khoa tim mạch hàng đầu với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.',
  },
  {
    id: 'clinic_002',
    name: 'Phòng khám Đa khoa Medlatec',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    phone: '+84287654321',
    email: 'contact@medlatec.com',
    latitude: 10.768431,
    longitude: 106.681889,
    openTime: '07:30',
    closeTime: '18:00',
    images: [
      'https://example.com/clinic2_1.jpg'
    ],
    description: 'Phòng khám đa khoa với nhiều chuyên khoa, phục vụ nhu cầu khám chữa bệnh của người dân.',
  },
  {
    id: 'clinic_003',
    name: 'Bệnh viện Thần kinh Trung ương',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    phone: '+84289876543',
    email: 'info@neurocenter.com',
    latitude: 10.756637,
    longitude: 106.675747,
    openTime: '08:00',
    closeTime: '16:30',
    images: [
      'https://example.com/clinic3_1.jpg',
      'https://example.com/clinic3_2.jpg',
      'https://example.com/clinic3_3.jpg'
    ],
    description: 'Bệnh viện chuyên khoa thần kinh với các dịch vụ điều trị và phẫu thuật thần kinh tiên tiến.',
  },
  {
    id: 'clinic_004',
    name: 'Phòng khám Nhi khoa Sunshine',
    address: '321 Võ Văn Tần, Quận 3, TP.HCM',
    phone: '+84283456789',
    email: 'hello@sunshine-kids.com',
    latitude: 10.777229,
    longitude: 106.691742,
    openTime: '08:30',
    closeTime: '17:30',
    images: [
      'https://example.com/clinic4_1.jpg'
    ],
    description: 'Phòng khám chuyên khoa nhi với môi trường thân thiện và đội ngũ bác sĩ nhi khoa giàu kinh nghiệm.',
  },
  {
    id: 'clinic_005',
    name: 'Bệnh viện Mắt Sài Gòn',
    address: '654 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    phone: '+84285678901',
    email: 'info@saigoneye.com',
    latitude: 10.759762,
    longitude: 106.695677,
    openTime: '07:00',
    closeTime: '18:30',
    images: [
      'https://example.com/clinic5_1.jpg',
      'https://example.com/clinic5_2.jpg'
    ],
    description: 'Bệnh viện chuyên khoa mắt với công nghệ laser hiện đại và các dịch vụ phẫu thuật mắt tiên tiến.',
  },
  {
    id: 'clinic_006',
    name: 'Phòng khám Da liễu Dr. Skin',
    address: '987 Pasteur, Quận 1, TP.HCM',
    phone: '+84286789012',
    email: 'contact@drskin.vn',
    latitude: 10.779229,
    longitude: 106.695742,
    openTime: '09:00',
    closeTime: '19:00',
    images: [
      'https://example.com/clinic6_1.jpg'
    ],
    description: 'Phòng khám chuyên khoa da liễu với các dịch vụ điều trị da và thẩm mỹ da chuyên nghiệp.',
  },
  {
    id: 'clinic_007',
    name: 'Bệnh viện Răng Hàm Mặt Quốc tế',
    address: '147 Hai Bà Trưng, Quận 1, TP.HCM',
    phone: '+84287890123',
    email: 'info@international-dental.com',
    latitude: 10.771229,
    longitude: 106.701742,
    openTime: '08:00',
    closeTime: '20:00',
    images: [
      'https://example.com/clinic7_1.jpg',
      'https://example.com/clinic7_2.jpg'
    ],
    description: 'Bệnh viện răng hàm mặt quốc tế với dịch vụ nha khoa toàn diện và công nghệ hiện đại.',
  },
  {
    id: 'clinic_008',
    name: 'Phòng khám Sản phụ khoa Hạnh Phúc',
    address: '258 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    phone: '+84288901234',
    email: 'info@happymaternity.vn',
    latitude: 10.771637,
    longitude: 106.665747,
    openTime: '07:30',
    closeTime: '17:00',
    images: [
      'https://example.com/clinic8_1.jpg'
    ],
    description: 'Phòng khám chuyên khoa sản phụ khoa với dịch vụ chăm sóc thai sản và sức khỏe phụ nữ.',
  }
];

export async function seedClinics() {
  console.log('🏥 Seeding clinics...');
  
  try {
    // Delete existing clinics
    await prisma.clinic.deleteMany();
    console.log('✅ Deleted existing clinics');

    // Create new clinics
    for (const clinic of clinicsData) {
      await prisma.clinic.create({
        data: clinic,
      });
      console.log(`✅ Created clinic: ${clinic.name}`);
    }

    console.log(`🎉 Successfully seeded ${clinicsData.length} clinics`);
  } catch (error) {
    console.error('❌ Error seeding clinics:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedClinics()
    .then(() => {
      console.log('✅ Clinic seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Clinic seeding failed:', error);
      process.exit(1);
    });
}
