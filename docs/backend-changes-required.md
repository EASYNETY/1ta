# Backend Changes Required

## Overview

This document outlines the backend changes required to support the frontend updates implemented in the smartedu-frontend project.

## 1. User Role System Updates

### Database Schema Changes
```sql
-- Update user roles enum to include new roles
ALTER TYPE user_role ADD VALUE 'super_admin';
ALTER TYPE user_role ADD VALUE 'accounting';
ALTER TYPE user_role ADD VALUE 'customer_care';

-- Add new columns for role-specific data
ALTER TABLE users ADD COLUMN permissions TEXT[];
ALTER TABLE users ADD COLUMN department VARCHAR(100); -- For accounting users
ALTER TABLE users ADD COLUMN shift VARCHAR(100); -- For customer care users
```

### API Endpoints to Update
- `GET /api/users` - Include new role filtering
- `POST /api/users` - Support new role creation
- `PUT /api/users/:id` - Support role-specific field updates
- `GET /api/auth/me` - Return role-specific permissions

### Role Permissions Matrix
```typescript
const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  admin: ['manage_users', 'manage_courses', 'view_billing'],
  accounting: ['view_payments', 'generate_reports', 'manage_billing'],
  customer_care: ['view_tickets', 'scan_barcodes', 'view_student_info'],
  teacher: ['manage_classes', 'view_students', 'mark_attendance'],
  student: ['view_courses', 'submit_assignments', 'view_grades']
};
```

## 2. Payment System Enhancements

### Database Schema Changes
```sql
-- Add new payment fields
ALTER TABLE payments ADD COLUMN gateway_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN reconciliation_status VARCHAR(50) DEFAULT 'pending';

-- Create index for better performance
CREATE INDEX idx_payments_gateway_ref ON payments(gateway_ref);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_reconciliation_status ON payments(reconciliation_status);
```

### API Endpoints to Update
- `GET /api/payments` - Include new fields in response
- `POST /api/payments` - Accept new fields in payment creation
- `PUT /api/payments/:id/reconcile` - New endpoint for reconciliation
- `GET /api/accounting/payments` - New accounting-specific endpoint

### Payment Record Model Update
```typescript
interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: 'paystack' | 'stripe' | 'mock' | 'corporate';
  providerReference: string;
  gatewayRef?: string; // NEW
  transactionId?: string; // NEW
  reconciliationStatus?: 'pending' | 'reconciled' | 'disputed' | 'failed'; // NEW
  description: string;
  createdAt: string;
  // ... existing fields
}
```

## 3. Customer Care Barcode System

### API Endpoints Required
- `GET /api/students/barcode/:barcodeId` - Get student by barcode
- `GET /api/students/:id/payment-status` - Get payment status
- `GET /api/students/:id/course-info` - Get course information
- `POST /api/customer-care/scan-log` - Log barcode scans for audit

### Response Models
```typescript
interface StudentBarcodeResponse {
  student: {
    id: string;
    name: string;
    email: string;
    barcodeId: string;
    isActive: boolean;
    classId?: string;
  };
  paymentStatus: {
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    amountDue?: number;
    lastPaymentDate?: string;
    nextDueDate?: string;
  };
  courseInfo?: {
    title: string;
    instructor?: string;
    schedule?: string;
  };
}
```

## 4. Email Service Integration

### Environment Variables Required
```bash
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@1techacademy.com
RESEND_TO_EMAIL=info@1techacademy.com
```

### Contact Form API Update
```typescript
// POST /api/contact
interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

// Implementation should use Resend service
// Send formatted HTML email to info@1techacademy.com
```

## 5. Authentication & Authorization

### Middleware Updates
```typescript
// Update role checking middleware
const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage examples:
app.get('/api/customer-care/*', requireRole(['customer_care', 'super_admin', 'admin']));
app.get('/api/accounting/*', requireRole(['accounting', 'super_admin']));
```

## 6. Database Migrations

### Migration Scripts Required

#### 1. Add New User Roles
```sql
-- 001_add_new_user_roles.sql
BEGIN;

-- Add new enum values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounting';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_care';

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(100);

COMMIT;
```

#### 2. Update Payment Schema
```sql
-- 002_update_payment_schema.sql
BEGIN;

-- Add new payment fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(50) DEFAULT 'pending';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_gateway_ref ON payments(gateway_ref);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reconciliation_status ON payments(reconciliation_status);

COMMIT;
```

#### 3. Create Sample Users
```sql
-- 003_create_sample_users.sql
BEGIN;

-- Insert sample users for new roles
INSERT INTO users (id, name, email, password_hash, role, permissions, department, shift, created_at, updated_at)
VALUES 
  ('super_admin_1', 'Super Admin', 'superadmin@1techacademy.com', '$hashed_password', 'super_admin', 
   ARRAY['manage_users', 'manage_courses', 'manage_billing', 'delete_users', 'manage_system', 'view_analytics'], 
   NULL, NULL, NOW(), NOW()),
  ('accounting_1', 'Accounting Manager', 'accounting@1techacademy.com', '$hashed_password', 'accounting', 
   ARRAY['view_payments', 'generate_reports', 'manage_billing'], 
   'Finance', NULL, NOW(), NOW()),
  ('customer_care_1', 'Customer Care Agent', 'customercare@1techacademy.com', '$hashed_password', 'customer_care', 
   ARRAY['view_tickets', 'scan_barcodes', 'view_student_info'], 
   NULL, 'Morning (8AM-4PM)', NOW(), NOW());

COMMIT;
```

## 7. API Documentation Updates

### Swagger/OpenAPI Updates Required
- Update user schema to include new roles and fields
- Add new customer care endpoints
- Update payment schema with new fields
- Add authentication examples for new roles

## 8. Testing Requirements

### Unit Tests
- Test new role-based access control
- Test payment field validation
- Test customer care barcode lookup

### Integration Tests
- Test email sending functionality
- Test role-based endpoint access
- Test payment reconciliation workflow

### End-to-End Tests
- Test customer care scanning workflow
- Test accounting dashboard functionality
- Test role-based navigation and access

## 9. Deployment Considerations

### Environment Setup
1. Add new environment variables for email service
2. Run database migrations in correct order
3. Update API documentation
4. Test role-based access in staging environment

### Monitoring
- Add logging for role-based access attempts
- Monitor email delivery success rates
- Track customer care scanning usage
- Monitor payment reconciliation status

## 10. Security Considerations

### Role-Based Security
- Ensure proper role validation on all endpoints
- Implement audit logging for sensitive operations
- Add rate limiting for customer care scanning
- Secure email service API keys

### Data Privacy
- Ensure customer care staff only see necessary student information
- Log all barcode scanning activities for audit
- Implement proper data retention policies

---

## Implementation Priority

1. **High Priority**
   - User role system updates
   - Customer care barcode API endpoints
   - Email service integration

2. **Medium Priority**
   - Payment system field additions
   - Accounting dashboard APIs
   - Role-based middleware updates

3. **Low Priority**
   - Enhanced logging and monitoring
   - Advanced reconciliation features
   - Performance optimizations

---

*This document should be reviewed by the backend development team and updated as implementation progresses.*
