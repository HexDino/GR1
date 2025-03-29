import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'

const medicineSchema = z.object({
  name: z.string(),
  genericName: z.string().optional(),
  description: z.string().optional(),
  dosageForm: z.string(),
  strength: z.string(),
  manufacturer: z.string().optional(),
  prescriptionRequired: z.boolean().default(true),
  sideEffects: z.string().optional(),
  warnings: z.string().optional(),
  interactions: z.string().optional(),
})

// Get all medicines
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const dosageForm = searchParams.get('dosageForm')

    // Build where clause based on filters
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (dosageForm) {
      where.dosageForm = dosageForm
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(medicines)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new medicine (admin only)
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  if (auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only admin can create medicines' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const data = medicineSchema.parse(body)

    // Check if medicine with same name exists
    const existingMedicine = await prisma.medicine.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    })

    if (existingMedicine) {
      return NextResponse.json(
        { error: 'Medicine with this name already exists' },
        { status: 400 }
      )
    }

    const medicine = await prisma.medicine.create({
      data,
    })

    return NextResponse.json(medicine)
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