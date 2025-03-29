import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { generateToken, generateRefreshToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.accountLocked) {
      if (user.lockUntil && user.lockUntil > new Date()) {
        return NextResponse.json(
          { error: 'Account is temporarily locked' },
          { status: 401 }
        )
      }
      // Reset lock if time has passed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accountLocked: false,
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      })
    }

    // Verify password
    const isValid = await compare(data.password, user.password!)
    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      const shouldLock = failedAttempts >= 5

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          accountLocked: shouldLock,
          lockUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 minutes
          lastFailedLogin: new Date(),
        },
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
      },
    })

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(user),
        refreshToken: generateRefreshToken(user),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Log login history
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        status: 'SUCCESS',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      message: 'Login successful',
      token: session.token,
      refreshToken: session.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
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