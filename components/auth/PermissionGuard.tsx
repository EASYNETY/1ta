// components/auth/PermissionGuard.tsx

import React, { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { UserRole } from '@/types/user.types';

interface PermissionGuardProps {
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions - user needs ANY of these */
  permissions?: Permission[];
  /** Multiple permissions - user needs ALL of these */
  requireAllPermissions?: Permission[];
  /** Allowed roles - alternative to permission-based checking */
  allowedRoles?: UserRole[];
  /** Content to render if user has permission */
  children: ReactNode;
  /** Content to render if user doesn't have permission */
  fallback?: ReactNode;
  /** If true, renders nothing when permission is denied (default: true) */
  hideOnDenied?: boolean;
}

/**
 * PermissionGuard component for protecting UI elements based on user permissions or roles
 * 
 * Usage examples:
 * 
 * // Single permission check
 * <PermissionGuard permission="delete_users">
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * // Multiple permissions (user needs ANY)
 * <PermissionGuard permissions={["view_payments", "manage_payments"]}>
 *   <PaymentSection />
 * </PermissionGuard>
 * 
 * // Multiple permissions (user needs ALL)
 * <PermissionGuard requireAllPermissions={["manage_users", "delete_users"]}>
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * // Role-based check
 * <PermissionGuard allowedRoles={["super_admin", "admin"]}>
 *   <AdminFeature />
 * </PermissionGuard>
 * 
 * // With fallback content
 * <PermissionGuard permission="view_analytics" fallback={<div>Analytics not available</div>}>
 *   <AnalyticsChart />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions,
  requireAllPermissions,
  allowedRoles,
  children,
  fallback = null,
  hideOnDenied = true
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    userRole 
  } = usePermissions();

  // Determine if user has access
  let hasAccess = false;

  if (allowedRoles && userRole) {
    // Role-based check
    hasAccess = allowedRoles.includes(userRole);
  } else if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    // Multiple permissions - user needs ANY
    hasAccess = hasAnyPermission(permissions);
  } else if (requireAllPermissions) {
    // Multiple permissions - user needs ALL
    hasAccess = hasAllPermissions(requireAllPermissions);
  } else {
    // No permission criteria specified - deny access by default
    hasAccess = false;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (hideOnDenied && !fallback) {
    return null;
  }

  return <>{fallback}</>;
};

// Convenience components for common permission checks

interface DeleteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard for delete operations - only Super Admin can delete
 */
export const DeleteGuard: React.FC<DeleteGuardProps> = ({ children, fallback }) => (
  <PermissionGuard permission="delete_any_data" fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  includeSuperAdmin?: boolean;
}

/**
 * Guard for admin-only features
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallback, 
  includeSuperAdmin = true 
}) => {
  const allowedRoles: UserRole[] = includeSuperAdmin 
    ? ['super_admin', 'admin'] 
    : ['admin'];
    
  return (
    <PermissionGuard allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
};

interface SuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard for super admin only features
 */
export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children, fallback }) => (
  <PermissionGuard allowedRoles={['super_admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface AccountingGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard for accounting features
 */
export const AccountingGuard: React.FC<AccountingGuardProps> = ({ children, fallback }) => (
  <PermissionGuard allowedRoles={['super_admin', 'accounting']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface CustomerCareGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard for customer care features
 */
export const CustomerCareGuard: React.FC<CustomerCareGuardProps> = ({ children, fallback }) => (
  <PermissionGuard allowedRoles={['super_admin', 'customer_care']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

interface PaymentGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  readOnly?: boolean;
}

/**
 * Guard for payment-related features
 */
export const PaymentGuard: React.FC<PaymentGuardProps> = ({ 
  children, 
  fallback, 
  readOnly = false 
}) => {
  const permission = readOnly ? 'view_payments' : 'manage_payments';
  
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
};

interface AnalyticsGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  adminOnly?: boolean;
}

/**
 * Guard for analytics features
 */
export const AnalyticsGuard: React.FC<AnalyticsGuardProps> = ({ 
  children, 
  fallback, 
  adminOnly = false 
}) => {
  const permission = adminOnly ? 'view_admin_analytics' : 'view_analytics';
  
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
};
