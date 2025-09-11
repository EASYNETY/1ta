// src/features/auth/components/ResetPasswordForm.tsx (Example Path)
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

// Redux Imports
import { useAppDispatch } from "@/store/hooks";
import { resetPasswordThunk } from "@/features/auth/store/auth-thunks"; // Import the thunk

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// DyraneUI Imports
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

// --- Zod Schema ---
// Mirror backend password validation
const passwordValidation = z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
    .regex(/\d/, { message: "Include at least one number" });
// Add special character regex if needed: .regex(/[^A-Za-z0-9]/, { message: "Include at least one special character"})

const resetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is missing."), // Validate token presence
        password: passwordValidation,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Apply error to this field
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// --- Component ---
export function ResetPasswordForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null); // Store token from URL

    // --- React Hook Form Setup ---
    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: resetToken || "", // Initialize with token from URL
            password: "",
            confirmPassword: "",
        },
    });

    // --- Extract token from URL ---
    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setResetToken(tokenFromUrl);
            // Set token in form state once retrieved
            form.setValue("token", tokenFromUrl, { shouldValidate: true });
        } else {
            setServerError("Password reset token is missing or invalid. Please request a new link.");
            // Optionally disable the form or show a different UI
        }
    }, [searchParams, form]); // Add form to dependency array for setValue



    // --- Submit Handler ---
    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!data.token) { // Double check token presence
            setServerError("Password reset token is missing.");
            return;
        }
        setIsLoading(true);
        setServerError(null);
        setIsSubmitted(false);

        try {
            // Send only token and password to the thunk/API
            const payload = { token: data.token, password: data.password };
            console.log("Dispatching resetPasswordThunk...");

            // Dispatch the reset password thunk
            await dispatch(resetPasswordThunk(payload)).unwrap();

            // If unwrap() doesn't throw, it was successful
            setIsSubmitted(true); // Show success view
            form.reset(); // Clear form

            toast({
                title: "Password Reset Successful",
                description: "Redirecting to login...",
                variant: "success",
            });
            // Redirect after a short delay
            setTimeout(() => router.push('/login'), 2500);
            setServerError(null); // Clear any previous errors

        } catch (error: any) {
            const errorMessage = error?.message || "Failed to reset password. The link may be invalid or expired.";
            console.error("Reset Password Failed:", error);
            setServerError(errorMessage); // Show error in Alert
            // Optionally show toast as well
            // toast({ title: "Reset Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Success View ---
    if (isSubmitted) {
        return (
            <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Password Reset</CardTitle>
                    <CardDescription>
                        Your password has been successfully updated. You will be redirected to the login page shortly.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                        Login Now
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    // --- Form View ---
    // Check if the token is missing even after mount attempt
    const isTokenMissing = !resetToken;

    return (
        <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                <CardDescription>Enter and confirm your new password below.</CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Server Error Alert (Includes Token Missing Error) */}
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Hidden Token Field (for validation & submission) */}
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (<FormItem className="hidden"><FormControl><Input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>)}
                        />

                        {/* New Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" {...field} disabled={isLoading || isTokenMissing} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"} disabled={isLoading || isTokenMissing} tabIndex={-1}>
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm New Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" {...field} disabled={isLoading || isTokenMissing} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground" aria-label={showConfirmPassword ? "Hide password" : "Show password"} disabled={isLoading || isTokenMissing} tabIndex={-1}>
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage /> {/* Handles match error */}
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <DyraneButton type="submit" size="lg" className="w-full mt-6" disabled={isLoading || isTokenMissing}>
                            {isLoading ? (<> <Loader2 className="animate-spin mr-2 h-4 w-4" /> Resetting Password... </>)
                                : isTokenMissing ? "Invalid Link" : "Reset Password"}
                        </DyraneButton>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="justify-center text-sm pt-4">
                <Link href="/login" className="text-muted-foreground hover:text-primary hover:underline underline-offset-2">
                    Back to Login
                </Link>
            </CardFooter>
        </Card>
    );
}
