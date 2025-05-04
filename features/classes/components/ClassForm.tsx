// features/classes/components/ClassForm.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DyraneCard, DyraneCardContent, DyraneCardFooter, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription } from '@/components/dyrane-ui/dyrane-card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePickerWithYearMonth } from '@/components/ui/date-picker-with-year-month'; // Assuming reusable picker
import type { AdminClassView } from '../types/classes-types';
// Import hooks/selectors for fetching teachers/courses if needed for dropdowns
// import { useAppSelector } from '@/store/hooks';
// import { selectAllTeachers, selectAllCoursesForDropdown } from '@/features/...';

// Define Zod Schema for the form
const classFormSchema = z.object({
    courseTitle: z.string().min(3, "Course title must be at least 3 characters"),
    // courseId: z.string().optional(), // Link to a base course if applicable
    teacherId: z.string().optional(), // Teacher assignment
    status: z.enum(['active', 'upcoming', 'inactive', 'archived']),
    description: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    // Add other fields like capacity, location etc. if needed
}).refine(data => { // Example validation: end date must be after start date if both exist
    if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date must be on or after the start date",
    path: ["endDate"], // Point error to end date field
});

type ClassFormValues = z.infer<typeof classFormSchema>;

// Map API/initial data to form data (handle optional dates)
const mapDataToForm = (data?: AdminClassView | null): Partial<ClassFormValues> => ({
    courseTitle: data?.courseTitle || "",
    teacherId: data?.teacherId || "",
    // @ts-ignore
    status: data?.status || 'upcoming', // Default to upcoming for new
    description: data?.description || "",
    startDate: data?.startDate ? new Date(data.startDate) : undefined,
    endDate: data?.endDate ? new Date(data.endDate) : undefined,
});

interface ClassFormProps {
    initialData?: AdminClassView | null;
    onSubmit: (data: ClassFormValues) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

export function ClassForm({ initialData, onSubmit, isSubmitting = false, mode }: ClassFormProps) {
    const router = useRouter();
    // TODO: Fetch teachers/courses for dropdowns if needed
    const mockTeachers = [{ id: 'teacher_1', name: 'Dr. Sarah Johnson' }, { id: 'teacher_2', name: 'Michael Chen' }];
    // const coursesForSelect = useAppSelector(selectAllCoursesForDropdown); // Example

    const form = useForm<ClassFormValues>({
        resolver: zodResolver(classFormSchema),
        defaultValues: mapDataToForm(initialData),
    });

    // Reset form when initialData changes (for edit mode)
    useEffect(() => {
        form.reset(mapDataToForm(initialData));
    }, [initialData, form]);

    const handleSubmit = async (data: ClassFormValues) => {
        await onSubmit(data); // Call parent onSubmit
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DyraneCard>
                    <DyraneCardHeader>
                        <DyraneCardTitle>{mode === 'create' ? 'Create New Class' : 'Edit Class'}</DyraneCardTitle>
                        <DyraneCardDescription>
                            {mode === 'create' ? 'Enter the details for the new class session.' : 'Update the class details.'}
                        </DyraneCardDescription>
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                        {/* Course Title */}
                        <FormField
                            control={form.control}
                            name="courseTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Title</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., PMP Bootcamp - Fall 2024" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Teacher Select (Example - fetch real teachers) */}
                        <FormField
                            control={form.control}
                            name="teacherId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign Teacher (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">-- No Teacher --</SelectItem>
                                            {mockTeachers.map(teacher => (
                                                <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl><Textarea {...field} placeholder="Add any relevant details about this class session..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date (Optional)</FormLabel>
                                        <DatePickerWithYearMonth date={field.value} setDate={field.onChange} placeholder="Select start date" />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date (Optional)</FormLabel>
                                        <DatePickerWithYearMonth date={field.value} setDate={field.onChange} placeholder="Select end date" fromDate={form.getValues('startDate')} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </DyraneCardContent>
                    <DyraneCardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Class' : 'Save Changes')}
                        </Button>
                    </DyraneCardFooter>
                </DyraneCard>
            </form>
        </Form>
    );
}