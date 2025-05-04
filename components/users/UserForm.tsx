// components/users/UserForm.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Use your Card
import { useRouter } from 'next/navigation';

// Use the same UserData type or a more specific FormData type
import { UserData } from './UserTableRow';

interface UserFormProps {
    initialData?: UserData | null; // For editing
    onSubmit: (data: Omit<UserData, 'id' | 'joinDate'>) => Promise<void>; // Adjust onSubmit data type as needed
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

// Define default values matching UserData structure more closely
const defaultValues: Omit<UserData, 'id' | 'joinDate'> = {
    name: '',
    email: '',
    role: 'student', // Default role
    status: 'active', // Default status
    // Add other fields with defaults if necessary
};

export function UserForm({ initialData, onSubmit, isSubmitting = false, mode }: UserFormProps) {
    const router = useRouter();
    // Initialize state from initialData or defaults
    const [formData, setFormData] = useState<Omit<UserData, 'id' | 'joinDate'>>(() =>
        initialData
            ? {
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                status: initialData.status,
                // Map other initialData fields if they exist in UserData and the form
            }
            : defaultValues
    );
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    // Effect to reset form if initialData changes (for edit mode)
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                status: initialData.status,
            });
        } else if (mode === 'create') {
            setFormData(defaultValues); // Reset to defaults for create mode
        }
    }, [initialData, mode]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error on change
        if (errors[name as keyof typeof formData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
            newErrors.email = 'Invalid email format';
        }
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.status) newErrors.status = 'Status is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True if no errors
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log("Form validation failed", errors);
            return; // Don't submit if validation fails
        }
        console.log("Submitting form data:", formData);
        await onSubmit(formData); // Call the passed onSubmit handler
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className='bg-card/5 backdrop-blur-sm'>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</CardTitle>
                    <CardDescription>
                        {mode === 'create' ? 'Enter the details for the new user.' : 'Update the user details.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Name Field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
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
                            value={formData.email}
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
                            value={formData.role}
                            onValueChange={handleSelectChange('role')}
                            disabled={isSubmitting}
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

                    {/* Status Select */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            name="status"
                            value={formData.status}
                            onValueChange={handleSelectChange('status')}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger id="status" aria-invalid={!!errors.status}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                {/* Add other statuses if needed */}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                    </div>

                    {/* Add other fields like Phone Number, Password (for create) etc. here */}

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}