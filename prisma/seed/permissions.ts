import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Define permissions structure
type PermissionDef = {
  name: string;
  resource: string;
  action: string;
  scope?: string;
  description: string;
};

// Patient permissions
const patientPermissions: PermissionDef[] = [
  {
    name: 'patient:view_own_profile',
    resource: 'patient',
    action: 'view',
    scope: 'own',
    description: 'View own patient profile'
  },
  {
    name: 'patient:edit_own_profile',
    resource: 'patient',
    action: 'edit',
    scope: 'own',
    description: 'Edit own patient profile'
  },
  {
    name: 'appointment:create',
    resource: 'appointment',
    action: 'create',
    description: 'Create new appointments'
  },
  {
    name: 'appointment:view_own',
    resource: 'appointment',
    action: 'view',
    scope: 'own',
    description: 'View own appointments'
  },
  {
    name: 'appointment:cancel_own',
    resource: 'appointment',
    action: 'cancel',
    scope: 'own',
    description: 'Cancel own appointments'
  },
  {
    name: 'doctor:view',
    resource: 'doctor',
    action: 'view',
    description: 'View doctor profiles'
  },
  {
    name: 'review:create',
    resource: 'review',
    action: 'create',
    description: 'Create reviews for doctors'
  },
  {
    name: 'review:view',
    resource: 'review',
    action: 'view',
    description: 'View doctor reviews'
  }
];

// Doctor permissions
const doctorPermissions: PermissionDef[] = [
  {
    name: 'doctor:view_own_profile',
    resource: 'doctor',
    action: 'view',
    scope: 'own',
    description: 'View own doctor profile'
  },
  {
    name: 'doctor:edit_own_profile',
    resource: 'doctor',
    action: 'edit',
    scope: 'own',
    description: 'Edit own doctor profile'
  },
  {
    name: 'doctor:manage_schedule',
    resource: 'doctor',
    action: 'manage_schedule',
    scope: 'own',
    description: 'Manage own schedule'
  },
  {
    name: 'patient:view',
    resource: 'patient',
    action: 'view',
    scope: 'assigned',
    description: 'View assigned patient profiles'
  },
  {
    name: 'appointment:view_assigned',
    resource: 'appointment',
    action: 'view',
    scope: 'assigned',
    description: 'View assigned appointments'
  },
  {
    name: 'appointment:confirm',
    resource: 'appointment',
    action: 'confirm',
    description: 'Confirm appointments'
  },
  {
    name: 'appointment:cancel',
    resource: 'appointment',
    action: 'cancel',
    description: 'Cancel appointments'
  },
  {
    name: 'appointment:complete',
    resource: 'appointment',
    action: 'complete',
    description: 'Mark appointments as completed'
  },
  {
    name: 'medical_record:create',
    resource: 'medical_record',
    action: 'create',
    description: 'Create medical records'
  },
  {
    name: 'medical_record:view',
    resource: 'medical_record',
    action: 'view',
    description: 'View medical records'
  },
  {
    name: 'medical_record:edit',
    resource: 'medical_record',
    action: 'edit',
    description: 'Edit medical records'
  },
  {
    name: 'prescription:create',
    resource: 'prescription',
    action: 'create',
    description: 'Create prescriptions'
  },
  {
    name: 'prescription:view',
    resource: 'prescription',
    action: 'view',
    description: 'View prescriptions'
  },
  {
    name: 'prescription:edit',
    resource: 'prescription',
    action: 'edit',
    description: 'Edit prescriptions'
  }
];

// Admin permissions - admin gets all permissions automatically

// Create all permissions and role permissions
export async function seedPermissions() {
  console.log('Seeding permissions...');

  // Combine all permission definitions
  const allPermissions = [...patientPermissions, ...doctorPermissions];
  
  // Insert permissions
  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        description: perm.description
      },
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        description: perm.description
      }
    });
  }

  console.log(`Created ${allPermissions.length} permissions`);
  
  // Create role permissions
  
  // Patient role permissions
  for (const perm of patientPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.PATIENT,
          permissionId: (await prisma.permission.findUnique({ where: { name: perm.name } }))!.id
        }
      },
      update: {},
      create: {
        role: UserRole.PATIENT,
        permission: {
          connect: { name: perm.name }
        }
      }
    });
  }
  
  // Doctor role permissions
  for (const perm of doctorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.DOCTOR,
          permissionId: (await prisma.permission.findUnique({ where: { name: perm.name } }))!.id
        }
      },
      update: {},
      create: {
        role: UserRole.DOCTOR,
        permission: {
          connect: { name: perm.name }
        }
      }
    });
  }
  
  console.log('Role permissions created');
}

// For testing directly
if (require.main === module) {
  seedPermissions()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
} 