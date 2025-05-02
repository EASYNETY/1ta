// features/settings/components/SettingsAppearance.tsx
"use client";
import React from 'react';
import { useTheme } from "next-themes";
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Laptop } from 'lucide-react';

const SettingsAppearance: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={theme}
                    onValueChange={setTheme} // Directly use setTheme from the hook
                    className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3" // Adjusted grid layout
                >
                    <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-3 h-6 w-6" />
                        Light
                    </Label>
                    <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-3 h-6 w-6" />
                        Dark
                    </Label>
                    <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Laptop className="mb-3 h-6 w-6" />
                        System
                    </Label>
                </RadioGroup>
            </CardContent>
        </DyraneCard>
    );
};
export default SettingsAppearance;