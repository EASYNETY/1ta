// src/features/auth/components/SignupForm.tsx (Example Path)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Keep if needed for manual navigation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle } from "lucide-react"; // Import icons

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Assume signupThunk handles API call and returns user/token or throws error
import { signupThunk } from "@/features/auth/store/auth-thunks"; // Adjust path

// Shadcn UI Imports
import { Button } from "@/components/ui/button"; // Base button for toggle
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Replaced by FormLabel
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Use Form components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"; // Keep using your toast hook

// DyraneUI Imports
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";

// --- Zod Schema ---
// Define password complexity rules more explicitly if matching backend
const passwordValidation = z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
// Add backend rules here if needed (e.g., uppercase, number)
// .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
// .regex(/\d/, { message: "Password must contain a number" });

const signupSchema = z
    .object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: passwordValidation,
        confirmPassword: z.string(), // Keep confirmPassword for comparison
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Apply error to confirmPassword field
    });

type SignupFormValues = z.infer<typeof signupSchema>;

// --- Component ---
export function SignupForm() {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector((state) => state.auth.isLoading); // Get loading state
    const cart = useAppSelector((state) => state.cart);
    const router = useRouter(); // Keep if needed for specific navigation post-thunk
    const { toast } = useToast(); // Use Shadcn toast hook

    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- React Hook Form Setup ---
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // --- Submit Handler ---
    const onSubmit = async (data: SignupFormValues) => {
        setServerError(null); // Clear previous errors on new submit
        try {
            // Generate placeholders needed by backend (MVP Workaround)
            const barcodeId = `TEMP-${crypto.randomUUID()}`;
            // Use courseId from first cart item or default '1'
            const classId = cart.items.length > 0 ? (cart.items[0].courseId || '1') : '1';
            const dateOfBirth = "2000-01-01T00:00:00.000Z";

            // Data to send (exclude confirmPassword)
            const { confirmPassword, ...signupData } = data;
            const payload = {
                ...signupData,
                dateOfBirth,
                classId, // Mapped from courseId or default
                barcodeId,
                guardianId: null,
                // Send cart items if backend supports it (optional field)
                cartItems: cart.items.map(item => ({ courseId: item.courseId })), // Send only IDs for now
            };

            console.log("Attempting signup with payload:", payload); // Log payload for debugging

            // Dispatch the thunk and unwrap the result (handles loading/error state in slice)
            await dispatch(signupThunk(payload)).unwrap();

            toast({
                title: "Account Created Successfully!",
                description: "Redirecting you to the next step...",
                variant: "success",
            });

            // Thunk success should update auth state. Navigation to payment/dashboard
            // should ideally be handled based on that state change, possibly
            // triggered by the component listening to authSlice or by logic within the thunk itself.
            // Avoid manual router.push here if possible, rely on auth state changes.
            // Example: router.push('/checkout'); // If thunk doesn't navigate

        } catch (error: any) {
            const errorMessage = error?.message || "Registration failed. Please try again.";
            console.error("Signup Failed:", error);
            setServerError(errorMessage); // Show specific error from backend/thunk
            toast({
                title: "Registration Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none"> {/* Card structure */}
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>Join 1Tech Academy to start learning</CardDescription>
            </CardHeader>

            <CardContent>
                {/* Optional: Display selected courses */}
                {cart.items.length > 0 && (
                    <Alert variant="default" className="mb-4 bg-primary/5 border-primary/20">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-sm font-medium text-primary">
                            {cart.items.length} {cart.items.length === 1 ? "Course" : "Courses"} Selected
                        </AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground">
                            Complete signup to proceed with enrollment.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Shadcn Form Component */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Server Error Alert */}
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Signup Error</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Ada Lovelace" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage /> {/* Handles Zod error display */}
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="ada@example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pr-10"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                disabled={isLoading}
                                                tabIndex={-1} // Prevent toggle button from being tabbed to directly
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    {/* Optional: Add FormDescription for password rules */}
                                    {/* <FormDescription>Min 8 characters, include upper, lower, number.</FormDescription> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pr-10"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute top-0 right-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                disabled={isLoading}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage /> {/* Handles "Passwords do not match" error */}
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <DyraneButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </DyraneButton>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="flex flex-col items-center text-sm pt-4">
                <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline underline-offset-2">
                        Log In
                    </Link>
                </p>
                {/* Optional: Terms Link */}
                {/* <p className="text-xs text-muted-foreground mt-4 text-center">
                    By creating an account, you agree to our <br />
                    <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </p> */}
            </CardFooter>
        </Card>
    );
}