"use client"

import type React from "react"

import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginSuccess } from "@/features/auth/store/auth-slice"
import { clearCart } from "@/features/cart/store/cart-slice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Steps } from "@/components/ui/steps"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useStripe, useElements } from "@stripe/react-stripe-js"
import { Textarea } from "@/components/ui/textarea"

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// Step 1: Account Information
const accountSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        role: z.enum(["student", "teacher", "admin"]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

// Step 2: Profile Information
const studentProfileSchema = z.object({
    studentId: z.string().optional(),
    institution: z.string().min(2, "Institution name must be at least 2 characters"),
    level: z.enum(["beginner", "intermediate", "advanced"]),
})

const teacherProfileSchema = z.object({
    specialty: z.string().min(2, "Specialty must be at least 2 characters"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    yearsOfExperience: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Years of experience must be a number",
    }),
    subjects: z.string().min(2, "Please list at least one subject you can teach"),
    qualifications: z.string().min(5, "Please provide your qualifications"),
})

const adminProfileSchema = z.object({
    department: z.string().min(2, "Department must be at least 2 characters"),
    position: z.string().min(2, "Position must be at least 2 characters"),
})

type AccountFormValues = z.infer<typeof accountSchema>
type StudentProfileFormValues = z.infer<typeof studentProfileSchema>
type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>
type AdminProfileFormValues = z.infer<typeof adminProfileSchema>

export function MultiStepSignup() {
    const [currentStep, setCurrentStep] = useState(0)
    const [accountData, setAccountData] = useState<AccountFormValues | null>(null)
    const [profileData, setProfileData] = useState<
        StudentProfileFormValues | TeacherProfileFormValues | AdminProfileFormValues | null
    >(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)

    const router = useRouter()
    const dispatch = useAppDispatch()
    const { signInWithGoogle } = useAuth()
    const { toast } = useToast()
    const { items, total } = useAppSelector((state) => state.cart)

    const {
        register: registerAccount,
        handleSubmit: handleSubmitAccount,
        formState: { errors: accountErrors },
        watch: watchAccount,
    } = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            role: "student",
        },
    })

    const selectedRole = watchAccount("role")

    const {
        register: registerStudentProfile,
        handleSubmit: handleSubmitStudentProfile,
        formState: { errors: studentProfileErrors },
    } = useForm<StudentProfileFormValues>({
        resolver: zodResolver(studentProfileSchema),
        defaultValues: {
            level: "beginner",
        },
    })

    const {
        register: registerTeacherProfile,
        handleSubmit: handleSubmitTeacherProfile,
        formState: { errors: teacherProfileErrors },
    } = useForm<TeacherProfileFormValues>({
        resolver: zodResolver(teacherProfileSchema),
    })

    const {
        register: registerAdminProfile,
        handleSubmit: handleSubmitAdminProfile,
        formState: { errors: adminProfileErrors },
    } = useForm<AdminProfileFormValues>({
        resolver: zodResolver(adminProfileSchema),
    })

    const handleAccountSubmit = (data: AccountFormValues) => {
        setAccountData(data)
        setCurrentStep(1)
    }

    const handleProfileSubmit = (data: StudentProfileFormValues | TeacherProfileFormValues | AdminProfileFormValues) => {
        setProfileData(data)

        // If student with items in cart, proceed to payment step
        if (selectedRole === "student" && items.length > 0) {
            // Create payment intent
            createPaymentIntent()
            setCurrentStep(2)
        } else {
            // Otherwise, complete registration
            completeRegistration()
        }
    }

    const createPaymentIntent = async () => {
        try {
            setIsSubmitting(true)

            // In a real implementation, this would be an API call to create a payment intent
            // const response = await post("/api/create-payment-intent", { amount: total })
            // setClientSecret(response.clientSecret)

            // For demo purposes, simulate a payment intent
            setTimeout(() => {
                setClientSecret("mock_client_secret")
                setIsSubmitting(false)
            }, 1000)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create payment intent",
                variant: "destructive",
            })
            setIsSubmitting(false)
        }
    }

    const completeRegistration = async () => {
        if (!accountData || !profileData) return

        try {
            setIsSubmitting(true)

            // In a real implementation, this would be an API call
            // const response = await post("/auth/register", {
            //   ...accountData,
            //   profile: profileData,
            //   courses: items.map(item => item.courseId),
            // })

            // For demo purposes, simulate a successful registration
            await new Promise((resolve) => setTimeout(resolve, 1500))

            dispatch(
                loginSuccess({
                    user: {
                        id: "user_123",
                        name: accountData.name,
                        email: accountData.email,
                        role: accountData.role,
                    },
                    token: "mock_token_123",
                }),
            )

            // Clear cart after successful registration
            dispatch(clearCart())

            toast({
                title: "Registration successful",
                description: "Your account has been created",
                variant: "success",
            })

            router.push("/dashboard")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Registration failed"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setIsSubmitting(true)

            const result = await signInWithGoogle()

            dispatch(
                loginSuccess({
                    user: {
                        id: result.uid,
                        name: result.displayName || "Google User",
                        email: result.email || "",
                        role: "student", // Default role for Google sign-ins
                    },
                    token: await result.getIdToken(),
                }),
            )

            // If there are items in the cart, enroll in those courses
            if (items.length > 0) {
                // In a real implementation, this would be API calls to enroll in courses
                // await Promise.all(items.map(item => post(`/courses/${item.courseId}/enroll`, {})))

                // Clear cart after enrollment
                dispatch(clearCart())
            }

            toast({
                title: "Sign in successful",
                description: "You have been signed in with Google",
                variant: "success",
            })

            router.push("/dashboard")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Google sign-in failed"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Determine the total number of steps
    const totalSteps = selectedRole === "student" && items.length > 0 ? 3 : 2

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                <Steps
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    labels={
                        selectedRole === "student" && items.length > 0 ? ["Account", "Profile", "Payment"] : ["Account", "Profile"]
                    }
                />
            </CardHeader>
            <CardContent>
                {currentStep === 0 && (
                    <>
                        <Button
                            variant="outline"
                            className="w-full mb-6"
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                "Signing in..."
                            ) : (
                                <>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Sign up with Google
                                </>
                            )}
                        </Button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitAccount(handleAccountSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    {...registerAccount("name")}
                                    aria-invalid={accountErrors.name ? "true" : "false"}
                                />
                                {accountErrors.name && <p className="text-sm text-red-500">{accountErrors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    {...registerAccount("email")}
                                    aria-invalid={accountErrors.email ? "true" : "false"}
                                />
                                {accountErrors.email && <p className="text-sm text-red-500">{accountErrors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">I am a</Label>
                                <Select
                                    defaultValue="student"
                                    onValueChange={(value) => registerAccount("role").onChange({ target: { value } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                                {accountErrors.role && <p className="text-sm text-red-500">{accountErrors.role.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...registerAccount("password")}
                                    aria-invalid={accountErrors.password ? "true" : "false"}
                                />
                                {accountErrors.password && <p className="text-sm text-red-500">{accountErrors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...registerAccount("confirmPassword")}
                                    aria-invalid={accountErrors.confirmPassword ? "true" : "false"}
                                />
                                {accountErrors.confirmPassword && (
                                    <p className="text-sm text-red-500">{accountErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Continue"}
                            </Button>
                        </form>
                    </>
                )}

                {currentStep === 1 && selectedRole === "student" && (
                    <form onSubmit={handleSubmitStudentProfile(handleProfileSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID (Optional)</Label>
                            <Input id="studentId" placeholder="e.g., STU12345" {...registerStudentProfile("studentId")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution/School</Label>
                            <Input
                                id="institution"
                                placeholder="e.g., University of Technology"
                                {...registerStudentProfile("institution")}
                                aria-invalid={studentProfileErrors.institution ? "true" : "false"}
                            />
                            {studentProfileErrors.institution && (
                                <p className="text-sm text-red-500">{studentProfileErrors.institution.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Experience Level</Label>
                            <Select
                                defaultValue="beginner"
                                onValueChange={(value) => registerStudentProfile("level").onChange({ target: { value } })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                            {studentProfileErrors.level && (
                                <p className="text-sm text-red-500">{studentProfileErrors.level.message}</p>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h3 className="font-medium">Courses in Cart</h3>
                                <div className="rounded-md border p-4">
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.courseId} className="flex justify-between">
                                                <span>{item.title}</span>
                                                <span className="font-medium">{formatCurrency(item.discountPrice || item.price)}</span>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : items.length > 0 ? "Continue to Payment" : "Complete Registration"}
                            </Button>
                        </div>
                    </form>
                )}

                {currentStep === 1 && selectedRole === "teacher" && (
                    <form onSubmit={handleSubmitTeacherProfile(handleProfileSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Specialty/Subject</Label>
                            <Input
                                id="specialty"
                                placeholder="e.g., Mathematics, Computer Science"
                                {...registerTeacherProfile("specialty")}
                                aria-invalid={teacherProfileErrors.specialty ? "true" : "false"}
                            />
                            {teacherProfileErrors.specialty && (
                                <p className="text-sm text-red-500">{teacherProfileErrors.specialty.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subjects">Subjects You Can Teach</Label>
                            <Input
                                id="subjects"
                                placeholder="e.g., Algebra, Calculus, Statistics"
                                {...registerTeacherProfile("subjects")}
                                aria-invalid={teacherProfileErrors.subjects ? "true" : "false"}
                            />
                            {teacherProfileErrors.subjects && (
                                <p className="text-sm text-red-500">{teacherProfileErrors.subjects.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualifications">Qualifications</Label>
                            <Input
                                id="qualifications"
                                placeholder="e.g., PhD in Mathematics, Certified Teacher"
                                {...registerTeacherProfile("qualifications")}
                                aria-invalid={teacherProfileErrors.qualifications ? "true" : "false"}
                            />
                            {teacherProfileErrors.qualifications && (
                                <p className="text-sm text-red-500">{teacherProfileErrors.qualifications.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                            <Input
                                id="yearsOfExperience"
                                type="number"
                                placeholder="e.g., 5"
                                {...registerTeacherProfile("yearsOfExperience")}
                                aria-invalid={teacherProfileErrors.yearsOfExperience ? "true" : "false"}
                            />
                            {teacherProfileErrors.yearsOfExperience && (
                                <p className="text-sm text-red-500">{teacherProfileErrors.yearsOfExperience.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Brief description of your teaching experience and approach"
                                {...registerTeacherProfile("bio")}
                                aria-invalid={teacherProfileErrors.bio ? "true" : "false"}
                                rows={4}
                            />
                            {teacherProfileErrors.bio && <p className="text-sm text-red-500">{teacherProfileErrors.bio.message}</p>}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Complete Registration"}
                            </Button>
                        </div>
                    </form>
                )}

                {currentStep === 1 && selectedRole === "admin" && (
                    <form onSubmit={handleSubmitAdminProfile(handleProfileSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                placeholder="e.g., IT, Academic Affairs"
                                {...registerAdminProfile("department")}
                                aria-invalid={adminProfileErrors.department ? "true" : "false"}
                            />
                            {adminProfileErrors.department && (
                                <p className="text-sm text-red-500">{adminProfileErrors.department.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                placeholder="e.g., System Administrator, Dean"
                                {...registerAdminProfile("position")}
                                aria-invalid={adminProfileErrors.position ? "true" : "false"}
                            />
                            {adminProfileErrors.position && (
                                <p className="text-sm text-red-500">{adminProfileErrors.position.message}</p>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Complete Registration"}
                            </Button>
                        </div>
                    </form>
                )}

                {currentStep === 2 && clientSecret && (
                    <div className="space-y-6">
                        <div className="rounded-md border p-4">
                            <div className="space-y-3">
                                <h3 className="font-medium">Order Summary</h3>
                                {items.map((item) => (
                                    <div key={item.courseId} className="flex justify-between">
                                        <span>{item.title}</span>
                                        <span className="font-medium">{formatCurrency(item.discountPrice || item.price)}</span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm onComplete={completeRegistration} onBack={() => setCurrentStep(1)} />
                        </Elements>
                    </div>
                )}
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

function PaymentForm({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)
        setErrorMessage(null)

        try {
            // In a real implementation, this would process the payment
            // const { error } = await stripe.confirmPayment({
            //   elements,
            //   confirmParams: {
            //     return_url: `${window.location.origin}/payment-confirmation`,
            //   },
            // })

            // For demo purposes, simulate a successful payment
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // if (error) {
            //   setErrorMessage(error.message || "An error occurred during payment processing")
            // } else {
            toast({
                title: "Payment successful",
                description: "Your payment has been processed successfully",
                variant: "success",
            })
            onComplete()
            // }
        } catch (error) {
            setErrorMessage("An unexpected error occurred")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Label>Card Details</Label>
                {/* In a real implementation, this would be a Stripe PaymentElement */}
                <div className="rounded-md border p-4 h-40 flex items-center justify-center">
                    <p className="text-center text-muted-foreground">
                        This is a demo payment form. In a real implementation, Stripe Elements would be rendered here.
                    </p>
                </div>
            </div>

            {errorMessage && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{errorMessage}</div>}

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
                    Back
                </Button>
                <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing Payment..." : "Complete Payment"}
                </Button>
            </div>
        </form>
    )
}
