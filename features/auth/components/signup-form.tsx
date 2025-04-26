
// features/auth/components/signup-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { signupThunk } from "@/features/auth/store/auth-thunks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle, CardFooter, Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { GraduationCap } from "lucide-react"

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
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

            // Remove confirmPassword before sending to API
            const { confirmPassword, ...signupData } = data

            await dispatch(signupThunk(signupData)).unwrap()

            // Navigate to dashboard after successful registration
            router.push("/dashboard")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Registration failed"
            setServerError(errorMessage)
        }
    }


    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
                {cart.items.length > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-md">
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
            </CardHeader>
            <CardContent>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                            aria-invalid={errors.name ? "true" : "false"}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            {...register("email")}
                            aria-invalid={errors.email ? "true" : "false"}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            aria-invalid={errors.password ? "true" : "false"}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            aria-invalid={errors.confirmPassword ? "true" : "false"}
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{serverError}</div>}

                    <DyraneButton type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </DyraneButton>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
