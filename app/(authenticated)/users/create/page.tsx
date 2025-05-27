// app/(authenticated)/users/create/page.tsx
"use client";

import { UserForm, UserFormSubmitData } from '@/components/users/UserForm';
// You need the UserFormDataType that UserForm submits, or UserForm should export its data type
// For now, let's define it here for clarity, but ideally it's imported from where UserForm defines it.
import type {
    UserRole,
    AccountType,
    OnboardingStatus
} from '@/types/user.types'; // Import enums/types used by UserFormDataType

import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
// import Link from 'next/link'; // Not used directly here currently
// import { ArrowLeft } from 'phosphor-react'; // Not used directly here currently
// import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Not used directly here currently
import { PageHeader } from '@/components/layout/auth/page-header';
import { useAppDispatch } from '@/store/hooks';
// import { createUserAdmin } from '@/features/auth/store/user-thunks'; // Replaced by signupThunk
import type { User as UserType } from '@/types/user.types'; // UserType from your types for the newUser
import { signupThunk, RegisterData } from '@/features/auth'; // Import RegisterData if signupThunk expects it



export default function CreateUserPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Change the 'data' parameter type here to match what UserForm submits
    const handleCreateUser = async (data: UserFormSubmitData) => {
        setIsSubmitting(true);
        console.log("Admin creating user (via signupThunk) with form data:", data);

        try {
            const roleToCreate = data.role; // 'role' is required in UserFormSubmitData

            // Ensure password is provided.
            // Your UserForm.tsx should ideally collect this if an admin is creating a user.
            // If not, this temporary password will be used.
            const passwordForSignup = data.password || `TempP@sswOrd${Date.now()}`;
            if (!data.password) {
                console.warn("No password provided in form, using temporary password.");
            }

            // Construct the payload for signupThunk.
            // It's best if RegisterData type (from signupThunk) is flexible or
            // you map explicitly to it.
            const signupPayload: Partial<RegisterData> & { role: UserRole, [key: string]: any } = {
                name: data.name!, // Assuming name is always present
                email: data.email!, // Assuming email is always present
                password: passwordForSignup,
                role: roleToCreate,
                phone: data.phone || undefined,
                // Add other common fields that RegisterData might expect
            };

            // Add role-specific fields. Your /auth/register endpoint needs to handle these.
            if (roleToCreate === 'student') {
                signupPayload.address = data.address || undefined;
                signupPayload.dateOfBirth = data.dateOfBirth || "1900-01-01T00:00:00.000Z"; // Default if not provided
                signupPayload.classId = data.classId || undefined; // Send undefined if not set, backend validation handles 'null' vs 'undefined'
                signupPayload.barcodeId = data.barcodeId || undefined;
                // Add other student-specific fields from 'data' that RegisterData might expect
                signupPayload.isCorporateManager = data.isCorporateManager || false;
            } else {
                // For non-student roles, ensure student-specific fields that might cause validation issues
                // are explicitly omitted or set to values the backend expects (e.g., undefined or null).
                // This depends heavily on your backend's /auth/register endpoint logic.
                // If they are not part of RegisterData for non-students, omitting them is fine.
            }

            // Add staff-specific fields (department, shift)
            // Ensure RegisterData can accept these or your backend /auth/register can.
            if (['admin', 'super_admin', 'accounting', 'customer_care', 'teacher'].includes(roleToCreate)) {
                signupPayload.department = data.department || undefined;
                signupPayload.shift = data.shift || undefined;
            }

            // Add permissions if collected and if signup endpoint can take them.
            // This is less common for a generic signup/register endpoint.
            if (data.permissions && data.permissions.length > 0) {
                signupPayload.permissions = data.permissions;
            }

            console.log("Payload for signupThunk:", signupPayload);
            // Ensure the payload matches what signupThunk expects (RegisterData).
            // If RegisterData is strict, you might need to cast or build more carefully.
            const response = await dispatch(signupThunk(signupPayload as RegisterData)).unwrap();

            // signupThunk's unwrapped response should contain { data: { user: UserType, tokens: ... } }
            const newUser = response.data.user as UserType;

            toast.success(`User "${newUser.name}" (role: ${newUser.role}) created successfully via signup!`);
            router.push('/admin/users'); // Or your desired users list page

        } catch (error: any) {
            console.error("Failed to create user via signupThunk:", error);
            let errorMessage = "Failed to create user. Please check the details and try again.";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            // Handle validation errors from signupThunk specifically
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                const fieldErrorsSummary = error.data.errors.map((e: any) => `${e.path ? e.path + ': ' : ''}${e.msg}`).join("; ");
                toast.error(`Validation errors: ${fieldErrorsSummary}`, { duration: 7000 });
                errorMessage = `Please fix the following: ${fieldErrorsSummary}`; // More specific for general toast
            } else {
                toast.error(errorMessage, { duration: 5000 });
            }
            setIsSubmitting(false);
        }
    };

    return (
        // Consider if 'super_admin' should also be allowed here
        <AuthorizationGuard allowedRoles={['admin', 'super_admin']}>
            <PageHeader
                heading={`Create New User`}
            // breadcrumbs can be added here if needed
            />

            <div className="mt-6">
                <UserForm
                    onSubmit={handleCreateUser} // onSubmit now expects UserFormSubmitData
                    isSubmitting={isSubmitting}
                    mode="create"
                    initialData={null} // Explicitly null for create mode
                />
            </div>
        </AuthorizationGuard>
    );
}