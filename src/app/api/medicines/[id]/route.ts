import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'

const updateMedicineSchema = z.object({
  name: z.string().optional(),
  genericName: z.string().optional(),
  description: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  manufacturer: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  sideEffects: z.string().optional(),
  warnings: z.string().optional(),
  interactions: z.string().optional(),
})

// Get specific medicine
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    })

    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(medicine)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update medicine (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  if (auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only admin can update medicines' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const data = updateMedicineSchema.parse(body)

    // Check if medicine exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    })

    if (!existingMedicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with existing medicine
    if (data.name) {
      const nameConflict = await prisma.medicine.findFirst({
        where: {
          id: { not: params.id },
          name: {
            equals: data.name,
            mode: 'insensitive',
          },
        },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Medicine with this name already exists' },
          { status: 400 }
        )
      }
    }

    const medicine = await prisma.medicine.update({
      where: { id: params.id },
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

// Delete medicine (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  if (auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only admin can delete medicines' },
      { status: 403 }
    )
  }

  try {
    // Check if medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: params.id },
      include: {
        prescriptionItems: true,
      },
    })

    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      )
    }

    // Check if medicine is used in any prescription
    if (medicine.prescriptionItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete medicine that is used in prescriptions' },
        { status: 400 }
      )
    }

    await prisma.medicine.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Medicine deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 