// features/corporate/components/forms/CorporateStudentForm.tsx
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DyraneCard, DyraneCardContent, DyraneCardFooter, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription } from '@/components/dyrane-ui/dyrane-card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
// Optionally import Select if assigning class during creation
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schema for creating a corporate student
const createStudentSchema = z.object({
    name: z.string().min(2, { message: "Student's full name is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    // password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(), // Optional: Let backend generate?
    // classId: z.string().optional(), // Optional: Assign class during creation?
});

type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

interface CorporateStudentFormProps {
    onSubmit: (data: CreateStudentFormValues) => Promise<void>;
    isSubmitting: boolean;
    // availableClasses?: Array<{ id: string; title: string }>; // Pass classes if assigning here
}

export function CorporateStudentForm({ onSubmit, isSubmitting /*, availableClasses */ }: CorporateStudentFormProps) {
    const router = useRouter();

    const form = useForm<CreateStudentFormValues>({
        resolver: zodResolver(createStudentSchema),
        defaultValues: {
            name: "",
            email: "",
            // password: "",
            // classId: "",
        },
        mode: "onBlur",
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DyraneCard>
                    <DyraneCardHeader>
                        <DyraneCardTitle>Add New Student</DyraneCardTitle>
                        <DyraneCardDescription>
                            Enter the details for the new student account. They will receive instructions to complete their profile.
                        </DyraneCardDescription>
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                        {/* Student Name */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Student Full Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Jane Doe" /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Student Email */}
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Student Email</FormLabel><FormControl><Input type="email" {...field} placeholder="e.g., jane.doe@company.com" /></FormControl><FormDescription>Must be a unique email address.</FormDescription><FormMessage /></FormItem>
                        )} />

                        {/* Optional: Initial Password */}
                        {/* <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Initial Password (Optional)</FormLabel><FormControl><Input type="password" {...field} placeholder="Leave blank to auto-generate" /></FormControl><FormDescription>If left blank, a temporary password will be set.</FormDescription><FormMessage /></FormItem>
                         )} /> */}

                        {/* Optional: Assign to Class */}
                        {/* {availableClasses && availableClasses.length > 0 && (
                             <FormField control={form.control} name="classId" render={({ field }) => (
                                <FormItem><FormLabel>Assign to Class (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl><SelectContent>{availableClasses.map(c=>(<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                             )} />
                         )} */}

                    </DyraneCardContent>
                    <DyraneCardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Creating...' : 'Create Student Account'}
                        </Button>
                    </DyraneCardFooter>
                </DyraneCard>
            </form>
        </Form>
    );
}