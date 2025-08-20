import * as cron from 'node-cron';
import { CleanupService } from './cleanup.service.js';

/**
 * Scheduler Service - Handles background tasks and cron jobs
 */
export class SchedulerService {
  private static cleanupTask: cron.ScheduledTask | null = null;
  private static isRunning = false;

  /**
   * Start all scheduled tasks
   */
  static start(): void {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    this.startCleanupTask();
    this.isRunning = true;
  }

  /**
   * Stop all scheduled tasks
   */
  static stop(): void {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler is not running');
      return;
    }

    console.log('🛑 Stopping scheduler service...');
    
    if (this.cleanupTask) {
      this.cleanupTask.stop();
      this.cleanupTask = null;
    }
    
    this.isRunning = false;
    console.log('✅ Scheduler service stopped');
  }

  /**
   * Start cleanup task
   * Runs every 30 minutes to cleanup unverified users and expired OTP requests
   */
  private static startCleanupTask(): void {
    // Run every 30 minutes: '0 */30 * * * *'
    // For testing, you can use '*/5 * * * * *' (every 5 seconds)
    // or '*/1 * * * *' (every 1 minute)
    const cronExpression = '0 */30 * * * *'; // Every 30 minutes
    
    this.cleanupTask = cron.schedule(cronExpression, async () => {
      try {
        console.log('⏰ Running scheduled cleanup task...');
        
        // Get statistics before cleanup
        const statsBefore = await CleanupService.getCleanupStatistics();
        console.log('📊 Cleanup statistics before:', statsBefore);
        
        // Run cleanup
        const results = await CleanupService.runAllCleanupTasks();
        
        // Log results
        if (results.unverifiedUsers.deletedCount > 0) {
          console.log(`🗑️  Deleted ${results.unverifiedUsers.deletedCount} unverified users:`, 
                     results.unverifiedUsers.deletedUsers);
        }
        
        if (results.expiredOtpRequests.deletedCount > 0) {
          console.log(`🗑️  Deleted ${results.expiredOtpRequests.deletedCount} expired OTP requests`);
        }
        
        if (results.unverifiedUsers.deletedCount === 0 && results.expiredOtpRequests.deletedCount === 0) {
          console.log('✨ No cleanup needed - all clean!');
        }
        
      } catch (error) {
        console.error('❌ Error in scheduled cleanup task:', error);
      }
    });

    // Start the task
    this.cleanupTask.start();
    
    // Cleanup task scheduled silently
  }

  /**
   * Run cleanup task immediately (for testing/manual trigger)
   */
  static async runCleanupNow(): Promise<{
    unverifiedUsers: { deletedCount: number; deletedUsers: string[] };
    expiredOtpRequests: { deletedCount: number };
  }> {
    console.log('🧹 Running cleanup task manually...');
    
    try {
      const results = await CleanupService.runAllCleanupTasks();
      console.log('✅ Manual cleanup completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Error in manual cleanup:', error);
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(): Promise<{
    unverifiedUsersCount: number;
    expiredOtpRequestsCount: number;
    oldestUnverifiedUser?: Date;
    nextCleanupTime?: Date;
  }> {
    const stats = await CleanupService.getCleanupStatistics();
    
    return {
      ...stats,
      nextCleanupTime: undefined // Will be implemented later
    };
  }

  /**
   * Check if scheduler is running
   */
  static isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get next cleanup time
   */
  static getNextCleanupTime(): Date | null {
    return null; // Will be implemented later
  }
}
