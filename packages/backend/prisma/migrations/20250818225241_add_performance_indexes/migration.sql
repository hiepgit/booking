-- CreateEnum
CREATE TYPE "public"."OtpPurpose" AS ENUM ('REGISTER', 'RESET');

-- CreateTable
CREATE TABLE "public"."otp_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "purpose" "public"."OtpPurpose" NOT NULL DEFAULT 'REGISTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_requests_email_idx" ON "public"."otp_requests"("email");

-- CreateIndex
CREATE INDEX "otp_requests_expiresAt_idx" ON "public"."otp_requests"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_requests_email_purpose_idx" ON "public"."otp_requests"("email", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "otp_requests_email_purpose_key" ON "public"."otp_requests"("email", "purpose");

-- CreateIndex
CREATE INDEX "app_configs_key_idx" ON "public"."app_configs"("key");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "public"."appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "public"."appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_clinicId_idx" ON "public"."appointments"("clinicId");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "public"."appointments"("appointmentDate");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "public"."appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_type_idx" ON "public"."appointments"("type");

-- CreateIndex
CREATE INDEX "appointments_patientId_status_idx" ON "public"."appointments"("patientId", "status");

-- CreateIndex
CREATE INDEX "appointments_doctorId_appointmentDate_idx" ON "public"."appointments"("doctorId", "appointmentDate");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_startTime_idx" ON "public"."appointments"("appointmentDate", "startTime");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_idx" ON "public"."audit_logs"("tableName");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_action_idx" ON "public"."audit_logs"("userId", "action");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "public"."audit_logs"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "clinic_doctors_clinicId_idx" ON "public"."clinic_doctors"("clinicId");

-- CreateIndex
CREATE INDEX "clinic_doctors_doctorId_idx" ON "public"."clinic_doctors"("doctorId");

-- CreateIndex
CREATE INDEX "clinic_doctors_workingDays_idx" ON "public"."clinic_doctors"("workingDays");

-- CreateIndex
CREATE INDEX "clinics_name_idx" ON "public"."clinics"("name");

-- CreateIndex
CREATE INDEX "clinics_latitude_longitude_idx" ON "public"."clinics"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "clinics_openTime_closeTime_idx" ON "public"."clinics"("openTime", "closeTime");

-- CreateIndex
CREATE INDEX "doctors_specialtyId_idx" ON "public"."doctors"("specialtyId");

-- CreateIndex
CREATE INDEX "doctors_averageRating_idx" ON "public"."doctors"("averageRating");

-- CreateIndex
CREATE INDEX "doctors_experience_idx" ON "public"."doctors"("experience");

-- CreateIndex
CREATE INDEX "doctors_isAvailable_idx" ON "public"."doctors"("isAvailable");

-- CreateIndex
CREATE INDEX "doctors_consultationFee_idx" ON "public"."doctors"("consultationFee");

-- CreateIndex
CREATE INDEX "medical_records_patientId_idx" ON "public"."medical_records"("patientId");

-- CreateIndex
CREATE INDEX "medical_records_doctorId_idx" ON "public"."medical_records"("doctorId");

-- CreateIndex
CREATE INDEX "medical_records_type_idx" ON "public"."medical_records"("type");

-- CreateIndex
CREATE INDEX "medical_records_createdAt_idx" ON "public"."medical_records"("createdAt");

-- CreateIndex
CREATE INDEX "medical_records_patientId_type_idx" ON "public"."medical_records"("patientId", "type");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "public"."messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "public"."messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_receiverId_idx" ON "public"."messages"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "messages_receiverId_isRead_idx" ON "public"."messages"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "public"."notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "patients_bloodType_idx" ON "public"."patients"("bloodType");

-- CreateIndex
CREATE INDEX "patients_insuranceNumber_idx" ON "public"."patients"("insuranceNumber");

-- CreateIndex
CREATE INDEX "payments_patientId_idx" ON "public"."payments"("patientId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "public"."payments"("method");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "public"."payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "public"."payments"("createdAt");

-- CreateIndex
CREATE INDEX "payments_patientId_status_idx" ON "public"."payments"("patientId", "status");

-- CreateIndex
CREATE INDEX "reviews_doctorId_idx" ON "public"."reviews"("doctorId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "public"."reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "public"."reviews"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_doctorId_rating_idx" ON "public"."reviews"("doctorId", "rating");

-- CreateIndex
CREATE INDEX "schedules_doctorId_date_idx" ON "public"."schedules"("doctorId", "date");

-- CreateIndex
CREATE INDEX "schedules_date_startTime_idx" ON "public"."schedules"("date", "startTime");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "public"."schedules"("status");

-- CreateIndex
CREATE INDEX "schedules_doctorId_date_status_idx" ON "public"."schedules"("doctorId", "date", "status");

-- CreateIndex
CREATE INDEX "specialties_name_idx" ON "public"."specialties"("name");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- CreateIndex
CREATE INDEX "users_isVerified_idx" ON "public"."users"("isVerified");
