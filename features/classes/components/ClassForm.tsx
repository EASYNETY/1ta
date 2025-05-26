// features/classes/components/ClassForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePickerWithYearMonth } from '@/components/ui/date-picker-with-year-month'; // Assuming reusable picker
import type { AdminClassView } from '../types/classes-types';
import { fetchUsersByRole } from '@/features/auth/store/user-thunks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// Import hooks/selectors for fetching teachers/courses if needed for dropdowns
// import { selectAllTeachers, selectAllCoursesForDropdown } from '@/features/...';

// Define Zod Schema for the form
const classFormSchema = z.object({
    courseTitle: z.string().min(3, "Course title must be at least 3 characters"),
    courseId: z.string().optional(), // Link to a base course if applicable
    teacherId: z.string().optional(), // Teacher assignment
    status: z.enum(['active', 'upcoming', 'inactive', 'archived', 'full', 'cancelled']),
    description: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    maxStudents: z.number().min(1, "Must allow at least 1 student").default(30),
    maxSlots: z.number().min(1, "Must have at least 1 slot").optional(),
    location: z.string().optional(),
    schedule: z.object({
        days: z.array(z.string()).optional(),
        time: z.string().optional(),
        duration: z.string().optional(),
    }).optional(),
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
    courseTitle: data?.courseTitle || data?.name || "",
    courseId: data?.courseId || data?.course_id || "",
    teacherId: data?.teacherId || data?.teacher_id || "",
    // @ts-ignore
    status: data?.status || 'upcoming', // Default to upcoming for new
    description: data?.description || "",
    startDate: data?.startDate || data?.start_date ? new Date(data.startDate || data.start_date || "") : undefined,
    endDate: data?.endDate || data?.end_date ? new Date(data.endDate || data.end_date || "") : undefined,
    maxStudents: data?.maxStudents || data?.max_students || 30,
    maxSlots: data?.maxSlots || data?.max_slots,
    location: data?.location || "",
    schedule: {
        days: data?.schedule?.days || [],
        time: data?.schedule?.time || "",
        duration: data?.schedule?.duration || "",
    },
});

interface ClassFormProps {
    initialData?: AdminClassView | null;
    onSubmit: (data: ClassFormValues) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

export function ClassForm({ initialData, onSubmit, isSubmitting = false, mode }: ClassFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { users } = useAppSelector((state) => state.auth); // Assuming you have a user state
    // TODO: Fetch teachers/courses for dropdowns if needed
    useEffect(() => {
        dispatch(fetchUsersByRole({ role: 'teacher' })); // Fetch teachers on mount
    }
        , []); // Fetch users (teachers) on mount

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
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === 'create' ? 'Create New Class' : 'Edit Class'}</CardTitle>
                        <CardDescription>
                            {mode === 'create' ? 'Enter the details for the new class session.' : 'Update the class details.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Course Title */}
                        <FormField
                            control={form.control}
                            name="courseTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Title</FormLabel>
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
                                    <FormLabel>Assign Facilitator (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a facilitator" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="No-teacher">-- No Facilitator --</SelectItem>
                                            {users.map(teacher => (
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
                                        <DatePickerWithYearMonth
                                            date={field.value}
                                            setDate={(date) => {
                                                console.log("Setting start date:", date);
                                                field.onChange(date);
                                            }}
                                            placeholder="Select start date"
                                            // No toDate restriction - allow future dates for class scheduling
                                        />
                                        <FormDescription>
                                            {field.value ? `Selected: ${field.value.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}` : "No date selected"}
                                        </FormDescription>
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
                                        <DatePickerWithYearMonth
                                            date={field.value}
                                            setDate={(date) => {
                                                console.log("Setting end date:", date);
                                                field.onChange(date);
                                            }}
                                            placeholder="Select end date"
                                            fromDate={form.getValues('startDate')}
                                        />
                                        <FormDescription>
                                            {field.value ? `Selected: ${field.value.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}` : "No date selected"}
                                        </FormDescription>
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
                                            <SelectItem value="full">Full</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Enrolment Capacity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="maxStudents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Students</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                                                value={field.value || 30}
                                            />
                                        </FormControl>
                                        <FormDescription>Maximum number of students allowed in this class</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxSlots"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Slots (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription>Maximum enrolment slots (if different from max students)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g., Room 101, Online, etc." />
                                    </FormControl>
                                    <FormDescription>Where this class will be held</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Class' : 'Save Changes')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}