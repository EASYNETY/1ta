// features/settings/components/SettingsStudentExtras.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { CreditCard } from 'lucide-react';

const SettingsStudentExtras: React.FC = () => {
    // TODO: Fetch and display Guardian Info if applicable

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your current plan and payment details.</CardDescription>
            </CardHeader>
            <CardContent>
                <DyraneButton asChild>
                    <Link href="/subscription/manage">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Go to Subscription Management
                    </Link>
                </DyraneButton>
                {/* Placeholder for Guardian Info */}
                {/* <Separator className="my-6"/>
                 <h3 className="text-md font-medium mb-2">Guardian Information</h3>
                 <p className="text-sm text-muted-foreground">Guardian details appear here...</p> */}
            </CardContent>
        </DyraneCard>
    );
};
export default SettingsStudentExtras;