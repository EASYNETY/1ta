// app/(authenticated)/support/create/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SupportTicketForm } from '@/features/support/components/SupportTicketForm'; // Import the form
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { ArrowLeft } from 'lucide-react';

export default function CreateSupportTicketPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to the 'My Tickets' page after successful creation
        router.push('/support');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-2xl font-bold">Create Support Ticket</h1>
            </div>

            <DyraneCard>
                <CardHeader>
                    <CardTitle>Submit a New Request</CardTitle>
                    <CardDescription>Describe your issue below, and our support team will assist you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SupportTicketForm onSuccess={handleSuccess} />
                </CardContent>
            </DyraneCard>
        </div>
    );
}