// features/schedule/components/forms/ScheduleEventForm.tsx
"use client";

import React, { useEffect, useMemo } from 'react';
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
import { TimePicker } from '@/components/ui/time-picker';
import { formatISO, parseISO, setHours, setMinutes, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
// Ensure types are imported correctly
import type { ScheduleEvent, ScheduleEventType, CreateScheduleEventPayload, UpdateScheduleEventPayload } from '../../types/schedule-types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { fetchUsersByRole } from '@/features/auth/store/user-thunks';
import { fetchAuthCourses, selectAuthCourses, selectAuthCourseStatus } from '@/features/auth-course/store/auth-course-slice';
import { fetchAllClassesAdmin } from '@/features/classes/store/classes-thunks';
import { selectAllAdminClasses, selectClassesStatus as selectAdminClassesStatus } from '@/features/classes/store/classes-slice';

import type { AuthCourse } from '@/features/auth-course/types/auth-course-interface'; // Used for dropdowns
import type { AdminClassView } from '@/features/classes/types/classes-types'; // Used for dropdowns

// Zod Schema for form values
const scheduleEventFormSchema = z.object({
    title: z.string().min(3, "Event title must be at least 3 characters."),
    type: z.enum(["lecture", "lab", "exam", "office-hours", "meeting", "other"]),
    eventDate: z.date({ required_error: "Date is required." }),
    startTimeHours: z.number().min(0).max(23),
    startTimeMinutes: z.number().min(0).max(59),
    endTimeHours: z.number().min(0).max(23),
    endTimeMinutes: z.number().min(0).max(59),
    description: z.string().optional(),
    location: z.string().optional(),
    meetingLink: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
    // This is the course the event (and potentially the selected class) will be linked to.
    // For edit mode, this might be pre-filled. For create, it might be optional or required based on your rules.
    // If an event *must* be linked to a course, make this required in create mode.
    targetCourseId: z.string().optional(),
    classId: z.string().optional(), // The class session for the event
    instructorId: z.string().optional(),
}).refine(data => {
    if (data.eventDate && data.startTimeHours != null && data.startTimeMinutes != null && data.endTimeHours != null && data.endTimeMinutes != null) {
        const start = data.startTimeHours * 60 + data.startTimeMinutes;
        const end = data.endTimeHours * 60 + data.endTimeMinutes;
        return end >= start;
    }
    return true;
}, {
    message: "End time must be on or after start time.",
    path: ["endTimeHours"],
});

type ScheduleEventFormValues = z.infer<typeof scheduleEventFormSchema>;

// --- Mapping Functions ---
// Maps a backend ScheduleEvent to form values
const mapEventToFormValues = (
    event?: ScheduleEvent | null,
    allFetchedAdminClasses?: AdminClassView[] // Still useful if a class has a default course
): Partial<ScheduleEventFormValues> => {
    let startDate = event?.start_time ? parseISO(event.start_time) : undefined;
    let endDate = event?.end_time ? parseISO(event.end_time) : undefined;

    if (startDate && !isValid(startDate)) startDate = undefined;
    if (endDate && !isValid(endDate)) endDate = undefined;

    // For edit mode, the event.course_id IS the targetCourseId.
    // The event.class_id is the selected classId.
    let initialTargetCourseId = event?.course_id || "";

    // If event.course_id is not set, but event.class_id is, and that class has a course,
    // we could pre-fill targetCourseId with the class's current course as a suggestion.
    // However, your new logic implies targetCourseId is independent.
    // So, if event.course_id is null, targetCourseId will be empty unless user selects one.
    if (!initialTargetCourseId && event?.class_id && allFetchedAdminClasses) {
        const linkedClass = allFetchedAdminClasses.find(c => c.id === event.class_id);
        if (linkedClass?.courseId) {
            // This would pre-fill targetCourseId with the class's *current* course.
            // Decide if this is desired or if targetCourseId should always be distinct in edit unless event.course_id exists.
            // initialTargetCourseId = linkedClass.courseId;
        }
    }


    return {
        title: event?.title || "",
        type: event?.type || "lecture",
        eventDate: startDate,
        startTimeHours: startDate ? startDate.getHours() : 9,
        startTimeMinutes: startDate ? startDate.getMinutes() : 0,
        endTimeHours: endDate ? endDate.getHours() : 10,
        endTimeMinutes: endDate ? endDate.getMinutes() : 0,
        description: event?.description || "",
        location: event?.location || "",
        meetingLink: event?.meeting_link || "",
        targetCourseId: initialTargetCourseId,
        classId: event?.class_id || "",
        instructorId: event?.instructor_id || "",
    };
};

interface ScheduleEventFormProps {
    initialData?: ScheduleEvent | null;
    onSubmit: (data: CreateScheduleEventPayload | UpdateScheduleEventPayload) => Promise<void>;
    isSubmitting?: boolean;
    mode: 'create' | 'edit';
}

export function ScheduleEventForm({ initialData, onSubmit, isSubmitting = false, mode }: ScheduleEventFormProps) {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const router = useRouter();

    const { users: instructors, usersLoading: instructorFetchLoading } = useAppSelector((state) => state.auth);
    const coursesForDropdown = useAppSelector(selectAuthCourses); // Renamed for clarity
    const coursesFetchStatus = useAppSelector(selectAuthCourseStatus);
    const allAdminClasses = useAppSelector(selectAllAdminClasses);
    const adminClassesFetchStatus = useAppSelector(selectAdminClassesStatus);

    const form = useForm<ScheduleEventFormValues>({
        resolver: zodResolver(scheduleEventFormSchema),
        defaultValues: mapEventToFormValues(initialData, allAdminClasses),
    });

    useEffect(() => {
        if ((!instructors || instructors.length === 0) && !instructorFetchLoading) {
            dispatch(fetchUsersByRole({ role: 'teacher' }));
        }
        if (coursesFetchStatus === 'idle' || coursesForDropdown.length === 0) {
            dispatch(fetchAuthCourses());
        }
        if (adminClassesFetchStatus === 'idle' || allAdminClasses.length === 0) {
            dispatch(fetchAllClassesAdmin({ limit: 1000 }));
        }
    }, [dispatch, instructors, instructorFetchLoading, coursesFetchStatus, coursesForDropdown, adminClassesFetchStatus, allAdminClasses]);

    useEffect(() => {
        if (initialData || allAdminClasses.length > 0 || mode === 'create') {
            form.reset(mapEventToFormValues(initialData, allAdminClasses));
        }
    }, [initialData, form, allAdminClasses, mode]);

    // The "classesToDisplayInDropdown" will now always be allAdminClasses,
    // as the first dropdown is for selecting the target course, not for filtering this list.
    const classesToDisplayInDropdown = useMemo(() => {
        return allAdminClasses;
    }, [allAdminClasses]);


    const handleSubmitForm = async (formValues: ScheduleEventFormValues) => {
        const combineDateTime = (datePart: Date, hours: number, minutes: number): string | undefined => {
            if (!datePart || !isValid(datePart)) return undefined;
            let combined = setHours(new Date(datePart), hours);
            combined = setMinutes(combined, minutes);
            return formatISO(combined);
        };

        const calculatedStartTimeISO = combineDateTime(formValues.eventDate, formValues.startTimeHours, formValues.startTimeMinutes);
        const calculatedEndTimeISO = combineDateTime(formValues.eventDate, formValues.endTimeHours, formValues.endTimeMinutes);

        if (!calculatedStartTimeISO || !calculatedEndTimeISO) {
            toast({ title: "Error", description: "Invalid date or time selected.", variant: "destructive" });
            return;
        }

        const startTimeForPayload: string = calculatedStartTimeISO;
        const endTimeForPayload: string = calculatedEndTimeISO;

        // A class session must always be selected for an event.
        if (!formValues.classId) {
            form.setError("classId", { type: "manual", message: "A class session must be selected." });
            toast({ title: "Validation Error", description: "A class session must be selected.", variant: "destructive" });
            return;
        }

        // A target course must be selected if your business logic requires events to be linked to courses.
        // For this new scenario, it's crucial.
        if (!formValues.targetCourseId && mode === 'create') { // More strict for create
            form.setError("targetCourseId", { type: "manual", message: "A target course must be selected to link the event and class." });
            toast({ title: "Validation Error", description: "A target course must be selected.", variant: "destructive" });
            return;
        }
        if (!formValues.targetCourseId && mode === 'edit' && !initialData?.course_id) { // If editing and it wasn't linked before, now it might need to be
            // Decide if this is an error or if an event can exist unlinked to a course in edit mode
        }


        // Get details of the selected class
        const selectedClassInfo = allAdminClasses.find(c => c.id === formValues.classId);
        if (!selectedClassInfo) {
            form.setError("classId", { type: "manual", message: "Selected class session not found. Please re-select." });
            return; // Should not happen if classId is from the dropdown
        }

        // Get details of the target course (from the first dropdown)
        let actualCourseIdForPayload: string | undefined = formValues.targetCourseId;
        let actualCourseSlugForPayload: string | undefined = undefined;
        let actualCourseTitleForPayload: string | undefined = undefined;

        if (actualCourseIdForPayload) {
            const targetCourseDetails = coursesForDropdown.find(course => course.id === actualCourseIdForPayload);
            if (targetCourseDetails) {
                actualCourseSlugForPayload = targetCourseDetails.slug;
                actualCourseTitleForPayload = targetCourseDetails.title; // Or targetCourseDetails.name
            } else if (mode === 'create' || (mode === 'edit' && formValues.targetCourseId !== initialData?.course_id)) {
                // If a targetCourseId is selected but not found in our list (should be rare if lists are synced)
                form.setError("targetCourseId", { type: "manual", message: "Selected target course not found." });
                toast({ title: "Data Error", description: "The selected target course could not be found. Please refresh.", variant: "destructive" });
                return;
            }
        }


        const payloadData = {
            title: formValues.title,
            type: formValues.type as ScheduleEventType,
            start_time: startTimeForPayload,
            end_time: endTimeForPayload,
            description: formValues.description || (mode === 'edit' && formValues.hasOwnProperty('description') ? null : undefined),
            location: formValues.location || (mode === 'edit' && formValues.hasOwnProperty('location') ? null : undefined),
            meeting_link: formValues.meetingLink || (mode === 'edit' && formValues.hasOwnProperty('meetingLink') ? null : undefined),

            class_id: formValues.classId, // Always send the selected classId
            instructor_id: formValues.instructorId || (mode === 'edit' && formValues.hasOwnProperty('instructorId') ? null : undefined),

            // These now come from the 'targetCourseId' selection
            course_id: actualCourseIdForPayload || (mode === 'edit' ? null : undefined),
            course_slug: actualCourseSlugForPayload || (mode === 'edit' ? null : undefined),
            course_title: actualCourseTitleForPayload || (mode === 'edit' ? null : undefined),
        };

        Object.keys(payloadData).forEach(key => {
            if (payloadData[key as keyof typeof payloadData] === undefined && mode === 'create') {
                delete payloadData[key as keyof typeof payloadData];
            }
        });

        let finalApiPayload: CreateScheduleEventPayload | UpdateScheduleEventPayload;

        if (mode === 'edit' && initialData?.id) {
            finalApiPayload = { id: initialData.id, ...(payloadData as Omit<UpdateScheduleEventPayload, 'id'>) };
        } else {
            finalApiPayload = payloadData as CreateScheduleEventPayload;
        }

        console.log("Final API payload being sent (for event creation/update):", finalApiPayload);
        // This payload will be used by createScheduleEvent or updateScheduleEvent.
        // The createScheduleEvent thunk will then use finalApiPayload.class_id and finalApiPayload.course_id
        // to dispatch updateClass and updateAuthCourse.
        await onSubmit(finalApiPayload);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)}>
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === 'create' ? 'Create Schedule Event' : 'Edit Schedule Event'}</CardTitle>
                        <CardDescription>
                            {mode === 'create' ? 'All events must be linked to a specific Class session.' : 'Update the event details.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Event Title*</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="e.g., Midterm Exam" /></FormControl><FormMessage /></FormItem>
                        )} />
                        {/* Type */}
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Event Type*</FormLabel><Select onValueChange={field.onChange} value={field.value || 'lecture'} >
                                <FormControl><SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="lecture">Lecture</SelectItem><SelectItem value="lab">Lab</SelectItem><SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="office-hours">Office Hours</SelectItem><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="other">Other</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        {/* Date */}
                        <FormField control={form.control} name="eventDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date*</FormLabel>
                                <DatePickerWithYearMonth date={field.value} setDate={field.onChange} placeholder="Select event date" />
                                <FormDescription>{field.value ? `Selected: ${field.value.toLocaleDateString()}` : "No date selected"}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {/* Time Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startTimeHours" render={({ field }) => (
                                <FormItem> <FormLabel>Start Time*</FormLabel>
                                    <TimePicker hours={field.value} minutes={form.watch('startTimeMinutes')} onHoursChange={field.onChange} onMinutesChange={(m) => form.setValue('startTimeMinutes', m, { shouldValidate: true })} />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endTimeHours" render={({ field }) => (
                                <FormItem> <FormLabel>End Time*</FormLabel>
                                    <TimePicker hours={field.value} minutes={form.watch('endTimeMinutes')} onHoursChange={field.onChange} onMinutesChange={(m) => form.setValue('endTimeMinutes', m, { shouldValidate: true })} />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <input type="hidden" {...form.register("startTimeMinutes")} />
                            <input type="hidden" {...form.register("endTimeMinutes")} />
                        </div>
                        {(form.formState.errors.root?.message || form.formState.errors.endTimeHours?.message) &&
                            <FormMessage>{form.formState.errors.root?.message || form.formState.errors.endTimeHours?.message}</FormMessage>}


                        <h3 className="text-lg font-medium pt-2 border-t mt-4">Link Event & Class to Course*</h3>
                        {/* Target Course Selection Dropdown */}
                        <FormField
                            control={form.control}
                            name="targetCourseId" // Updated name
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>1. Select Target Course*</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value === "none" ? "" : value);
                                            // When target course changes, we might want to clear the selected class
                                            // if the user should re-evaluate, or keep it if any class can be linked to any course.
                                            // For your new requirement, class selection is independent, so no need to reset classId.
                                        }}
                                        value={field.value || "none"} >
                                        <FormControl><SelectTrigger><SelectValue placeholder={coursesFetchStatus === 'loading' ? "Loading courses..." : "Select the course for this event"} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">-- Select Target Course --</SelectItem>
                                            {/* Using coursesForDropdown (renamed from coursesForFilterDropdown) */}
                                            {coursesForDropdown.map(c => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The course this event will belong to. The selected class session below will also be associated with this course.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        {/* Class Selection Dropdown - now shows ALL classes */}
                        <FormField
                            control={form.control}
                            name="classId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>2. Select Class Session*</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                        value={field.value || "none"} >
                                        <FormControl><SelectTrigger>
                                            <SelectValue placeholder={
                                                adminClassesFetchStatus === 'loading' ? "Loading classes..." :
                                                    // classesToDisplayInDropdown now refers to allAdminClasses
                                                    (allAdminClasses.length === 0) ? "No classes available" :
                                                        "Select a class session..."
                                            } />
                                        </SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">-- Select a Class Session --</SelectItem>
                                            {/* Iterate over allAdminClasses directly or via classesToDisplayInDropdown if it's just a passthrough */}
                                            {allAdminClasses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name || `Class ID: ${c.id}`}
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        (Currently in: {coursesForDropdown.find(course => course.id === c.courseId)?.title || 'Unassigned/Other'})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select any available class session. It will be associated with the Target Course selected above upon saving.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <h3 className="text-lg font-medium pt-2 border-t mt-4">Optional Details</h3>
                        {/* Instructor */}
                        <FormField control={form.control} name="instructorId" render={({ field }) => (
                            <FormItem><FormLabel>Assign Facilitator</FormLabel>
                                <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={instructorFetchLoading ? "Loading instructors..." : "Select instructor"} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">-- None --</SelectItem>
                                        {instructors.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                                    </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        {/* Location, Meeting Link, Description */}
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="e.g., Room 301" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meetingLink" render={({ field }) => (
                            <FormItem><FormLabel>Meeting Link</FormLabel><FormControl><Input type="url" {...field} value={field.value || ''} placeholder="https://zoom.us/j/..." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} placeholder="Add notes..." rows={3} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || adminClassesFetchStatus === 'loading' || coursesFetchStatus === 'loading'}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Event' : 'Save Changes')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}