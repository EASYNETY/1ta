// hooks/usePermissions.ts

import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/user.types";

// Define all possible permissions in the system
export type Permission = 
  // General permissions
  | 'view_dashboard'
  | 'view_courses'
  | 'view_attendance'
  | 'view_timetable'
  | 'view_analytics'
  
  // User management permissions
  | 'manage_users'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'deactivate_users'
  
  // Payment permissions
  | 'view_payments'
  | 'manage_payments'
  | 'view_payment_analytics'
  | 'generate_payment_reports'
  | 'reconcile_payments'
  | 'view_own_payments'
  
  // Course management permissions
  | 'manage_courses'
  | 'create_courses'
  | 'edit_courses'
  | 'delete_courses'
  | 'view_course_analytics'
  
  // Support permissions
  | 'view_tickets'
  | 'manage_tickets'
  | 'view_feedback'
  | 'manage_feedback'
  
  // Customer care permissions
  | 'scan_barcodes'
  | 'view_student_info_readonly'
  | 'view_attendance_readonly'
  | 'view_timetable_readonly'
  
  // Admin analytics permissions
  | 'view_admin_analytics'
  | 'view_system_reports'
  
  // Delete permissions (only super admin)
  | 'delete_any_data'
  
  // Accounting specific permissions
  | 'access_accounting_dashboard'
  | 'view_financial_reports'
  | 'manage_billing';

// Define role-based permission matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Super Admin has ALL permissions
    'view_dashboard',
    'view_courses',
    'view_attendance',
    'view_timetable',
    'view_analytics',
    'manage_users',
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'deactivate_users',
    'view_payments',
    'manage_payments',
    'view_payment_analytics',
    'generate_payment_reports',
    'reconcile_payments',
    'manage_courses',
    'create_courses',
    'edit_courses',
    'delete_courses',
    'view_course_analytics',
    'view_tickets',
    'manage_tickets',
    'view_feedback',
    'manage_feedback',
    'scan_barcodes',
    'view_student_info_readonly',
    'view_attendance_readonly',
    'view_timetable_readonly',
    'view_admin_analytics',
    'view_system_reports',
    'delete_any_data',
    'access_accounting_dashboard',
    'view_financial_reports',
    'manage_billing'
  ],
  
  admin: [
    // Admin has most permissions except analytics and delete
    'view_dashboard',
    'view_courses',
    'view_attendance',
    'view_timetable',
    // NO 'view_analytics' - Admin cannot access analytics
    'manage_users',
    'view_users',
    'create_users',
    'edit_users',
    // NO 'delete_users' - Admin can only deactivate
    'deactivate_users',
    'view_payments', // Read-only payment access
    // NO 'manage_payments' - Admin has read-only payment access
    'manage_courses',
    'create_courses',
    'edit_courses',
    // NO 'delete_courses' - Admin cannot delete
    'view_tickets',
    'manage_tickets',
    'view_feedback',
    'manage_feedback',
    'scan_barcodes'
    // NO admin analytics access
    // NO delete permissions
  ],
  
  accounting: [
    // Accounting has specialized payment dashboard access
    'view_dashboard', // Custom accounting dashboard
    'view_payments',
    'manage_payments',
    'view_payment_analytics',
    'generate_payment_reports',
    'reconcile_payments',
    'access_accounting_dashboard',
    'view_financial_reports',
    'manage_billing'
    // NO access to user management, courses, analytics, etc.
  ],
  
  customer_care: [
    // Customer Care has limited read-only access
    'view_dashboard',
    'view_tickets',
    'manage_tickets',
    'view_feedback',
    'manage_feedback',
    'scan_barcodes',
    'view_student_info_readonly',
    'view_attendance_readonly',
    'view_timetable_readonly'
    // NO access to payments, user management, course management, etc.
  ],
  
  teacher: [
    // Teachers have course and student management access
    'view_dashboard',
    'view_courses',
    'view_attendance',
    'view_timetable',
    'view_analytics',
    'manage_courses',
    'create_courses',
    'edit_courses',
    'view_users', // Can view students
    'view_tickets',
    'manage_tickets'
    // NO delete permissions, NO payment access, NO admin features
  ],
  
  student: [
    // Students have basic access to their own data
    'view_dashboard',
    'view_courses',
    'view_attendance',
    'view_timetable',
    'view_analytics',
    'view_own_payments',
    'view_tickets',
    'manage_tickets' // Can create/manage their own tickets
    // NO access to management features
  ]
};

export const usePermissions = () => {
  const { user } = useAppSelector(state => state.auth);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Get permissions for user's role
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Convenience methods for common permission checks
  const canDelete = (): boolean => hasPermission('delete_any_data');
  
  const canViewAnalytics = (): boolean => hasPermission('view_analytics');
  
  const canViewAdminAnalytics = (): boolean => hasPermission('view_admin_analytics');
  
  const canManagePayments = (): boolean => hasPermission('manage_payments');
  
  const canViewPayments = (): boolean => hasPermission('view_payments');
  
  const canAccessAccountingDashboard = (): boolean => hasPermission('access_accounting_dashboard');
  
  const canScanBarcodes = (): boolean => hasPermission('scan_barcodes');
  
  const canManageUsers = (): boolean => hasPermission('manage_users');
  
  const canDeleteUsers = (): boolean => hasPermission('delete_users');
  
  const canDeactivateUsers = (): boolean => hasPermission('deactivate_users');

  const canManageCourses = (): boolean => hasPermission('manage_courses');

  const canDeleteCourses = (): boolean => hasPermission('delete_courses');

  // Role-based checks
  const isSuperAdmin = (): boolean => user?.role === 'super_admin';
  
  const isAdmin = (): boolean => user?.role === 'admin';
  
  const isAccounting = (): boolean => user?.role === 'accounting';
  
  const isCustomerCare = (): boolean => user?.role === 'customer_care';
  
  const isTeacher = (): boolean => user?.role === 'teacher';
  
  const isStudent = (): boolean => user?.role === 'student';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canDelete,
    canViewAnalytics,
    canViewAdminAnalytics,
    canManagePayments,
    canViewPayments,
    canAccessAccountingDashboard,
    canScanBarcodes,
    canManageUsers,
    canDeleteUsers,
    canDeactivateUsers,
    canManageCourses,
    canDeleteCourses,
    isSuperAdmin,
    isAdmin,
    isAccounting,
    isCustomerCare,
    isTeacher,
    isStudent,
    userRole: user?.role || null
  };
};
