# 🔧 Backend RBAC Implementation Requirements

**Project**: 1Tech Academy Platform - Backend Changes for RBAC System
**Document Version**: 1.0
**Date**: January 26, 2025
**Priority**: Critical

---

## 📋 Overview

This document outlines the backend changes required to support the 4-tier RBAC system implemented in the frontend. The backend must enforce role-based permissions at the API level and provide the necessary data structures.

---

## 🗄️ Database Schema Changes

### 1. User Role Enum Updates
\`\`\`sql
-- Add new role types to existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounting';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_care';

-- Verify enum values
SELECT unnest(enum_range(NULL::user_role));
\`\`\`

### 2. User Table Enhancements
\`\`\`sql
-- Add permission columns for granular control
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN(permissions);
\`\`\`

### 3. Payment Table Enhancements
\`\`\`sql
-- Add payment tracking fields as per CEO requirements
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reconciled_by UUID REFERENCES users(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_gateway_ref ON payments(gateway_ref);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reconciliation_status ON payments(reconciliation_status);
\`\`\`

### 4. Audit Log Table (New)
\`\`\`sql
-- Create audit log for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
\`\`\`

---

## 🔐 API Middleware & Authentication

### 1. Role-Based Route Protection
\`\`\`typescript
// Middleware to check user roles
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From JWT middleware
    
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Apply to routes
app.get('/api/admin/analytics/*', requireRole(['super_admin']));
app.get('/api/payments/*', requireRole(['super_admin', 'admin', 'accounting']));
app.delete('/api/*', requireRole(['super_admin'])); // Only super admin can delete
app.get('/api/customer-care/*', requireRole(['customer_care', 'super_admin']));
app.get('/api/accounting/*', requireRole(['accounting', 'super_admin']));
\`\`\`

### 2. Permission-Based Access Control
\`\`\`typescript
// Permission checking middleware
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }
    
    // Check specific permissions
    if (!user.permissions?.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }
    
    next();
  };
};
\`\`\`

---

## 🛣️ API Endpoints Required

### 1. User Management Endpoints
\`\`\`typescript
// GET /api/users - List users (Admin/Super Admin only)
// POST /api/users - Create user (Admin/Super Admin only)
// PUT /api/users/:id - Update user (Admin/Super Admin only)
// DELETE /api/users/:id - Delete user (Super Admin only)
// POST /api/users/:id/deactivate - Deactivate user (Admin can deactivate, not delete)
\`\`\`

### 2. Analytics Endpoints
\`\`\`typescript
// GET /api/admin/analytics/dashboard - Super Admin only
// GET /api/admin/analytics/users - Super Admin only
// GET /api/admin/analytics/payments - Super Admin only
// GET /api/analytics/student - Student/Teacher analytics (limited)
\`\`\`

### 3. Payment Endpoints
\`\`\`typescript
// GET /api/payments - List payments (Super Admin, Admin read-only, Accounting full)
// POST /api/payments - Create payment (Super Admin, Accounting)
// PUT /api/payments/:id - Update payment (Super Admin, Accounting)
// DELETE /api/payments/:id - Delete payment (Super Admin only)
// POST /api/payments/:id/reconcile - Reconcile payment (Accounting, Super Admin)
\`\`\`

### 4. Accounting Endpoints
\`\`\`typescript
// GET /api/accounting/dashboard - Accounting dashboard data
// GET /api/accounting/reports - Financial reports
// GET /api/accounting/reconciliation - Reconciliation data
// POST /api/accounting/reports/generate - Generate reports
\`\`\`

### 5. Customer Care Endpoints
\`\`\`typescript
// GET /api/customer-care/students/:barcode - Get student by barcode
// GET /api/customer-care/students/search - Search students
// GET /api/customer-care/tickets - Support tickets
// POST /api/customer-care/tickets - Create ticket
// PUT /api/customer-care/tickets/:id - Update ticket
\`\`\`

---

## 📊 Data Models & Responses

### 1. User Model Updates
\`\`\`typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'accounting' | 'customer_care' | 'teacher' | 'student';
  permissions?: string[];
  department?: string;
  shift?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
\`\`\`

### 2. Payment Model Updates
\`\`\`typescript
interface Payment {
  id: string;
  studentId: string;
  amount: number;
  status: 'successful' | 'pending' | 'failed';
  paymentMethod: string;
  gatewayRef?: string;
  transactionId?: string;
  reconciliationStatus: 'pending' | 'reconciled' | 'disputed';
  reconciledAt?: string;
  reconciledBy?: string;
  createdAt: string;
  updatedAt: string;
}
\`\`\`

### 3. Analytics Data Models
\`\`\`typescript
interface DashboardAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  usersByRole: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

interface PaymentAnalytics {
  totalRevenue: number;
  pendingPayments: number;
  reconciliationRate: number;
  failedTransactions: number;
  paymentTrends: Array<{ date: string; amount: number }>;
  paymentMethods: Array<{ method: string; count: number }>;
}
\`\`\`

---

## 🔒 Security Requirements

### 1. JWT Token Updates
\`\`\`typescript
// Include role and permissions in JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}
\`\`\`

### 2. Audit Logging
\`\`\`typescript
// Log all admin actions
const auditLog = async (userId: string, action: string, resourceType: string, resourceId?: string, oldValues?: any, newValues?: any) => {
  await db.auditLogs.create({
    userId,
    action,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
};

// Usage examples:
// auditLog(user.id, 'DELETE_USER', 'user', deletedUserId, deletedUser, null);
// auditLog(user.id, 'UPDATE_PAYMENT', 'payment', paymentId, oldPayment, newPayment);
\`\`\`

### 3. Rate Limiting
\`\`\`typescript
// Implement rate limiting for sensitive endpoints
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/admin', rateLimiter);
app.use('/api/accounting', rateLimiter);
\`\`\`

---

## 🧪 Testing Requirements

### 1. Role-Based Access Tests
- Test each endpoint with different user roles
- Verify proper 403 responses for unauthorized access
- Test permission inheritance (Super Admin access to all)

### 2. Data Integrity Tests
- Test payment reconciliation workflows
- Verify audit log creation
- Test user deactivation vs deletion

### 3. Performance Tests
- Test analytics endpoints with large datasets
- Verify index performance on role-based queries
- Test concurrent access scenarios

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Database migrations tested in staging
- [ ] All new endpoints documented
- [ ] Role-based tests passing
- [ ] Security audit completed

### Deployment Steps
1. Run database migrations
2. Deploy backend with new middleware
3. Update API documentation
4. Verify role-based access in production
5. Monitor audit logs for issues

### Post-Deployment
- [ ] Verify all role permissions working
- [ ] Check analytics data accuracy
- [ ] Monitor performance metrics
- [ ] Validate audit log entries

---

## 📞 Support & Maintenance

### Monitoring
- Track API response times for role-based endpoints
- Monitor failed authentication attempts
- Alert on unusual admin activity patterns

### Maintenance Tasks
- Regular audit log cleanup (retain 1 year)
- Performance optimization for analytics queries
- Security review of permission matrix

---


**Priority**: Critical - Required for frontend RBAC completion
