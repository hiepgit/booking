import { prisma } from '../libs/prisma.js';

export const specialtiesData = [
  {
    name: 'Tim mạch',
    description: 'Chuyên khoa về tim và mạch máu',
    icon: '❤️'
  },
  {
    name: 'Thần kinh',
    description: 'Chuyên khoa về hệ thần kinh',
    icon: '🧠'
  },
  {
    name: 'Nhi khoa',
    description: 'Chuyên khoa về trẻ em',
    icon: '👶'
  },
  {
    name: 'Sản phụ khoa',
    description: 'Chuyên khoa về phụ nữ và thai sản',
    icon: '🤱'
  },
  {
    name: 'Da liễu',
    description: 'Chuyên khoa về da và các bệnh ngoài da',
    icon: '🩺'
  },
  {
    name: 'Mắt',
    description: 'Chuyên khoa về mắt và thị lực',
    icon: '👁️'
  },
  {
    name: 'Tai mũi họng',
    description: 'Chuyên khoa về tai, mũi, họng',
    icon: '👂'
  },
  {
    name: 'Răng hàm mặt',
    description: 'Chuyên khoa về răng và vùng hàm mặt',
    icon: '🦷'
  },
  {
    name: 'Chấn thương chỉnh hình',
    description: 'Chuyên khoa về xương khớp và chấn thương',
    icon: '🦴'
  },
  {
    name: 'Tiêu hóa',
    description: 'Chuyên khoa về hệ tiêu hóa',
    icon: '🫃'
  },
  {
    name: 'Hô hấp',
    description: 'Chuyên khoa về phổi và hệ hô hấp',
    icon: '🫁'
  },
  {
    name: 'Nội tiết',
    description: 'Chuyên khoa về nội tiết và đái tháo đường',
    icon: '🩸'
  },
  {
    name: 'Tâm thần',
    description: 'Chuyên khoa về tâm lý và tâm thần',
    icon: '🧘'
  },
  {
    name: 'Ung bướu',
    description: 'Chuyên khoa về ung thư và u bướu',
    icon: '🎗️'
  },
  {
    name: 'Thận - Tiết niệu',
    description: 'Chuyên khoa về thận và đường tiết niệu',
    icon: '🫘'
  }
];

export async function seedSpecialties() {
  console.log('🌱 Seeding specialties...');
  
  for (const specialty of specialtiesData) {
    await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: specialty,
      create: specialty,
    });
  }
  
  console.log(`✅ Seeded ${specialtiesData.length} specialties`);
}
