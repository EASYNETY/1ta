// features/settings/components/SettingsNotifications.tsx
"use client";
import React from 'react';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';


const SettingsNotifications: React.FC = () => {
    // TODO: Fetch notification preferences from Redux/API
    // TODO: Implement react-hook-form to manage state
    // TODO: Dispatch update thunk on save

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="mb-3 font-medium text-md">Email Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className='space-y-0.5'>
                                <Label htmlFor="email-messages" className="font-medium">New Messages</Label>
                                <p className='text-xs text-muted-foreground'>Receive email for new chat messages.</p>
                            </div>
                            <Switch id="email-messages" disabled />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className='space-y-0.5'>
                                <Label htmlFor="email-course-updates" className="font-medium">Course Updates</Label>
                                <p className='text-xs text-muted-foreground'>Get notified about new assignments, grades, etc.</p>
                            </div>
                            <Switch id="email-course-updates" checked disabled />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className='space-y-0.5'>
                                <Label htmlFor="email-announcements" className="font-medium">System Announcements</Label>
                                <p className='text-xs text-muted-foreground'>Receive important platform news.</p>
                            </div>
                            <Switch id="email-announcements" disabled />
                        </div>
                    </div>
                </div>
                <Separator />
                {/* Placeholder for Push Notifications */}
                <div>
                    <h3 className="mb-3 font-medium text-md">Push Notifications (Mobile App)</h3>
                    <p className="text-sm text-muted-foreground">Push notification settings coming soon.</p>
                </div>
            </CardContent>
            <CardFooter>
                <DyraneButton disabled>Save Preferences</DyraneButton>
            </CardFooter>
        </DyraneCard>
    );
};
export default SettingsNotifications;
