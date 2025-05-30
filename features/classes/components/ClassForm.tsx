// features/classes/components/ClassForm.tsx
"use client";

import React, { useEffect, useRef } from 'react';
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
import { DatePickerWithYearMonth } from '@/components/ui/date-picker-with-year-month';
import type { AdminClassView } from '../types/classes-types';
import { fetchUsersByRole } from '@/features/auth/store/user-thunks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuthCourses, selectAuthCourses, selectAuthCourseStatus } from '@/features/auth-course/store/auth-course-slice';
import type { AuthCourse } from '@/features/auth-course/types/auth-course-interface';
import { User } from '@/types/user.types';

// Zod Schema for the form values
const classFormSchema = z.object({
    name: z.string().min(3, { message: "Class Name/Title must be at least 3 characters." }),
    courseId: z.string()
    // .min(1, { message: "A Parent Course must be selected." })
    ,
    teacherId: z.string().optional().transform(value => value === "none" || value === "" ? undefined : value),
    status: z.enum(['active', 'upcoming', 'inactive', 'archived', 'full', 'cancelled'], { required_error: "Status is required." }),
    description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
    startDate: z.date({ errorMap: (issue, ctx) => (issue.code === z.ZodIssueCode.invalid_date ? { message: "Invalid start date." } : { message: ctx.defaultError }) }).optional(),
    endDate: z.date({ errorMap: (issue, ctx) => (issue.code === z.ZodIssueCode.invalid_date ? { message: "Invalid end date." } : { message: ctx.defaultError }) }).optional(),
    maxStudents: z.coerce.number({ invalid_type_error: "Max students must be a number." })
        .min(1, { message: "Must allow at least 1 student." })
        .max(500, { message: "Maximum 500 students." })
        .default(30),
    maxSlots: z.coerce.number({ invalid_type_error: "Max slots must be a number." })
        .min(1, { message: "If provided, must have at least 1 slot." })
        .max(500, { message: "Maximum 500 slots." })
        .optional(),
    location: z.string().max(100, { message: "Location cannot exceed 100 characters." }).optional(),
    schedule: z.object({
        days: z.array(z.string()).optional().default([]),
        time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }).optional().or(z.literal("")).default(""),
        duration: z.string().max(50, { message: "Duration text too long." }).optional().default(""),
    }).default({ days: [], time: "", duration: "" }),
}).refine(data => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
}).refine(data => {
    if (data.maxSlots !== undefined && data.maxStudents !== undefined && data.maxSlots > data.maxStudents) { // maxStudents will always be defined due to default
        return false;
    }
    return true;
}, {
    message: "Max slots cannot exceed max students.",
    path: ["maxSlots"],
});

export type ClassFormValues = z.infer<typeof classFormSchema>;

const mapDataToForm = (data?: AdminClassView | null): Partial<ClassFormValues> => {
    const startDateString = data?.startDate || data?.start_date;
    const endDateString = data?.endDate || data?.end_date;

    // Prepare default values that align with Zod defaults or empty states
    const defaults = classFormSchema.safeParse({}).success
        ? classFormSchema.parse({}) // Get Zod defaults
        : { // Fallback if Zod parse empty fails (should not happen with .default())
            name: "",
            courseId: "",
            status: 'upcoming',
            maxStudents: 30,
            schedule: { days: [], time: "", duration: "" },
        };


    return {
        name: data?.name || defaults.name,
        courseId: data?.courseId || data?.course_id || defaults.courseId,
        teacherId: data?.teacherId || data?.teacher_id || undefined, // map "" or "none" in Select, Zod transform handles it
        status: (data?.status as ClassFormValues['status']) || defaults.status,
        description: data?.description || "",
        startDate: startDateString ? new Date(startDateString) : undefined,
        endDate: endDateString ? new Date(endDateString) : undefined,
        maxStudents: data?.maxStudents ?? data?.max_students ?? defaults.maxStudents,
        maxSlots: data?.maxSlots ?? data?.max_slots ?? undefined, // Explicitly undefined if not present
        location: data?.location || "",
        schedule: data?.schedule ? {
            days: data.schedule.days || defaults.schedule.days,
            time: data.schedule.time || defaults.schedule.time,
            duration: data.schedule.duration || defaults.schedule.duration,
        } : defaults.schedule,
    };
};

interface ClassFormProps {
    initialData?: AdminClassView | null;
    onSubmit: (data: ClassFormValues) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

export function ClassForm({ initialData, onSubmit, isSubmitting = false, mode }: ClassFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { users: teachers, usersLoading: teachersLoadingStatus } = useAppSelector((state) => state.auth);

    const coursesForDropdown = useAppSelector(selectAuthCourses);
    const coursesFetchStatus = useAppSelector(selectAuthCourseStatus);

    const initialFetchDispatched = useRef(false);

    useEffect(() => {
        if (!initialFetchDispatched.current) {
            if (coursesFetchStatus === 'idle') {
                dispatch(fetchAuthCourses());
            }
            if (!teachersLoadingStatus && (!teachers || teachers.length === 0)) {
                dispatch(fetchUsersByRole({ role: 'teacher' }));
            }
            initialFetchDispatched.current = true;
        }
    }, [dispatch, coursesFetchStatus, teachersLoadingStatus, teachers]);

    const form = useForm<ClassFormValues>({
        resolver: zodResolver(classFormSchema),
        defaultValues: mapDataToForm(initialData), // mapDataToForm should provide a complete set of defaults
        mode: "onChange", // Or "onTouched" for validation trigger
    });

    useEffect(() => {
        form.reset(mapDataToForm(initialData));
    }, [initialData, form, mode]); // Removed `mode` from reset deps if mapDataToForm handles defaults based on initialData presence

    const handleSubmit = async (data: ClassFormValues) => {
        const payloadToSend: ClassFormValues = {
            ...data,
            // maxSlots defaults to maxStudents if undefined or less than 1, Zod default handles initial undefined
            // This logic can be refined based on exact requirements for when maxSlots should default to maxStudents
            maxSlots: (data.maxSlots !== undefined && data.maxSlots >= 1) ? data.maxSlots : data.maxStudents,
        };
        console.log("ClassForm handleSubmit, data being sent to parent onSubmit:", payloadToSend);
        await onSubmit(payloadToSend);
    };

    const isLoadingDropdownData = coursesFetchStatus === 'loading' || teachersLoadingStatus;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === 'create' ? 'Create New Class Session' : 'Edit Class Session'}</CardTitle>
                        <CardDescription>
                            {mode === 'create' ? 'Define a new class session under a parent course.' : 'Update the details for this class session.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name / Title*</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Weekday Morning Batch" /></FormControl>
                                <FormDescription>A unique name for this specific class session.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="courseId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Course*</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                    value={field.value || undefined} // Pass undefined if "" or null to show placeholder
                                    disabled={isLoadingDropdownData}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={coursesFetchStatus === 'loading' ? "Loading courses..." : "Select the parent course"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">-- Select Course --</SelectItem>
                                        {coursesForDropdown.length > 0 ? coursesForDropdown.map((course: AuthCourse) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title}
                                            </SelectItem>
                                        )) : (
                                            <SelectItem value="no-courses-placeholder" disabled>
                                                {coursesFetchStatus === 'loading' ? 'Loading...' : 'No courses available'}
                                            </SelectItem>
                                        )}

                                    </SelectContent>
                                </Select>
                                <FormDescription>The main course this class session belongs to.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="teacherId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign Facilitator (Optional)</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || "none"} // "none" is the value for the "-- No Facilitator --" option
                                    disabled={isLoadingDropdownData}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={teachersLoadingStatus ? "Loading teachers..." : "Select a facilitator"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">-- No Facilitator --</SelectItem>
                                        {teachers.length > 0 ? teachers.map((teacher: User) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </SelectItem>
                                        )) : (
                                            !teachersLoadingStatus && <SelectItem value="no-teachers-placeholder" disabled>No teachers available</SelectItem>
                                        )}
                                        {teachersLoadingStatus && <SelectItem value="loading-teachers" disabled>Loading...</SelectItem>}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Description (Optional)</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Details specific to this class session..." rows={3} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    {/* FIX: Added FormControl wrapper for DatePicker */}
                                    <FormControl>
                                        <DatePickerWithYearMonth
                                            date={field.value}
                                            setDate={field.onChange}
                                            placeholder="Select start date"
                                        />
                                    </FormControl>
                                    <FormDescription> {field.value ? `Selected: ${field.value.toLocaleDateString()}` : "Optional"} </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    {/* FIX: Added FormControl wrapper for DatePicker */}
                                    <FormControl>
                                        <DatePickerWithYearMonth
                                            date={field.value}
                                            setDate={field.onChange}
                                            placeholder="Select end date"
                                            fromDate={form.getValues('startDate')}
                                        />
                                    </FormControl>
                                    <FormDescription> {field.value ? `Selected: ${field.value.toLocaleDateString()}` : "Optional"} </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="full">Full (No New Enrolments)</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                        <SelectItem value="archived">Archived (Historical)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="maxStudents" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Students*</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} // Zod coerce handles string to number
                                            value={field.value ?? ''} // Handle number to string for input value
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="maxSlots" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Slots (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                            value={field.value ?? ''} // Handle optional number to string
                                            placeholder="Defaults to Max Students"
                                        />
                                    </FormControl>
                                    <FormDescription>Leave blank to use Max Students value.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location (Optional)</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Room 101, Online via Zoom" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="schedule.time" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scheduled Time (Optional)</FormLabel>
                                {/* FIX: Removed space between FormControl and Input */}
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormDescription>E.g., 14:00 for 2 PM.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 pt-8">
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Class Session' : 'Save Changes')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}