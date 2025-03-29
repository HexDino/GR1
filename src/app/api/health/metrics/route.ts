import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'
import { MetricType } from '@prisma/client'

const healthMetricSchema = z.object({
  type: z.enum([
    'BLOOD_PRESSURE',
    'HEART_RATE',
    'BLOOD_GLUCOSE',
    'TEMPERATURE',
    'OXYGEN_SATURATION',
    'WEIGHT',
    'HEIGHT',
    'SLEEP',
    'STEPS',
    'CALORIES'
  ]),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  notes: z.string().optional(),
})

// Lấy số liệu sức khỏe của người dùng
export async function GET(request: NextRequest) {
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '30')
    
    // Xây dựng điều kiện truy vấn
    const where: any = {
      userId: auth.userId,
    }
    
    if (type) {
      where.type = type
    }
    
    if (from || to) {
      where.createdAt = {}
      
      if (from) {
        where.createdAt.gte = new Date(from)
      }
      
      if (to) {
        where.createdAt.lte = new Date(to)
      }
    }
    
    // Đếm tổng số bản ghi theo loại
    const metrics = await prisma.healthMetric.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
    
    // Thống kê số liệu theo loại
    const typeStats = await prisma.$queryRaw`
      SELECT 
        type, 
        COUNT(*) as count, 
        MAX(createdAt) as lastUpdated
      FROM "HealthMetric"
      WHERE "userId" = ${auth.userId}
      GROUP BY type
      ORDER BY count DESC
    `
    
    return NextResponse.json({
      data: metrics,
      stats: typeStats,
    })
  } catch (error) {
    console.error('Error fetching health metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health metrics' },
      { status: 500 }
    )
  }
}

// Thêm số liệu sức khỏe mới
export async function POST(request: NextRequest) {
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const body = await request.json()
    const data = healthMetricSchema.parse(body)
    
    // Tạo bản ghi mới
    const metric = await prisma.healthMetric.create({
      data: {
        userId: auth.userId,
        type: data.type as MetricType,
        value: Number(data.value),
        unit: data.unit || "",
        notes: data.notes || "",
      },
    })
    
    // Kiểm tra ngưỡng an toàn và cảnh báo nếu cần
    let warning = null
    
    if (data.type === 'BLOOD_PRESSURE') {
      const values = data.value.toString().split('/')
      if (values.length === 2) {
        const systolic = parseInt(values[0], 10)
        const diastolic = parseInt(values[1], 10)
        
        if (systolic > 140 || diastolic > 90) {
          warning = {
            message: 'Your blood pressure is elevated. Consider consulting a healthcare professional.',
            level: 'WARNING',
          }
        } else if (systolic > 180 || diastolic > 120) {
          warning = {
            message: 'Your blood pressure is critically high. Seek medical attention immediately.',
            level: 'CRITICAL',
          }
        }
      }
    } else if (data.type === 'BLOOD_GLUCOSE') {
      const glucose = parseFloat(data.value.toString())
      
      if (glucose > 200) {
        warning = {
          message: 'Your blood glucose level is elevated. Consider consulting a healthcare professional.',
          level: 'WARNING',
        }
      } else if (glucose < 70) {
        warning = {
          message: 'Your blood glucose level is low. Consider eating something with sugar.',
          level: 'WARNING',
        }
      }
    } else if (data.type === 'TEMPERATURE') {
      const temp = parseFloat(data.value.toString())
      
      if (temp > 38) {
        warning = {
          message: 'You have a fever. Rest and monitor your temperature.',
          level: 'WARNING',
        }
      } else if (temp > 39.5) {
        warning = {
          message: 'You have a high fever. Consider consulting a healthcare professional.',
          level: 'CRITICAL',
        }
      }
    }
    
    return NextResponse.json({
      data: metric,
      warning,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating health metric:', error)
    return NextResponse.json(
      { error: 'Failed to create health metric' },
      { status: 500 }
    )
  }
} 