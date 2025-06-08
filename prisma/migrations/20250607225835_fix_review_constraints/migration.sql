-- Drop conflicting foreign key constraints for DoctorReview table
-- The doctorId field has conflicting constraints referencing both Doctor and User tables

-- Drop the Doctor table constraint (should reference Doctor table through proper relation)
ALTER TABLE "DoctorReview" DROP CONSTRAINT IF EXISTS "doctorreview_doctor_fkey";

-- Drop the duplicate User constraint for doctorId (there should be only one User constraint for userId)
ALTER TABLE "DoctorReview" DROP CONSTRAINT IF EXISTS "doctorreview_user_fkey";

-- Keep only the proper User constraint for userId:
-- DoctorReview_userId_fkey (userId -> User.id)
-- And the proper Doctor constraint:
-- The doctorId should reference Doctor.id through the proper relation in the schema 