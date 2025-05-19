// features/schedule/components/forms/ScheduleEventForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePickerWithYearMonth } from '@/components/ui/date-picker-with-year-month'; // Use existing date picker
import { TimePicker } from '@/components/ui/time-picker'; // NEW component needed for time selection
import { formatISO, parseISO, setHours, setMinutes, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ScheduleEvent } from '../../types/schedule-types';
import { CreateScheduleEventPayload, UpdateScheduleEventPayload } from '../../store/schedule-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsersByRole } from '@/features/auth/store/user-thunks';


// --- Zod Schema ---
// Need to handle date and time separately then combine
const scheduleEventFormSchema = z.object({
    title: z.string().min(3, "Event title must be at least 3 characters"),
    type: z.enum(["lecture", "lab", "exam", "office-hours", "meeting", "other"]),
    eventDate: z.date({ required_error: "Date is required." }),
    startTimeHours: z.number().min(0).max(23),
    startTimeMinutes: z.number().min(0).max(59),
    endTimeHours: z.number().min(0).max(23),
    endTimeMinutes: z.number().min(0).max(59),
    description: z.string().optional(),
    location: z.string().optional(),
    meetingLink: z.string().url("Must be a valid URL").optional().or(z.literal('')), // Allow empty string
    courseId: z.string().optional(), // Link to AuthCourse
    classId: z.string().optional(), // Link to specific Class instance
    instructorId: z.string().optional(),
}).refine(data => { // Validate end time >= start time
    const start = data.startTimeHours * 60 + data.startTimeMinutes;
    const end = data.endTimeHours * 60 + data.endTimeMinutes;
    return end >= start;
}, {
    message: "End time must be on or after start time",
    path: ["endTimeHours"], // Point error to end time
});

type ScheduleEventFormValues = z.infer<typeof scheduleEventFormSchema>;

// --- Mapping Functions ---
const mapEventToForm = (event?: ScheduleEvent | null): Partial<ScheduleEventFormValues> => {
    let startDate = event?.startTime ? parseISO(event.startTime) : undefined;
    let endDate = event?.endTime ? parseISO(event.endTime) : undefined;

    // Ensure dates are valid before extracting time parts
    if (startDate && !isValid(startDate)) startDate = undefined;
    if (endDate && !isValid(endDate)) endDate = undefined;

    return {
        title: event?.title || "",
        type: event?.type || "lecture",
        eventDate: startDate, // Date picker uses the start date's date part
        startTimeHours: startDate ? startDate.getHours() : 9, // Default 9 AM
        startTimeMinutes: startDate ? startDate.getMinutes() : 0,
        endTimeHours: endDate ? endDate.getHours() : 10, // Default 10 AM
        endTimeMinutes: endDate ? endDate.getMinutes() : 0,
        description: event?.description || "",
        location: event?.location || "",
        meetingLink: event?.meetingLink || "",
        courseId: event?.courseId || "",
        classId: event?.classId || "",
        instructorId: event?.instructorId || "",
    };
};

// --- Form Component ---
interface ScheduleEventFormProps {
    initialData?: ScheduleEvent | null;
    onSubmit: (data: CreateScheduleEventPayload | UpdateScheduleEventPayload) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

export function ScheduleEventForm({ initialData, onSubmit, isSubmitting = false, mode }: ScheduleEventFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { users } = useAppSelector((state) => state.auth);
    const { allCourses } = useAppSelector((state) => state.public_courses);
    const { allClasses } = useAppSelector((state) => state.classes);

    const { toast } = useToast();
    const form = useForm<ScheduleEventFormValues>({
        resolver: zodResolver(scheduleEventFormSchema),
        defaultValues: mapEventToForm(initialData),
    });

    useEffect(() => {
        dispatch(fetchUsersByRole({ role: 'teacher' })); // Fetch teachers on mount
    }
        , []);

    useEffect(() => {
        form.reset(mapEventToForm(initialData));
    }, [initialData, form]);

    const handleSubmit = async (data: ScheduleEventFormValues) => {
        console.log("Schedule event form data before processing:", data);

        // Combine Date and Time into ISO strings
        const combineDateTime = (datePart: Date, hours: number, minutes: number): string | undefined => {
            if (!datePart || !isValid(datePart)) {
                console.log("Invalid date part:", datePart);
                return undefined;
            }

            // Ensure we have a valid date object
            const validDate = new Date(datePart);
            console.log("Valid date part:", validDate);

            let combined = setHours(validDate, hours);
            combined = setMinutes(combined, minutes);

            console.log("Combined date and time:", combined);
            return formatISO(combined);
        }

        const startTimeISO = combineDateTime(data.eventDate, data.startTimeHours, data.startTimeMinutes);
        const endTimeISO = combineDateTime(data.eventDate, data.endTimeHours, data.endTimeMinutes);

        if (!startTimeISO || !endTimeISO) {
            // This should ideally be caught by validation, but double-check
            //  toast.error("Invalid date or time selected.");
            toast({
                title: "Error",
                description: "Invalid date or time selected.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            title: data.title as string,
            type: data.type,
            startTime: startTimeISO,
            endTime: endTimeISO,
            description: data.description || undefined, // Send undefined if empty
            location: data.location || undefined,
            meetingLink: data.meetingLink || undefined,
            courseId: data.courseId || undefined,
            classId: data.classId || undefined,
            instructorId: data.instructorId || undefined,
        };

        if (mode === 'edit' && initialData?.id) {
            await onSubmit({ id: initialData.id, ...payload });
        } else {
            await onSubmit(payload as CreateScheduleEventPayload); // Assert type for create
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === 'create' ? 'Create Schedule Event' : 'Edit Schedule Event'}</CardTitle>
                        <CardDescription>
                            {mode === 'create' ? 'Add a new event to the schedule.' : 'Update the event details.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Midterm Exam, Week 3 Lecture" /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Type */}
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Event Type</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="lecture">Lecture</SelectItem>
                                    <SelectItem value="lab">Lab</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="office-hours">Office Hours</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                        )} />

                        {/* Date */}
                        <FormField control={form.control} name="eventDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <DatePickerWithYearMonth
                                    date={field.value}
                                    setDate={(date) => {
                                        console.log("Setting event date:", date);
                                        field.onChange(date);
                                    }}
                                    placeholder="Select event date"
                                />
                                <FormDescription>
                                    {field.value ? `Selected: ${field.value.toLocaleDateString()}` : "No date selected"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Time Pickers - Requires TimePicker component */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startTimeHours" render={({ field }) => ( // Use Controller for number type
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <TimePicker
                                        hours={field.value}
                                        minutes={form.watch('startTimeMinutes')} // Watch corresponding minutes
                                        onHoursChange={(h) => field.onChange(h)}
                                        onMinutesChange={(m) => form.setValue('startTimeMinutes', m)}
                                    />
                                    <FormMessage /> {/* Error for hours shown here */}
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endTimeHours" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <TimePicker
                                        hours={field.value}
                                        minutes={form.watch('endTimeMinutes')}
                                        onHoursChange={(h) => field.onChange(h)}
                                        onMinutesChange={(m) => form.setValue('endTimeMinutes', m)}
                                    />
                                    <FormMessage /> {/* Error for hours/validation shown here */}
                                </FormItem>
                            )} />
                            {/* Hidden fields for minutes needed for RHF Controller */}
                            <input type="hidden" {...form.register("startTimeMinutes")} />
                            <input type="hidden" {...form.register("endTimeMinutes")} />
                        </div>

                        {/* Optional Fields */}
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input {...field} placeholder="e.g., Room 301, Virtual Classroom B" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meetingLink" render={({ field }) => (
                            <FormItem><FormLabel>Meeting Link (Optional)</FormLabel><FormControl><Input type="url" {...field} placeholder="https://zoom.us/j/..." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} placeholder="Add notes, agenda, or details..." /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Relationship Selects */}
                        <FormField control={form.control} name="courseId" render={({ field }) => (
                            <FormItem><FormLabel>Link to Course (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="none">-- None --</SelectItem>{allCourses.map(c => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="classId" render={({ field }) => (
                            <FormItem><FormLabel>Link to Class Session (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select class session" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="none">-- None --</SelectItem>{allClasses.map(c => (<SelectItem key={c.id} value={c.id}>{c.courseTitle}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="instructorId" render={({ field }) => (
                            <FormItem><FormLabel>Assign Instructor (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="none">-- None --</SelectItem>{users.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Event' : 'Save Changes')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
