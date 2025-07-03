// features/auth/components/SignupForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { signupThunk } from "@/features/auth/store/auth-thunks"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// DyraneUI Imports
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"

// --- Zod Schema ---
const passwordValidation = z.string().min(8, { message: "Password must be at least 8 characters" })

const signupSchema = z
    .object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: passwordValidation,
        confirmPassword: z.string(),
        phone: z.string().min(1, { message: "Phone number is required" }),
        address: z.string().min(1, { message: "Address is required" }),
        referralCode: z.string().max(50, { message: "Referral code must be 50 characters or less" }).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type SignupFormValues = z.infer<typeof signupSchema>

// --- Component ---
export function SignupForm() {
    const dispatch = useAppDispatch()
    const isLoading = useAppSelector((state) => state.auth.isLoading)
    const router = useRouter()
    const { toast } = useToast()

    const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // --- React Hook Form Setup ---
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            address: "",
            referralCode: "",
        },
    })

    // --- Submit Handler ---
    const onSubmit = async (data: SignupFormValues) => {
        setServerErrors({})
        try {
            // Data to send (exclude confirmPassword)
            const { confirmPassword, ...signupData } = data
            const payload = {
                ...signupData,
                role: "student", // Set default role
                dateOfBirth: "2000-01-01T00:00:00.000Z",
            }

            console.log("Attempting signup with payload:", payload)

            // Dispatch the thunk and unwrap the result
            await dispatch(signupThunk(payload)).unwrap()

            toast({
                title: "Account Created Successfully!",
                description: "Redirecting you to the dashboard...",
                variant: "success",
            })

            // Navigate to dashboard
            router.push("/dashboard")
        } catch (error: any) {
            console.error("Signup Failed:", error)

            // Handle validation errors from the API
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                const fieldErrors: { [key: string]: string } = {}

                error.data.errors.forEach((err: any) => {
                    if (err.path && err.msg) {
                        fieldErrors[err.path] = err.msg

                        // Set the error in the form if the field exists
                        if (form.getFieldState(err.path as any)) {
                            form.setError(err.path as any, {
                                type: "server",
                                message: err.msg,
                            })
                        }
                    }
                })

                setServerErrors(fieldErrors)

                // Show a summary of validation errors
                const errorSummary = Object.values(fieldErrors).join(", ")
                toast({
                    title: "Registration Failed",
                    description: `Please fix the following issues: ${errorSummary}`,
                    variant: "destructive",
                })
            } else {
                // Generic error message
                const errorMessage = error?.message || "Registration failed. Please try again."
                setServerErrors({ general: errorMessage })
                toast({
                    title: "Registration Failed",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-xs border-none">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>Join 1Tech Academy to start learning</CardDescription>
            </CardHeader>

            <CardContent>
                {/* Shadcn Form Component */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Server Error Alert */}
                        {serverErrors.general && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Signup Error</AlertTitle>
                                <AlertDescription>{serverErrors.general}</AlertDescription>
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
                                        <Input placeholder="e.g., John Doe" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
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
                                        <Input type="email" placeholder="john@example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone Field */}
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+1234567890" {...field} disabled={isLoading} />
                                    </FormControl>
                                    {serverErrors.phone && !form.formState.errors.phone && (
                                        <p className="text-sm font-medium text-destructive">{serverErrors.phone}</p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address Field */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} disabled={isLoading} />
                                    </FormControl>
                                    {serverErrors.address && !form.formState.errors.address && (
                                        <p className="text-sm font-medium text-destructive">{serverErrors.address}</p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Referral Code Field */}
                        <FormField
                            control={form.control}
                            name="referralCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referral Code <span className="text-muted-foreground">(Optional)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter referral code if you have one" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormDescription>
                                        If someone referred you to 1Tech Academy, enter their referral code here.
                                    </FormDescription>
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
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Password must be at least 8 characters</FormDescription>
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
                                    <FormMessage />
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
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    By creating an account, you agree to our <br />
                    <Link href="/terms" className="underline hover:text-primary">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-primary">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </CardFooter>
        </Card>
    )
}
