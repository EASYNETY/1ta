// features/support/components/SupportTicketForm.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createTicket, selectSupportCreateStatus, resetCreateStatus } from '../store/supportSlice';
import type { TicketPriority, CreateTicketPayload } from '../types/support-types';

const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const categories = ['technical', 'billing', 'course', 'general'];

const ticketFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100),
    description: z.string().min(20, "Description must be at least 20 characters").max(1000),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], { required_error: "Please select a priority" }),
    category: z.enum(['technical', 'billing', 'course', 'general'], { required_error: "Please select a category" }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface SupportTicketFormProps {
    onSuccess?: () => void; // Optional callback on successful submission
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const createStatus = useAppSelector(selectSupportCreateStatus);
    const { toast } = useToast();
    const isLoading = createStatus === 'loading';

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketFormSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            category: "general",
        },
    });

    const onSubmit = async (data: TicketFormValues) => {
        if (!user?.id) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
            return;
        }

        // Map form fields to API expected fields
        const payload = {
            title: data.title,
            subject: data.title, // Keep subject for backward compatibility
            description: data.description,
            priority: data.priority,
            category: data.category
        };

        try {
            await dispatch(createTicket({ userId: user.id, ...payload })).unwrap();
            toast({ variant: 'success', title: 'Support Ticket Created', description: 'Our team will review your request shortly.' });
            form.reset(); // Reset form on success
            dispatch(resetCreateStatus()); // Reset status for next submission
            if (onSuccess) onSuccess(); // Call optional callback
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: error || 'Could not create ticket.' });
            // Error is already set in slice, no need to dispatch resetCreateStatus here on failure
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Issue with course video" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select issue category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {priorities.map(p => (
                                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Describe the Issue</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Please provide as much detail as possible..."
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Include relevant details like course name, lesson number, browser, etc.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DyraneButton type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Ticket
                </DyraneButton>
            </form>
        </Form>
    );
};
