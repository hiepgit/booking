-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ReminderType" AS ENUM ('APPOINTMENT_24H', 'APPOINTMENT_1H', 'APPOINTMENT_15M', 'PAYMENT_DUE', 'VERIFICATION_PENDING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'APPOINTMENT_RESCHEDULED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'APPOINTMENT_COMPLETED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT_REFUNDED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'DOCTOR_AVAILABLE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'DOCTOR_UNAVAILABLE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEW_APPOINTMENT_REQUEST';
ALTER TYPE "public"."NotificationType" ADD VALUE 'SYSTEM_MAINTENANCE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'SYSTEM_UPDATE';
ALTER TYPE "public"."NotificationType" ADD VALUE 'WELCOME';
ALTER TYPE "public"."NotificationType" ADD VALUE 'VERIFICATION_REMINDER';

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "channels" "public"."NotificationChannel"[],
ADD COLUMN     "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "channels" "public"."NotificationChannel"[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderTiming" INTEGER[],
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_templates" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "subject" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "htmlBody" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "externalId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "public"."notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_type_idx" ON "public"."notification_preferences"("type");

-- CreateIndex
CREATE INDEX "notification_preferences_enabled_idx" ON "public"."notification_preferences"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_type_key" ON "public"."notification_preferences"("userId", "type");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "public"."notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_channel_idx" ON "public"."notification_templates"("channel");

-- CreateIndex
CREATE INDEX "notification_templates_isActive_idx" ON "public"."notification_templates"("isActive");

-- CreateIndex
CREATE INDEX "notification_templates_language_idx" ON "public"."notification_templates"("language");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_type_channel_language_key" ON "public"."notification_templates"("type", "channel", "language");

-- CreateIndex
CREATE INDEX "notification_logs_notificationId_idx" ON "public"."notification_logs"("notificationId");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "public"."notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "public"."notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_createdAt_idx" ON "public"."notification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_idx" ON "public"."notification_logs"("recipient");

-- CreateIndex
CREATE INDEX "notifications_isDelivered_idx" ON "public"."notifications"("isDelivered");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_scheduledFor_idx" ON "public"."notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "public"."notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "notifications_appointmentId_idx" ON "public"."notifications"("appointmentId");

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_logs" ADD CONSTRAINT "notification_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
