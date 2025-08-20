import { prisma } from '../libs/prisma.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

/**
 * Cleanup Service - Handles automatic cleanup of unverified accounts
 */
export class CleanupService {
  /**
   * Delete unverified users whose OTP has expired
   * This prevents "zombie accounts" that registered but never verified
   */
  static async cleanupUnverifiedUsers(): Promise<{
    deletedCount: number;
    deletedUsers: string[];
  }> {
    try {
      console.log('🧹 Starting cleanup of unverified users...');
      
      // Calculate expiration time based on OTP_EXPIRES_MINUTES
      const expirationTime = new Date(Date.now() - env.OTP_EXPIRES_MINUTES * 60 * 1000);
      
      // Find unverified users whose registration time + OTP expiry has passed
      // AND who don't have any valid (non-expired) OTP requests
      const unverifiedUsers = await prisma.user.findMany({
        where: {
          isVerified: false,
          createdAt: {
            lt: expirationTime // Created before expiration time
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      });

      if (unverifiedUsers.length === 0) {
        console.log('✅ No unverified users to cleanup');
        return { deletedCount: 0, deletedUsers: [] };
      }

      console.log(`🔍 Found ${unverifiedUsers.length} unverified users to potentially cleanup`);

      const deletedUsers: string[] = [];
      let deletedCount = 0;

      // Process each user individually to handle any constraints
      for (const user of unverifiedUsers) {
        try {
          // Check if user has any valid (non-expired) OTP requests
          const validOtpRequest = await prisma.otpRequest.findFirst({
            where: {
              email: user.email,
              purpose: 'REGISTER',
              expiresAt: {
                gt: new Date() // Not expired yet
              }
            }
          });

          // If user has valid OTP request, skip deletion
          if (validOtpRequest) {
            console.log(`⏳ Skipping user ${user.email} - has valid OTP request`);
            continue;
          }

          // Delete user and related data in transaction
          await prisma.$transaction(async (tx) => {
            // Delete related OTP requests first
            await tx.otpRequest.deleteMany({
              where: { email: user.email }
            });

            // Delete patient profile if exists
            await tx.patient.deleteMany({
              where: { userId: user.id }
            });

            // Delete doctor profile if exists (though unlikely for unverified)
            await tx.doctor.deleteMany({
              where: { userId: user.id }
            });

            // Delete user
            await tx.user.delete({
              where: { id: user.id }
            });
          });

          deletedUsers.push(user.email);
          deletedCount++;
          
          console.log(`🗑️  Deleted unverified user: ${user.email} (created: ${user.createdAt})`);
          
        } catch (error) {
          console.error(`❌ Failed to delete user ${user.email}:`, error);
          // Continue with other users even if one fails
        }
      }

      console.log(`✅ Cleanup completed. Deleted ${deletedCount} unverified users`);
      
      return {
        deletedCount,
        deletedUsers
      };
      
    } catch (error) {
      console.error('❌ Error during unverified users cleanup:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired OTP requests
   * This is a separate cleanup for OTP requests that are no longer needed
   */
  static async cleanupExpiredOtpRequests(): Promise<{
    deletedCount: number;
  }> {
    try {
      console.log('🧹 Starting cleanup of expired OTP requests...');
      
      const result = await prisma.otpRequest.deleteMany({
        where: {
          expiresAt: {
            lt: new Date() // Expired
          }
        }
      });

      console.log(`✅ Deleted ${result.count} expired OTP requests`);
      
      return {
        deletedCount: result.count
      };
      
    } catch (error) {
      console.error('❌ Error during OTP cleanup:', error);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  static async runAllCleanupTasks(): Promise<{
    unverifiedUsers: { deletedCount: number; deletedUsers: string[] };
    expiredOtpRequests: { deletedCount: number };
  }> {
    console.log('🧹 Starting comprehensive cleanup...');
    
    const [unverifiedUsers, expiredOtpRequests] = await Promise.all([
      this.cleanupUnverifiedUsers(),
      this.cleanupExpiredOtpRequests()
    ]);

    console.log('✅ Comprehensive cleanup completed');
    
    return {
      unverifiedUsers,
      expiredOtpRequests
    };
  }

  /**
   * Get statistics about cleanup candidates
   */
  static async getCleanupStatistics(): Promise<{
    unverifiedUsersCount: number;
    expiredOtpRequestsCount: number;
    oldestUnverifiedUser?: Date;
  }> {
    try {
      const expirationTime = new Date(Date.now() - env.OTP_EXPIRES_MINUTES * 60 * 1000);
      
      const [unverifiedUsersCount, expiredOtpRequestsCount, oldestUnverifiedUser] = await Promise.all([
        prisma.user.count({
          where: {
            isVerified: false,
            createdAt: {
              lt: expirationTime
            }
          }
        }),
        prisma.otpRequest.count({
          where: {
            expiresAt: {
              lt: new Date()
            }
          }
        }),
        prisma.user.findFirst({
          where: {
            isVerified: false,
            createdAt: {
              lt: expirationTime
            }
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        })
      ]);

      return {
        unverifiedUsersCount,
        expiredOtpRequestsCount,
        oldestUnverifiedUser: oldestUnverifiedUser?.createdAt
      };
      
    } catch (error) {
      console.error('❌ Error getting cleanup statistics:', error);
      throw error;
    }
  }
}
