// components/users/UserForm.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Briefcase, CheckCircle, Phone, Building,
    CalendarDays, GraduationCap, BookOpen, Clock, FileText
} from 'lucide-react';

// Import the full User type
import type { User as UserType } from '@/types/user.types';

interface UserFormProps {
    initialData?: UserType | null; // For editing
    onSubmit: (data: Partial<UserType>) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

// Define default values for the form
const defaultValues: Partial<UserType> = {
    name: '',
    email: '',
    role: 'student',
    isActive: true,
    phone: '',
    bio: '',
    accountType: 'individual',
    onboardingStatus: 'incomplete',
    // Role-specific defaults
    // Student
    dateOfBirth: '',
    barcodeId: '',
    classId: '',
    // Teacher
    subjects: [],
    officeHours: '',
    // Admin
    permissions: []
};

export function UserForm({ initialData, onSubmit, isSubmitting = false, mode }: UserFormProps) {
    const router = useRouter();

    // Initialize state from initialData or defaults
    const [formData, setFormData] = useState<Partial<UserType>>(() =>
        initialData ? { ...defaultValues, ...initialData } : defaultValues
    );

    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    // Effect to reset form if initialData changes (for edit mode)
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({ ...defaultValues, ...initialData });
        } else if (mode === 'create') {
            setFormData(defaultValues);
        }
    }, [initialData, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.role) newErrors.role = 'Role is required';

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
        await onSubmit(formData);
    };

    // Determine if we should show role-specific fields
    const isStudent = formData.role === 'student';
    const isTeacher = formData.role === 'teacher';
    const isAdmin = formData.role === 'admin';

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Information */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Basic Information Card */}
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
                            {/* Name Field */}
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

                            {/* Email Field */}
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

                            {/* Role Select */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    name="role"
                                    value={formData.role || 'student'}
                                    onValueChange={handleSelectChange('role')}
                                    disabled={isSubmitting || mode === 'edit'} // Can't change role in edit mode
                                >
                                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                            </div>

                            {/* Phone Field */}
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

                    {/* Status Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Active Status Switch */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isActive">Account Status</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive || false}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({ ...prev, isActive: checked }));
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="isActive" className="text-sm">
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </Label>
                                </div>
                            </div>

                            {/* Account Type */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="accountType">Account Type</Label>
                                <Select
                                    name="accountType"
                                    value={formData.accountType || 'individual'}
                                    onValueChange={handleSelectChange('accountType')}
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

                            {/* Onboarding Status */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="onboardingStatus">Onboarding Status</Label>
                                <Select
                                    name="onboardingStatus"
                                    value={formData.onboardingStatus || 'incomplete'}
                                    onValueChange={handleSelectChange('onboardingStatus')}
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
                    {/* Role-Specific Information Card */}
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
                                    {/* Barcode ID */}
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
                                    </div>

                                    {/* Date of Birth */}
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

                                    {/* Class ID */}
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

                                    {/* Corporate Manager Switch */}
                                    {formData.accountType === 'corporate' && (
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="isCorporateManager">Corporate Manager</Label>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="isCorporateManager"
                                                    checked={formData.isCorporateManager || false}
                                                    onCheckedChange={(checked) => {
                                                        setFormData(prev => ({ ...prev, isCorporateManager: checked }));
                                                    }}
                                                    disabled={isSubmitting}
                                                />
                                                <Label htmlFor="isCorporateManager" className="text-sm">
                                                    {formData.isCorporateManager ? 'Yes' : 'No'}
                                                </Label>
                                            </div>
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
                                    Teacher Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Office Hours */}
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

                                {/* Subjects - Simple text input for now */}
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

                    {isAdmin && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Admin Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Permissions - Simple text input for now */}
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
                                        placeholder="e.g., manage_users, manage_courses"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bio Information - For all users */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Bio */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="bio">Biography</Label>
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

                    {/* Form Actions */}
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