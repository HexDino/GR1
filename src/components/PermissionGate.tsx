"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

type PermissionGateProps = {
  children: ReactNode;
  resource?: string;
  action?: string;
  scope?: string;
  requiredRole?: "PATIENT" | "DOCTOR" | "ADMIN";
  fallback?: ReactNode;
  redirectTo?: string;
};

/**
 * Component to conditionally render content based on user permissions
 */
export function PermissionGate({
  children,
  resource,
  action,
  scope,
  requiredRole,
  fallback = null,
  redirectTo,
}: PermissionGateProps) {
  const router = useRouter();
  const { hasPermission, hasRole, isLoading, isAuthenticated } = usePermissions();
  
  // If still loading, show nothing (or could show a loading spinner)
  if (isLoading) {
    return null; 
  }
  
  // Check if user is authenticated first
  if (!isAuthenticated()) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return fallback;
  }
  
  // If role is specified, check role
  if (requiredRole && !hasRole(requiredRole)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return fallback;
  }
  
  // If permission is specified, check permission
  if (resource && action) {
    if (!hasPermission(resource, action, scope)) {
      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }
      return fallback;
    }
  }
  
  // User has permission, render children
  return <>{children}</>;
}

/**
 * Component to only render content for authenticated users
 */
export function AuthenticatedOnly({
  children,
  fallback = null,
  redirectTo = "/login",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <PermissionGate fallback={fallback} redirectTo={redirectTo}>
      {children}
    </PermissionGate>
  );
}

/**
 * Component to render content based on user role
 */
export function RoleGate({
  children,
  role,
  fallback = null,
  redirectTo,
}: {
  children: ReactNode;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <PermissionGate
      requiredRole={role}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Components for specific roles
 */
export function AdminOnly({ 
  children, 
  fallback = null, 
  redirectTo = "/dashboard" 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <RoleGate role="ADMIN" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGate>
  );
}

export function DoctorOnly({ 
  children, 
  fallback = null, 
  redirectTo = "/dashboard" 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <RoleGate role="DOCTOR" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGate>
  );
}

export function PatientOnly({ 
  children, 
  fallback = null, 
  redirectTo = "/dashboard" 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <RoleGate role="PATIENT" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGate>
  );
} 