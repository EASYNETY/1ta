// features/corporate/components/forms/EditCorporateStudentForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DyraneCard, DyraneCardContent, DyraneCardFooter, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription } from '@/components/dyrane-ui/dyrane-card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // For isActive toggle
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { StudentUser } from '@/types/user.types';

// Schema for editable fields
const editStudentSchema = z.object({
    name: z.string().min(2, { message: "Student's full name is required." }),
    isActive: z.boolean(),
    // Add other editable fields if needed
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;

interface EditCorporateStudentFormProps {
    initialData: StudentUser; // Expect the full student object
    onSubmit: (data: EditStudentFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export function EditCorporateStudentForm({ initialData, onSubmit, isSubmitting }: EditCorporateStudentFormProps) {
    const router = useRouter();

    const form = useForm<EditStudentFormValues>({
        resolver: zodResolver(editStudentSchema),
        defaultValues: {
            name: initialData.name || "",
            isActive: (initialData.isActive === true || Number(initialData.isActive) === 1), // Default based on initial data
        },
        mode: "onBlur",
    });

    // Reset form if initialData changes (e.g., refetch after error)
    useEffect(() => {
        form.reset({
            name: initialData.name || "",
                      isActive: (initialData.isActive === true || Number(initialData.isActive) === 1),
        });
    }, [initialData, form]);


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DyraneCard>
                    <DyraneCardHeader>
                        <DyraneCardTitle>Edit Student: {initialData.email}</DyraneCardTitle>
                        <DyraneCardDescription>
                            Update the student's details. Email cannot be changed.
                        </DyraneCardDescription>
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                        {/* Student Name */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Student Full Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Jane Doe" /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Status Toggle */}
                        <FormField control={form.control} name="isActive" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Account Active</FormLabel>
                                    <FormMessage />
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Account Status" />
                                </FormControl>
                            </FormItem>
                        )} />

                        {/* TODO: Add password reset trigger button? */}
                        {/* <Button type="button" variant="outline" size="sm">Send Password Reset Email</Button> */}

                    </DyraneCardContent>
                    <DyraneCardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DyraneCardFooter>
                </DyraneCard>
            </form>
        </Form>
    );
}
