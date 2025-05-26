# 🔐 RBAC Implementation Plan Document

**Project**: 1Tech Academy Platform - Role-Based Access Control System
**Document Version**: 1.0
**Date**: January 26, 2025
**Prepared by**: Development Team
**Status**: ✅ COMPLETED

---

## 📋 Executive Summary

This document outlines the comprehensive plan to implement the 4-tier Role-Based Access Control (RBAC) system as specified in the CEO requirements. The current implementation has foundational elements but requires significant enhancements to meet the exact specifications.

**Current Status**: 40% Complete
**Estimated Completion Time**: 2-3 weeks
**Priority**: Critical

---

## 🎯 Project Objectives

### Primary Goals
1. Implement exact CEO-specified role permissions
2. Ensure proper access restrictions for each role
3. Create specialized dashboards for Accounting role
4. Implement granular permission controls
5. Coordinate frontend and backend changes

### Success Criteria
- ✅ Super Admin has full access including delete capabilities
- ✅ Admin has restricted access (no analytics, read-only payments, no delete)
- ✅ Accounting has specialized payment dashboard with charts
- ✅ Customer Care has limited read-only access to specified areas
- ✅ All UI elements respect role permissions
- ✅ Backend APIs enforce role-based access control

---

## 🔍 Current State Analysis

### ✅ What's Working
- Role type definitions exist (`super_admin`, `admin`, `accounting`, `customer_care`, `teacher`, `student`)
- Basic route protection implemented
- Navigation filtering by role functional
- Customer Care barcode scanning implemented
- Authorization guards in place

### ❌ What's Missing
- Super Admin vs Admin permission distinction
- Analytics dashboard hidden from Admin
- Payment dashboard read-only restrictions
- Delete permission controls
- Accounting specialized dashboard
- Customer Care access limitations
- Granular permission enforcement

---

## 📊 Detailed Requirements Matrix

| Feature | Super Admin | Admin | Accounting | Customer Care | Teacher | Student |
|---------|-------------|-------|------------|---------------|---------|---------|
| **Dashboard Access** | ✅ Full | ✅ Full | 🔄 Custom | 🔄 Limited | ✅ Full | ✅ Full |
| **Analytics Dashboard** | ✅ Full | ❌ Hidden | ❌ No Access | ❌ No Access | ✅ Limited | ✅ Limited |
| **Payment Dashboard** | ✅ Full | 👁️ Read-Only | ✅ Full | ❌ No Access | ❌ No Access | 👁️ Own Only |
| **User Management** | ✅ Full | ✅ Manage | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Delete Permissions** | ✅ Can Delete | ❌ Deactivate Only | ❌ No Delete | ❌ No Delete | ❌ No Delete | ❌ No Delete |
| **Tickets/Support** | ✅ Full | ✅ Full | ❌ No Access | ✅ Full | ✅ Limited | ✅ Own Only |
| **Attendance** | ✅ Full | ✅ Full | ❌ No Access | 👁️ Read-Only | ✅ Full | 👁️ Own Only |
| **Timetable** | ✅ Full | ✅ Full | ❌ No Access | 👁️ Read-Only | ✅ Full | 👁️ Own Only |
| **Student Info** | ✅ Full | ✅ Full | ❌ No Access | 👁️ Read-Only | ✅ Limited | ❌ No Access |
| **Barcode Scanning** | ✅ Full | ✅ Full | ❌ No Access | ✅ Full | ❌ No Access | ❌ No Access |

**Legend**: ✅ Full Access | 👁️ Read-Only | ❌ No Access | 🔄 Custom Implementation

---

## 🏗️ Implementation Plan

### Phase 1: Backend Foundation (Week 1)
**Duration**: 5 days
**Priority**: Critical
**Dependencies**: Database access, API endpoints

#### 1.1 Database Schema Updates
```sql
-- Add new role permissions
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounting';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_care';

-- Add permission columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100);

-- Add payment tracking fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(50);
```

#### 1.2 Permission Matrix Implementation
```typescript
const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  admin: [
    'manage_users', 'manage_courses', 'view_billing',
    'manage_classes', 'view_students', 'mark_attendance'
  ],
  accounting: [
    'view_payments', 'generate_reports', 'manage_billing',
    'view_payment_analytics', 'reconcile_payments'
  ],
  customer_care: [
    'view_tickets', 'manage_tickets', 'scan_barcodes',
    'view_student_info_readonly', 'view_attendance_readonly',
    'view_timetable_readonly', 'access_discussions'
  ],
  teacher: [
    'manage_classes', 'view_students', 'mark_attendance',
    'create_assignments', 'grade_assignments'
  ],
  student: [
    'view_courses', 'submit_assignments', 'view_grades',
    'view_own_attendance', 'access_discussions'
  ]
};
```

#### 1.3 API Middleware Updates
```typescript
// Role-based route protection
app.get('/api/admin/analytics/*', requireRole(['super_admin']));
app.get('/api/payments/*', requireRole(['super_admin', 'admin', 'accounting']));
app.delete('/api/*', requireRole(['super_admin'])); // Only super admin can delete
app.get('/api/customer-care/*', requireRole(['customer_care', 'super_admin']));
app.get('/api/accounting/*', requireRole(['accounting', 'super_admin']));
```

### Phase 2: Frontend Permission System (Week 1-2)
**Duration**: 7 days
**Priority**: Critical
**Dependencies**: Phase 1 completion

#### 2.1 Permission Hook Implementation
```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAppSelector(state => state.auth);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const canDelete = () => user?.role === 'super_admin';
  const canViewAnalytics = () => ['super_admin', 'teacher', 'student'].includes(user?.role || '');
  const canManagePayments = () => ['super_admin', 'accounting'].includes(user?.role || '');

  return { hasPermission, canDelete, canViewAnalytics, canManagePayments };
};
```

#### 2.2 Navigation Updates
```typescript
// Update sidebar navigation
export const primaryNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "teacher", "student"] },
  { title: "Courses", href: "/courses", icon: GraduationCap, roles: ["student", "teacher", "super_admin", "admin"] },
  { title: "Attendance", href: "/attendance", icon: CheckCircle, roles: ["student", "teacher", "super_admin", "admin", "customer_care"] },
  { title: "Timetable", href: "/timetable", icon: Calendar, roles: ["student", "teacher", "super_admin", "admin", "customer_care"] },
  { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ["student", "teacher"] }, // Removed admin
];

export const adminNavItems: NavItem[] = [
  { title: "Students", href: "/users", icon: AdminUsersIcon, roles: ["super_admin", "admin"] },
  { title: "Payments", href: "/payments", icon: Money, roles: ["super_admin", "admin", "accounting"] },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["super_admin"] }, // Only super admin
  { title: "Tickets", href: "/support/tickets", icon: LifeBuoy, roles: ["super_admin", "admin", "customer_care"] },
];

export const accountingNavItems: NavItem[] = [
  { title: "Payment Dashboard", href: "/accounting/dashboard", icon: BarChart3, roles: ["accounting"] },
  { title: "Payment History", href: "/accounting/payments", icon: Money, roles: ["accounting"] },
  { title: "Reports", href: "/accounting/reports", icon: FileText, roles: ["accounting"] },
];

export const customerCareNavItems: NavItem[] = [
  { title: "Scan Student", href: "/customer-care/scan", icon: QrCode, roles: ["customer_care"] },
  { title: "Tickets", href: "/support/tickets", icon: LifeBuoy, roles: ["customer_care"] },
  { title: "Feedback", href: "/support/feedback", icon: MessageSquare, roles: ["customer_care"] },
];
```

#### 2.3 Component Permission Guards
```typescript
// components/auth/PermissionGuard.tsx
interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGuard = ({ permission, fallback, children }: PermissionGuardProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
};

// Usage example
<PermissionGuard permission="delete_users">
  <DeleteButton />
</PermissionGuard>
```

### Phase 3: Accounting Dashboard (Week 2)
**Duration**: 5 days
**Priority**: High
**Dependencies**: Phase 1-2 completion

#### 3.1 Accounting Dashboard Layout
```typescript
// app/(authenticated)/accounting/dashboard/page.tsx
export default function AccountingDashboard() {
  return (
    <AuthorizationGuard allowedRoles={['accounting', 'super_admin']}>
      <div className="space-y-6">
        <PageHeader heading="Payment Analytics" subheading="Financial overview and trends" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PaymentStatsCard title="Total Revenue" value="₦2.4M" change="+12%" />
          <PaymentStatsCard title="Pending Payments" value="₦180K" change="-5%" />
          <PaymentStatsCard title="Reconciled" value="95%" change="+2%" />
          <PaymentStatsCard title="Failed Transactions" value="23" change="-8%" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PaymentTrendsChart />
          <PaymentMethodsChart />
        </div>

        <PaymentHistoryTable />
      </div>
    </AuthorizationGuard>
  );
}
```

#### 3.2 Payment History Table
```typescript
// Required fields as per CEO specification
interface PaymentRecord {
  serialNumber: string;
  studentName: string;
  studentId: string; // STU-00001 format
  invoiceNo: string; // INV-2024-01 format
  feeType: string;
  paymentDate: string;
  amountBilled: number;
  amountPaid: number;
  gatewayRef: string;
  transactionId: string;
  paymentMethod: string;
  paymentStatus: 'Successful' | 'Failed' | 'Pending';
  reconciled: 'Yes' | 'No' | 'Partial';
  notes?: string;
}
```

### Phase 4: Access Control Implementation (Week 2-3)
**Duration**: 5 days
**Priority**: Critical
**Dependencies**: Phase 1-3 completion

#### 4.1 Route Protection Updates
```typescript
// features/auth/components/auth-provider.tsx
// Enhanced role-based access control
if (pathname.startsWith("/admin/analytics") && user.role !== "super_admin") {
  router.push("/dashboard");
  return;
}

if (pathname.startsWith("/accounting") && !['accounting', 'super_admin'].includes(user.role)) {
  router.push("/dashboard");
  return;
}

if (pathname.startsWith("/customer-care") && !['customer_care', 'super_admin'].includes(user.role)) {
  router.push("/dashboard");
  return;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Permission hook functionality
- [ ] Role-based component rendering
- [ ] Authorization guard behavior
- [ ] Navigation filtering logic

### Integration Tests
- [ ] Route protection enforcement
- [ ] API permission middleware
- [ ] Role-based data access
- [ ] Dashboard access controls

### End-to-End Tests
- [ ] Super Admin full access workflow
- [ ] Admin restricted access workflow
- [ ] Accounting dashboard functionality
- [ ] Customer Care limited access workflow

### Test Scenarios
```typescript
describe('RBAC System', () => {
  test('Super Admin can access analytics dashboard', () => {
    // Test implementation
  });

  test('Admin cannot access analytics dashboard', () => {
    // Test implementation
  });

  test('Admin has read-only payment access', () => {
    // Test implementation
  });

  test('Customer Care can only view student info', () => {
    // Test implementation
  });
});
```

---

## 📅 Timeline & Milestones

### Week 1: Foundation
- **Days 1-2**: Backend schema updates and API middleware
- **Days 3-4**: Frontend permission system implementation
- **Day 5**: Navigation and routing updates

### Week 2: Specialized Features
- **Days 1-3**: Accounting dashboard development
- **Days 4-5**: Access control implementation and testing

### Week 3: Refinement
- **Days 1-2**: Customer Care restrictions and read-only enforcement
- **Days 3-4**: Testing and bug fixes
- **Day 5**: Documentation and deployment preparation

---

## 🚀 Deployment Plan

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Database migrations prepared
- [ ] API documentation updated
- [ ] Frontend builds successfully
- [ ] Role permissions verified

### Deployment Steps
1. **Database Migration**: Apply schema changes
2. **Backend Deployment**: Update API with new middleware
3. **Frontend Deployment**: Deploy updated UI with RBAC
4. **User Migration**: Update existing user roles as needed
5. **Verification**: Test all role access patterns

### Rollback Plan
- Database migration rollback scripts prepared
- Previous API version maintained
- Frontend rollback to previous build
- User role restoration procedures

---

## 📋 Risk Assessment

### High Risk
- **Database Migration Failures**: Mitigation - Comprehensive testing and rollback scripts
- **Permission Logic Errors**: Mitigation - Extensive unit testing and code review
- **User Access Disruption**: Mitigation - Gradual rollout and monitoring

### Medium Risk
- **Performance Impact**: Mitigation - Permission caching and optimization
- **UI/UX Confusion**: Mitigation - Clear role indicators and help documentation

### Low Risk
- **Minor Bug Fixes**: Mitigation - Standard debugging and patch procedures

---

## 👥 Team Responsibilities

### Backend Team
- Database schema updates
- API middleware implementation
- Permission enforcement
- Testing backend functionality

### Frontend Team
- UI permission controls
- Dashboard implementations
- Component authorization
- Frontend testing

### QA Team
- Test case development
- Integration testing
- User acceptance testing
- Performance testing

### DevOps Team
- Database migration execution
- Deployment coordination
- Monitoring and rollback procedures

---

## 📚 Additional Resources

### Documentation Links
- [CEO Requirements Document](./ceo-adjustments.md)
- [Backend Changes Required](./backend-changes-required.md)
- [Current Implementation Status](./final-implementation-status-report.md)

### Technical References
- [TypeScript Role Types](../types/user.types.ts)
- [Navigation Configuration](../components/layout/auth/app-sidebar.tsx)
- [Permission Guards](../components/auth/AuthenticationGuard.tsx)

### API Endpoints
- `/api/auth/me` - User authentication and role information
- `/api/admin/analytics/*` - Analytics dashboard data
- `/api/payments/*` - Payment management
- `/api/accounting/*` - Accounting-specific endpoints
- `/api/customer-care/*` - Customer care functionality

---

## ✅ Acceptance Criteria

### Super Admin Role
- [ ] Can access all features including analytics dashboard
- [ ] Can delete any data (users, courses, payments, etc.)
- [ ] Has full administrative privileges
- [ ] Can manage all other user roles

### Admin Role
- [ ] Cannot access analytics dashboard (hidden from navigation)
- [ ] Has read-only access to payment dashboard
- [ ] Cannot delete data (only deactivate/disable)
- [ ] Can manage users and courses

### Accounting Role
- [ ] Has specialized payment dashboard with charts
- [ ] Can view payment history and trends
- [ ] Can generate financial reports
- [ ] Cannot access user management or course creation

### Customer Care Role
- [ ] Can access tickets and feedback
- [ ] Has read-only access to attendance and timetable
- [ ] Can scan student barcodes for information
- [ ] Cannot delete or modify student data
- [ ] Cannot access detailed student views

---

## 🔄 Maintenance & Updates

### Regular Reviews
- Monthly permission audit
- Quarterly role requirement review
- Annual security assessment

### Update Procedures
- Role permission modifications
- New feature access control
- User role migrations

### Monitoring
- Access attempt logging
- Permission violation alerts
- Performance impact tracking

---

**Document Status**: Ready for Implementation
**Next Action**: Begin Phase 1 - Backend Foundation
**Estimated Start Date**: January 27, 2025
**Target Completion**: February 14, 2025
