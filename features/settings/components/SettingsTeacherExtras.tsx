// features/settings/components/SettingsTeacherExtras.tsx
"use client";

import React from 'react';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Construction, Clock } from 'lucide-react';

const SettingsTeacherExtras: React.FC = () => {
    // TODO: Fetch teacher-specific settings (office hours, subjects)
    // TODO: Implement form with react-hook-form + zod
    // TODO: Dispatch update thunk on save

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Teaching Preferences</CardTitle>
                <CardDescription>Configure settings related to your teaching activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Placeholder for Office Hours */}
                <div className="space-y-2">
                    <Label htmlFor="officeHours">Office Hours Description</Label>
                    <Textarea
                        id="officeHours"
                        placeholder="e.g., Mondays 2 PM - 4 PM (Virtual Link) or by appointment"
                        className="min-h-[80px]"
                        disabled
                    />
                    <p className="text-xs text-muted-foreground">Describe when and how students can reach you for office hours.</p>
                </div>

                {/* Placeholder for Subjects/Expertise */}
                <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects / Expertise</Label>
                    <Input id="subjects" placeholder="e.g., PMP Certification, React, Node.js" disabled />
                    <p className="text-xs text-muted-foreground">List the main subjects you facilitate or specialize in.</p>
                </div>

                <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <Construction className="h-5 w-5 text-amber-700" />
                    <AlertTitle className="font-semibold text-amber-800">Under Construction</AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Facilitator-specific settings are coming soon.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <DyraneButton disabled>Save Facilitator Settings</DyraneButton>
            </CardFooter>
        </DyraneCard>
    );
};

export default SettingsTeacherExtras;