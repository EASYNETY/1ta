// components/users/UserForm.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Briefcase, CheckCircle, Phone, Building,
    CalendarDays, GraduationCap, BookOpen, Clock, FileText, ShieldCheck, DollarSign, Users as UsersIcon // Renamed Users to UsersIcon to avoid conflict
} from 'lucide-react';

// Import the full User type and individual role types
import type {
    User as UserType,
    UserRole,
    AccountType,
    OnboardingStatus,
    // Import specific user types if you need to reference their exact structure for initialData, though UserType usually suffices
} from '@/types/user.types';

interface UserFormProps {
    initialData?: UserType | null; // For editing - UserType is a union, which is fine here
    onSubmit: (data: Partial<UserType>) => Promise<void>; // onSubmit can still take Partial<UserType>
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

// Define a comprehensive interface for the form's data state.
// This includes ALL possible fields from ALL user roles, mostly as optional.
interface UserFormDataType {
    id?: string;
    name?: string; // from BaseUser
    email?: string; // from BaseUser
    role: UserRole; // from BaseUser - non-optional as it drives logic
    isActive?: boolean; // from BaseUser
    phone?: string | null; // from BaseUser
    bio?: string | null; // from BaseUser
    accountType?: AccountType; // from BaseUser
    onboardingStatus?: OnboardingStatus; // from BaseUser
    avatarUrl?: string | null; // from BaseUser
    lastLogin?: string | null; // from BaseUser
    corporateId?: string | null; // from BaseUser & StudentUser
    corporateAccountName?: string | null; // from BaseUser
    createdAt?: string; // from BaseUser
    updatedAt?: string; // from BaseUser

    // Student specific
    dateOfBirth?: string | null; // from StudentUser
    address?: string | null; // from StudentUser
    barcodeId?: string; // from StudentUser
    classId?: string | null; // from StudentUser
    guardianId?: string | null; // from StudentUser
    isCorporateManager?: boolean; // from StudentUser
    purchasedStudentSlots?: number | null; // from StudentUser
    class?: any | null; // from StudentUser

    // Teacher specific
    subjects?: string[] | null; // from TeacherUser
    officeHours?: string | null; // from TeacherUser

    // Admin/SuperAdmin/Accounting/CustomerCare specific permissions
    permissions?: string[] | null; // from SuperAdminUser, AdminUser, AccountingUser, CustomerCareUser

    // Staff specific department/shift (also on TeacherUser now)
    department?: string | null; // from TeacherUser, SuperAdminUser, AdminUser, AccountingUser, CustomerCareUser
    shift?: string | null; // from TeacherUser, SuperAdminUser, AdminUser, AccountingUser, CustomerCareUser
}


// Define default values for the form using the comprehensive type
const defaultValues: UserFormDataType = {
    name: '',
    email: '',
    role: 'student', // Default role
    isActive: true,
    phone: '',
    bio: '',
    accountType: 'individual',
    onboardingStatus: 'incomplete',
    avatarUrl: null,
    lastLogin: null,
    corporateId: null,
    corporateAccountName: null,
    createdAt: undefined, // Or set to a new Date().toISOString() if needed for create
    updatedAt: undefined,

    // Student
    dateOfBirth: '',
    address: '',
    barcodeId: '',
    classId: '',
    guardianId: '',
    isCorporateManager: false,
    purchasedStudentSlots: null,
    class: null,

    // Teacher
    subjects: [],
    officeHours: '',

    // Admin/Staff (permissions shared by multiple, department/shift also shared)
    permissions: [],
    department: '',
    shift: '',
};

export function UserForm({ initialData, onSubmit, isSubmitting = false, mode }: UserFormProps) {
    const router = useRouter();

    // Initialize state from initialData or defaults, using the comprehensive type
    const [formData, setFormData] = useState<UserFormDataType>(() => {
        if (initialData) {
            // When initialData is provided, merge it with defaults.
            // Assert initialData to UserFormDataType as it's compatible (UserType is a subset of fields in UserFormDataType)
            return { ...defaultValues, ...(initialData as unknown as UserFormDataType) };
        }
        return defaultValues;
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UserFormDataType, string>>>({});

    // Effect to reset form if initialData changes (for edit mode)
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({ ...defaultValues, ...(initialData as unknown as UserFormDataType) });
        } else if (mode === 'create') {
            setFormData(defaultValues);
        }
    }, [initialData, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof UserFormDataType]) {
            setErrors(prev => ({ ...prev, [name as keyof UserFormDataType]: undefined }));
        }
    };

    const handleSelectChange = (name: keyof UserFormDataType) => (value: string | boolean) => { // Allow boolean for switch
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormDataType, string>> = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.role) newErrors.role = 'Role is required';

        // Add more specific validations if needed based on role
        // For example, if role is student, barcodeId might be required
        if (formData.role === 'student' && !formData.barcodeId?.trim()) {
            // newErrors.barcodeId = 'Barcode ID is required for students.'; // Optional: enable if strictly required
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Form validation failed", errors);
            return;
        }
        console.log("Submitting form data:", formData);
        // Before submitting, you might want to clean formData to only include relevant fields for the selected role
        // For now, we pass the whole formData which is compatible with Partial<UserType>
        await onSubmit(formData as Partial<UserType>); // Asserting here as UserFormDataType has all fields, compatible with Partial<UserType>
    };

    // Determine which role-specific fields to show
    const currentRole = formData.role || 'student';
    const isStudent = currentRole === 'student';
    const isTeacher = currentRole === 'teacher';
    const isAdmin = currentRole === 'admin'; // Standard Admin
    const isSuperAdmin = currentRole === 'super_admin';
    const isAccounting = currentRole === 'accounting';
    const isCustomerCare = currentRole === 'customer_care';

    // Helper to determine if staff-specific fields (department, shift) should be shown
    const isStaffRoleWithDeptShift = [
        'admin', 'super_admin', 'accounting', 'customer_care', 'teacher'
    ].includes(currentRole);


    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Essential user information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., John Doe"
                                    disabled={isSubmitting}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., user@example.com"
                                    disabled={isSubmitting}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    name="role"
                                    value={currentRole}
                                    onValueChange={handleSelectChange('role') as (value: string) => void}
                                    disabled={isSubmitting || mode === 'edit'}
                                >
                                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Facilitator</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="accounting">Accounting</SelectItem>
                                        <SelectItem value="customer_care">Customer Care</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., +1 (555) 123-4567"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isActive">Account Status</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive || false}
                                        onCheckedChange={handleSelectChange('isActive')}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="isActive" className="text-sm">
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </Label>
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="accountType">Account Type</Label>
                                <Select
                                    name="accountType"
                                    value={formData.accountType || 'individual'}
                                    onValueChange={handleSelectChange('accountType') as (value: string) => void}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="accountType">
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="institutional">Institutional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="onboardingStatus">Onboarding Status</Label>
                                <Select
                                    name="onboardingStatus"
                                    value={formData.onboardingStatus || 'incomplete'}
                                    onValueChange={handleSelectChange('onboardingStatus') as (value: string) => void}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="onboardingStatus">
                                        <SelectValue placeholder="Select onboarding status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incomplete">Incomplete</SelectItem>
                                        <SelectItem value="complete">Complete</SelectItem>
                                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Role-Specific Information */}
                <div className="lg:col-span-2 space-y-6">
                    {isStudent && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="barcodeId">Barcode ID</Label>
                                        <Input
                                            id="barcodeId"
                                            name="barcodeId"
                                            value={formData.barcodeId || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., STU123456"
                                            disabled={isSubmitting}
                                        />
                                        {errors.barcodeId && <p className="text-sm text-red-600">{errors.barcodeId}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth?.split('T')[0] || ''}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="classId">Class ID</Label>
                                        <Input
                                            id="classId"
                                            name="classId"
                                            value={formData.classId || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., CLASS001"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., 123 Main St"
                                            disabled={isSubmitting}
                                        />
                                    </div>


                                    {formData.accountType === 'corporate' && (
                                        <div className="flex items-center justify-between md:col-span-2 pt-2">
                                            <Label htmlFor="isCorporateManager" className="text-sm font-medium">Is Corporate Manager?</Label>
                                            <Switch
                                                id="isCorporateManager"
                                                checked={formData.isCorporateManager || false}
                                                onCheckedChange={handleSelectChange('isCorporateManager')}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isTeacher && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Facilitator Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="officeHours">Office Hours</Label>
                                    <Input
                                        id="officeHours"
                                        name="officeHours"
                                        value={formData.officeHours || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., Mon-Fri 9am-5pm"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                                    <Input
                                        id="subjects"
                                        name="subjects"
                                        value={Array.isArray(formData.subjects) ? formData.subjects.join(', ') : ''}
                                        onChange={(e) => {
                                            const subjectsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            setFormData(prev => ({ ...prev, subjects: subjectsArray }));
                                        }}
                                        placeholder="e.g., Math, Science, History"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Permissions field for Admin (not Super Admin, who has all) and potentially other roles if they have configurable permissions */}
                    {(isAdmin || isAccounting || isCustomerCare) && !isSuperAdmin && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Role Permissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="permissions">Permissions (comma-separated)</Label>
                                    <Input
                                        id="permissions"
                                        name="permissions"
                                        value={Array.isArray(formData.permissions) ? formData.permissions.join(', ') : ''}
                                        onChange={(e) => {
                                            const permissionsArray = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                                            setFormData(prev => ({ ...prev, permissions: permissionsArray }));
                                        }}
                                        placeholder="e.g., manage_users, view_reports"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {isAdmin && "Define specific permissions for this Admin."}
                                        {isAccounting && "Define specific permissions for Accounting."}
                                        {isCustomerCare && "Define specific permissions for Customer Care."}
                                        {" Super Admin has all permissions by default."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isStaffRoleWithDeptShift && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {isSuperAdmin && <ShieldCheck className="h-5 w-5 text-primary" />}
                                    {isAccounting && <DollarSign className="h-5 w-5 text-primary" />}
                                    {isCustomerCare && <UsersIcon className="h-5 w-5 text-primary" />}
                                    {(isAdmin || isTeacher) && !isSuperAdmin && !isAccounting && !isCustomerCare && <Briefcase className="h-5 w-5 text-primary" />}
                                    Staff Details
                                </CardTitle>
                                <CardDescription>Department and shift information for staff members.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Finance, Support, Academics"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="shift">Shift</Label>
                                        <Input
                                            id="shift"
                                            name="shift"
                                            value={formData.shift || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Morning, Evening, Full-Time"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="bio">Biography / Notes</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    placeholder="Enter user biography or additional notes"
                                    disabled={isSubmitting}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}