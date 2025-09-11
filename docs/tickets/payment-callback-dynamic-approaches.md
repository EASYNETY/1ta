# Payment Callback Dynamic Approaches

This document outlines the dynamic approaches implemented to handle the three main issues identified in the payment callback implementation.

## Issues Addressed

### 1. Type Mismatch (Singular vs Plural)
**Problem**: The slice expects `payments` (plural) but API docs show `payment` (singular)

**Solution**: Dynamic response handling in both the thunk and slice

#### Changes Made:

**VerifyPaymentResponse Type** (`features/payment/types/payment-types.ts`):
\`\`\`typescript
export interface VerifyPaymentResponse {
    payments?: PaymentRecord; // Current format (plural)
    payment?: PaymentRecord;  // Alternative format (singular) from API docs
    verification: any; // The verification data from Paystack
}
\`\`\`

**verifyPayment Thunk** (`features/payment/store/payment-slice.ts`):
- Accepts both response formats
- Normalizes response to include both `payments` and `payment` fields
- Dynamic validation checks for either format

**Slice Reducer**:
\`\`\`typescript
const paymentRecord = action.payload.payments || 
                     (action.payload as any).payment ||
                     null;
\`\`\`

### 2. Field Access Flexibility
**Problem**: Code tries to access `gatewayRef` but this field might not always be available

**Solution**: Dynamic metadata extraction with multiple fallback sources

#### Enhanced Metadata Extraction (`app/(authenticated)/payments/callback/page.tsx`):

\`\`\`typescript
const getMetadataFromPaymentRecord = (record: PaymentRecord | null): Record<string, any> => {
    // Define potential metadata sources in order of priority
    const metadataSources = [
        (record as any).metadata,           // Direct metadata field (future)
        record.gatewayRef,                  // Current workaround field
        record.description,                 // Alternative workaround field
        (record as any).providerMetadata,   // Provider-specific metadata
        (record as any).transactionMetadata, // Transaction-specific metadata
        // Fallback to any field that looks like JSON
        ...Object.values(record).filter(value => 
            typeof value === 'string' && 
            value.startsWith('{') && 
            value.endsWith('}')
        )
    ];
    
    // Try each source until valid JSON is found
    for (const source of metadataSources) {
        if (typeof source === 'object' && source !== null) {
            return source; // Already an object
        }
        if (typeof source === 'string' && source.startsWith('{')) {
            try {
                return JSON.parse(source);
            } catch (e) {
                continue; // Try next source
            }
        }
    }
    
    return {}; // No valid metadata found
};
\`\`\`

### 3. Robust Metadata Handling
**Problem**: Current approach is fragile, depending on backend "stuffing" JSON into existing fields

**Solution**: Multi-source enrollment data extraction with intelligent fallbacks

#### Dynamic Enrollment Data Extraction:

\`\`\`typescript
const getEnrollmentData = (
    metadata: Record<string, any>, 
    paymentRecord: PaymentRecord | null,
    searchParams: URLSearchParams
): {
    courseIds: string[];
    invoiceId: string;
    isCorporate: boolean;
    studentCount?: number;
} => {
    // Try multiple sources for course IDs
    const courseIds = metadata.course_ids || 
                     metadata.courseIds || 
                     metadata.courses || 
                     (metadata.items?.map(item => item.courseId || item.course_id).filter(Boolean));
    
    // Try multiple sources for invoice ID
    const invoiceId = metadata.invoice_id || 
                     metadata.invoiceId || 
                     paymentRecord?.providerReference || 
                     searchParams.get('invoice_id') || 
                     'unknown';
    
    // Try multiple sources for corporate info
    const isCorporate = metadata.is_corporate_purchase || 
                       metadata.isCorporate || 
                       metadata.corporate || 
                       false;
    
    // Try multiple sources for student count
    const studentCount = metadata.corporate_student_count || 
                        metadata.studentCount || 
                        metadata.student_count;
    
    return { courseIds: Array.isArray(courseIds) ? courseIds : [], invoiceId, isCorporate, studentCount };
};
\`\`\`

## Enhanced PaymentRecord Type

Added optional metadata fields for future flexibility:

\`\`\`typescript
export interface PaymentRecord {
    // ... existing fields ...
    
    // Optional: Metadata fields for future flexibility
    metadata?: Record<string, any>; // Direct metadata field
    providerMetadata?: Record<string, any>; // Provider-specific metadata
    transactionMetadata?: Record<string, any>; // Transaction-specific metadata
}
\`\`\`

## Benefits of Dynamic Approaches

1. **Backward Compatibility**: Handles current implementation while supporting future changes
2. **Graceful Degradation**: Falls back to alternative sources if primary sources fail
3. **Future-Proof**: Ready for backend improvements without breaking existing functionality
4. **Robust Error Handling**: Continues processing even if some data sources are unavailable
5. **Flexible Data Sources**: Supports multiple naming conventions and data structures

## Usage in Callback Page

The callback page now uses these dynamic helpers:

\`\`\`typescript
// Use dynamic helpers to extract data
const metadata = getMetadataFromPaymentRecord(verifiedPaymentDetails);
const enrollmentData = getEnrollmentData(metadata, verifiedPaymentDetails, searchParams);

const { courseIds: courseIdsToEnrol, invoiceId, isCorporate, studentCount } = enrollmentData;
\`\`\`

This approach ensures the payment callback remains functional regardless of:
- Backend response format changes (singular vs plural)
- Metadata storage location changes
- Field naming convention changes
- Additional metadata sources being added

## Testing Recommendations

1. Test with both `payments` and `payment` response formats
2. Test with metadata in different fields (`gatewayRef`, `description`, `metadata`)
3. Test with missing metadata fields
4. Test with malformed JSON in metadata fields
5. Test with corporate and individual purchases
6. Test with various URL parameter combinations
