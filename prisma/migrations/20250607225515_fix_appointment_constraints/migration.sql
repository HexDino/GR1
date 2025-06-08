-- Drop conflicting foreign key constraints for Appointment table
-- These constraints create conflicts because patientId and doctorId 
-- are constrained to reference both User table and Patient/Doctor tables

-- Drop the duplicate Patient constraint
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "appointment_patient_fkey";

-- Drop the duplicate Doctor constraint  
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "appointment_doctor_fkey";

-- Keep only the User table references:
-- Appointment_patientId_fkey (patientId -> User.id)
-- Appointment_doctorId_fkey (doctorId -> User.id) 