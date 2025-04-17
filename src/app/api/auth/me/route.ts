import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookie
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = verifyToken(token);
    
    // Get the user from database with permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        permissions: {
          include: {
            permission: true
          }
        },
        doctor: {
          select: {
            id: true,
            specialization: true,
            experience: true,
            bio: true,
            imageUrl: true,
            rating: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            gender: true,
            profileImage: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: user.role
      },
      include: {
        permission: true
      }
    });
    
    // Format permissions for easy checking on client
    const userPermissions = user.permissions.map(up => ({
      name: up.permission.name,
      resource: up.permission.resource || '',
      action: up.permission.action || '',
      scope: up.permission.scope
    }));
    
    const rolePerm = rolePermissions.map(rp => ({
      name: rp.permission.name,
      resource: rp.permission.resource || '',
      action: rp.permission.action || '',
      scope: rp.permission.scope
    }));
    
    // Combine all permissions
    const allPermissions = [...userPermissions, ...rolePerm];
    
    // Remove duplicate permissions
    const uniquePermissions = Array.from(
      new Set(allPermissions.map(p => p.name))
    ).map(name => 
      allPermissions.find(p => p.name === name)
    );
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        doctor: user.doctor,
        patient: user.patient
      },
      permissions: uniquePermissions,
      authExpires: new Date(payload.exp! * 1000).toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 