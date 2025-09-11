// features/auth/components/forgot-password-form.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, MailCheck, AlertCircle } from "lucide-react"; // Icons
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forgotPasswordThunk } from "@/features/auth/store/auth-thunks";

// Shadcn UI Imports
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"; // Assuming you have this hook

// DyraneUI Imports
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

// --- Zod Schema ---
const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// --- Component ---
export function ForgotPasswordForm() {
    const dispatch = useAppDispatch(); // Uncomment if using thunk
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false); // Use local loading state for simplicity
    const [isSubmitted, setIsSubmitted] = useState(false); // State to show success message
    const [serverError, setServerError] = useState<string | null>(null);

    // --- React Hook Form Setup ---
    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    // --- Submit Handler ---
    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        setServerError(null);
        setIsSubmitted(false); // Reset submitted state

        try {
            console.log("Sending forgot password request for:", data.email);
            // --- Replace with actual API Call ---
            await dispatch(forgotPasswordThunk(data)).unwrap();
            setIsSubmitted(true); // Show success message
            form.reset(); // Clear the form
            toast({ // Show success toast
                title: "Success",
                description: "Password reset link sent to your email.",
                variant: "default",
            });
            setServerError(null);

        } catch (error: any) {
            const errorMessage = error?.message || "Failed to send reset link. Please try again.";
            console.error("Forgot Password Failed:", error);
            setServerError(errorMessage); // Show error in Alert
            toast({ // Also show toast for error
                title: "Request Failed",
                description: errorMessage,
                variant: "destructive",
            });
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
                        <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Check Your Email</CardTitle>
                    <CardDescription>
                        If an account exists for the email provided, a password reset link has been sent. Please check your inbox (and spam folder).
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        );
    }


    // --- Form View ---
    return (
        <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                <CardDescription>Enter your email to receive a password reset link.</CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Server Error Alert */}
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage /> {/* Displays Zod validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <DyraneButton type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Sending Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </DyraneButton>

                    </form>
                </Form>
            </CardContent>

            <CardFooter className="justify-center text-sm pt-4">
                <Link href="/login" className="text-muted-foreground">
                    Remember password?
                    <span className="ml-2 font-medium text-primary hover:underline underline-offset-2">
                        Login
                    </span>
                </Link>
            </CardFooter>
        </Card>
    );
}
