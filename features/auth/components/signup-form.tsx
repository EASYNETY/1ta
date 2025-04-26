"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { signupThunk } from "@/features/auth/store/auth-thunks"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import Link from "next/link"
import { Eye, EyeOff, GraduationCap } from "lucide-react"

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
    const dispatch = useAppDispatch()
    const { isLoading, error } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const router = useRouter()
    const [serverError, setServerError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    })

    const onSubmit = async (data: SignupFormValues) => {
        try {
            setServerError(null)

            // Generate unique values for required fields
            const barcodeId = `TEMP-${crypto.randomUUID()}`
            const classId = cart.items.length > 0 ? cart.items[0].courseId : "1"
            const dateOfBirth = "2000-01-01T00:00:00.000Z" // Placeholder

            // Remove confirmPassword before sending to API
            const { confirmPassword, ...signupData } = data

            await dispatch(
                signupThunk({
                    ...signupData,
                    dateOfBirth,
                    classId,
                    barcodeId,
                    guardianId: null,
                }),
            ).unwrap()

            // Navigation is handled in the thunk
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Registration failed"
            setServerError(errorMessage)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
                <p className="text-muted-foreground text-sm">Join 1TechAcademy to start learning</p>
            </div>

            {cart.items.length > 0 && (
                <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-primary mr-2" />
                        <p className="text-sm font-medium">
                            {cart.items.length} {cart.items.length === 1 ? "course" : "courses"} in your selection
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Your selected courses will be associated with your account after signup.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" {...register("name")} aria-invalid={errors.name ? "true" : "false"} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        aria-invalid={errors.password ? "true" : "false"}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2 relative">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{serverError}</div>}

                <DyraneButton type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                </DyraneButton>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-2 text-sm">
                <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
