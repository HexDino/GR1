import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookie
    const token = req.cookies.get('token')?.value;
    
    console.log('[ME API] Checking token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    console.log('[ME API] Token verified, userId:', payload.userId);
    
    // SPECIAL CASE: For test doctor account
    if (payload.userId === 'test-doctor-id') {
      console.log('[ME API] Using test doctor account');
      
      // Return mock data for test doctor
      return NextResponse.json({
        user: {
          id: 'test-doctor-id',
          email: 'doctor@test.com',
          name: 'Test Doctor',
          role: 'DOCTOR',
          isActive: true,
          avatar: null,
          doctor: {
            id: 'test-doctor-profile-id',
            specialization: 'General Medicine',
            experience: 5,
            bio: 'Test doctor for development purposes',
            imageUrl: '/healthcare/doctors/doctor-1.jpg',
            rating: 4.5,
            department: {
              id: 'test-department-id',
              name: 'General Medicine'
            }
          },
          patient: null
        },
        permissions: [
          {
            name: 'doctor:read',
            resource: 'doctor',
            action: 'read'
          },
          {
            name: 'doctor:write',
            resource: 'doctor',
            action: 'write'
          },
          {
            name: 'patient:read',
            resource: 'patient',
            action: 'read'
          }
        ],
        authExpires: new Date(payload.exp! * 1000).toISOString()
      });
    }
    
    // Remove test patient case - now using real authentication only
    
    // For normal users, proceed with database query
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
      console.log('[ME API] User not found with ID:', payload.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('[ME API] User found:', { id: user.id, email: user.email, role: user.role });
    
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
      action: up.permission.action || ''
    }));
    
    const rolePerm = rolePermissions.map(rp => ({
      name: rp.permission.name,
      resource: rp.permission.resource || '',
      action: rp.permission.action || ''
    }));
    
    // Combine all permissions
    const allPermissions = [...userPermissions, ...rolePerm];
    
    // Remove duplicate permissions
    const uniquePermissions = Array.from(
      new Set(allPermissions.map(p => p.name))
    ).map(name => 
      allPermissions.find(p => p.name === name)
    );
    
    console.log('[ME API] Permissions loaded, returning data');
    
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
    console.error('[ME API] Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 