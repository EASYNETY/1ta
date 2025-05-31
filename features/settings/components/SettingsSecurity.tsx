// features/settings/components/SettingsSecurity.tsx
"use client";
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changePasswordThunk } from '@/features/auth/store/auth-thunks'; // Adjust path as needed
import { selectAuthLoading, selectAuthError } from '@/features/auth/store/auth-slice'; // Adjust path
import { useToast } from '@/hooks/use-toast'; // Assuming you have a toast hook

// Define Zod schema for password change form
const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"], // Set error on confirmPassword field
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const SettingsSecurity: React.FC = () => {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(selectAuthLoading); // Or a specific loading state if you created one
    const error = useAppSelector(selectAuthError);       // Or a specific error state
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset, // To reset form after successful submission
    } = useForm<PasswordChangeFormValues>({
        resolver: zodResolver(passwordChangeSchema),
    });

    const onSubmit: SubmitHandler<PasswordChangeFormValues> = async (data) => {
        try {
            const resultAction = await dispatch(
                changePasswordThunk({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                })
            );

            if (changePasswordThunk.fulfilled.match(resultAction)) {
                toast({
                    title: "Success",
                    description: resultAction.payload.message || "Password updated successfully!",
                    variant: "success",
                });
                reset(); // Clear form fields
            } else if (changePasswordThunk.rejected.match(resultAction)) {
                // Error is already in the Redux state (and potentially shown globally)
                // We can also show a specific toast here for the form
                toast({
                    title: "Error",
                    description: resultAction.payload || "Failed to update password.",
                    variant: "destructive",
                });
            }
        } catch (e) {
            // This catch is for unexpected errors not handled by thunk rejection
            console.error("Unexpected error during password change:", e);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <h3 className="font-medium text-lg">Change Password</h3>
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            {...register("currentPassword")}
                            disabled={isSubmitting || isLoading}
                            className={errors.currentPassword ? "border-red-500" : ""}
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...register("newPassword")}
                            disabled={isSubmitting || isLoading}
                            className={errors.newPassword ? "border-red-500" : ""}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            disabled={isSubmitting || isLoading}
                            className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Display general API error from Redux store if not specific to a field */}
                    {error && !errors.currentPassword && !errors.newPassword && !errors.confirmPassword && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <DyraneButton type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting || isLoading ? "Updating..." : "Update Password"}
                    </DyraneButton>
                </form>
                {/* Placeholder for 2FA and Login History */}
            </CardContent>
        </DyraneCard>
    );
};
export default SettingsSecurity;