import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';

/**
 * Check if a user has a specific permission
 * @param userId - The user ID
 * @param resource - The resource to check (e.g. 'patient', 'appointment')
 * @param action - The action to check (e.g. 'create', 'view', 'update')
 * @param scope - Optional scope (e.g. 'own', 'assigned', 'all')
 */
export async function hasPermission(
  userId: string,
  resource: string, 
  action: string,
  scope?: string
): Promise<boolean> {
  // Get user with their role and permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissions: {
        include: { permission: true }
      }
    }
  });
  
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Check user's specific permissions
  const hasExplicitPermission = user.permissions.some(userPerm => {
    const perm = userPerm.permission;
    
    // Check if resource and action match
    const resourceMatch = perm.resource === resource;
    const actionMatch = perm.action === action;
    
    // If scope is provided, check it too, otherwise just check resource and action
    if (scope && perm.scope) {
      return resourceMatch && actionMatch && perm.scope === scope;
    }
    
    return resourceMatch && actionMatch;
  });
  
  if (hasExplicitPermission) return true;
  
  // Check role-based permissions
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role: user.role as UserRole,
      permission: {
        resource,
        action,
        ...(scope ? { scope } : {})
      }
    },
    include: {
      permission: true
    }
  });
  
  return !!rolePermission;
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(role: UserRole): Promise<string[]> {
  const permissions = await prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true }
  });
  
  return permissions.map(p => 
    `${p.permission.resource}:${p.permission.action}${p.permission.scope ? `:${p.permission.scope}` : ''}`
  );
}

/**
 * Check if a user has a role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  return user?.role === role;
}

/**
 * Determine if a user can access a patient's data
 */
export async function canAccessPatientData(
  userId: string, 
  patientId: string
): Promise<boolean> {
  // Admin can access all patient data
  const isAdmin = await hasRole(userId, 'ADMIN');
  if (isAdmin) return true;
  
  // Patients can only access their own data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { patient: true }
  });
  
  if (user?.role === 'PATIENT') {
    return user.patient?.id === patientId;
  }
  
  // Doctors can access data of patients with appointments with them
  if (user?.role === 'DOCTOR') {
    const hasAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: userId,
        patientId: patientId
      }
    });
    
    return !!hasAppointment;
  }
  
  return false;
} 