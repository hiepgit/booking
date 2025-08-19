import { PrismaClient } from '@prisma/client';
import { seedSpecialties } from './specialties.js';
import { seedClinics } from './clinics.js';
import { seedClinicDoctors } from './clinic-doctors.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed in order of dependencies
    await seedSpecialties();
    await seedClinics();
    
    // Note: Doctor seeding should be done before clinic-doctor associations
    // This assumes doctors are already seeded
    await seedClinicDoctors();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ All seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedAll };
