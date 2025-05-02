// features/settings/components/SettingsAdmin.tsx
"use client";

import React from 'react';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Construction } from 'lucide-react';

const SettingsAdmin: React.FC = () => {
    // TODO: Implement system settings controls (complex)
    // e.g., Default user roles, registration open/closed, etc.
    // Might link to separate dedicated admin sections instead of inline forms.

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage global platform configurations (Admin only).</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <Construction className="h-5 w-5 text-amber-700" />
                    <AlertTitle className="font-semibold text-amber-800">Under Construction</AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Detailed system settings management is planned for a future update. Core configurations are currently managed via backend settings or environment variables.
                    </AlertDescription>
                </Alert>
                {/* Placeholder for future admin settings */}
                <div className="mt-6 space-y-4">
                    <p className="text-muted-foreground">Placeholder for system settings controls...</p>
                    <DyraneButton disabled>Save System Settings</DyraneButton>
                </div>
            </CardContent>
        </DyraneCard>
    );
};

export default SettingsAdmin;