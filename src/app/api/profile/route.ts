import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'

const updateProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  bloodType: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
})

// Get profile
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: auth.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update profile
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const updatedProfile = await prisma.profile.update({
      where: { userId: auth.userId },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 