// features/settings/components/SettingsSecurity.tsx
"use client";
import React from 'react';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SettingsSecurity: React.FC = () => {
    // TODO: Implement change password form with react-hook-form + zod
    // TODO: Fetch login history (Post-MVP)
    // TODO: Implement 2FA setup (Post-MVP)

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Change Password Form Placeholder */}
                <div className="space-y-2">
                    <h3 className="font-medium">Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" disabled />
                    </div>
                    <DyraneButton disabled>Update Password</DyraneButton>
                </div>
                <p className="text-sm text-muted-foreground">Password change functionality coming soon.</p>

                {/* Placeholder for 2FA and Login History */}
            </CardContent>
        </DyraneCard>
    );
};
export default SettingsSecurity;