import { useState, useEffect } from 'react';

type Permission = {
  name: string;
  resource: string;
  action: string;
  scope?: string;
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  permissions: Permission[];
};

export function usePermissions() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Fetch user data and permissions
  useEffect(() => {
    let isMounted = true;
    
    async function fetchUserData() {
      try {
        setIsLoading(true);
        console.log('[usePermissions] Fetching user data...');
        const response = await fetch('/api/auth/me');
        
        // Người dùng chưa đăng nhập
        if (response.status === 401) {
          console.log('[usePermissions] User not authenticated');
          if (isMounted) {
            setUserInfo(null);
            setPermissions([]);
            setIsLoading(false);
          }
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to load user data');
        }
        
        const data = await response.json();
        console.log('[usePermissions] User data received:', data);
        
        if (isMounted) {
          setUserInfo({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            permissions: data.permissions || []
          });
          setPermissions(data.permissions || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[usePermissions] Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setUserInfo(null);
          setPermissions([]);
          setIsLoading(false);
        }
      }
    }
    
    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  /**
   * Check if user has specific permission
   */
  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!userInfo) return false;
    
    // Admin has all permissions
    if (userInfo.role === 'ADMIN') return true;
    
    return permissions.some(permission => {
      // Check resource and action
      const resourceMatch = permission.resource === resource;
      const actionMatch = permission.action === action;
      
      // If scope is specified, check it too
      if (scope && permission.scope) {
        return resourceMatch && actionMatch && permission.scope === scope;
      }
      
      return resourceMatch && actionMatch;
    });
  };
  
  /**
   * Check if user has specific role
   */
  const hasRole = (role: 'PATIENT' | 'DOCTOR' | 'ADMIN'): boolean => {
    if (!userInfo) return false;
    return userInfo.role === role;
  };
  
  /**
   * Check if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return !!userInfo;
  };
  
  return {
    isLoading,
    error,
    user: userInfo,
    permissions,
    hasPermission,
    hasRole,
    isAuthenticated
  };
} 