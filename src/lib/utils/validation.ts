import { z } from 'zod';
import { NextApiRequest } from 'next';
import { ApiError } from './apiError';

/**
 * Validate request body theo schema Zod
 * @param schema Zod schema dùng để validate
 * @param req NextApiRequest object
 * @returns Dữ liệu đã được validate và ép kiểu
 */
export function validateBody<T>(schema: z.ZodType<T>, req: NextApiRequest): T {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.validationError(error.format());
    }
    throw ApiError.badRequest('Invalid request body');
  }
}

/**
 * Validate query params theo schema Zod
 * @param schema Zod schema dùng để validate
 * @param req NextApiRequest object
 * @returns Dữ liệu đã được validate và ép kiểu
 */
export function validateQuery<T>(schema: z.ZodType<T>, req: NextApiRequest): T {
  try {
    return schema.parse(req.query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.validationError(error.format());
    }
    throw ApiError.badRequest('Invalid query parameters');
  }
}

// Common schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters');

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number format');

export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  });

export const idSchema = z
  .string()
  .min(1, 'ID is required');

// User schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
});

// Appointment schemas
export const createAppointmentSchema = z.object({
  doctorId: idSchema,
  date: dateSchema,
  type: z.enum(['IN_PERSON', 'VIRTUAL', 'HOME_VISIT']).optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

// Doctor schemas
export const updateDoctorProfileSchema = z.object({
  specialization: z.string().optional(),
  bio: z.string().optional(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number(),
    })
  ).optional(),
  consultationFee: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

// Patient schemas
export const updatePatientProfileSchema = z.object({
  dateOfBirth: dateSchema.optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  doctorId: idSchema,
  appointmentId: idSchema.optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  isAnonymous: z.boolean().optional(),
}); 