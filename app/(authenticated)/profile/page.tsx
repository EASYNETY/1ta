// app/(authenticated)/profile/page.tsx

"use client"


import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateUserProfileThunk } from "@/features/auth/store/auth-thunks"
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, AlertCircle, GraduationCap, CalendarIcon } from "lucide-react"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define the schema for profile completion
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.date({
        required_error: "Date of birth is required for onboarding",
    }),
    classId: z.string({
        required_error: "Please select a class",
    }),
    accountType: z.enum(["individual", "corporate"], {
        required_error: "Please select an account type",
    }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, skipOnboarding } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOnboarding, setIsOnboarding] = useState(false)

    useEffect(() => {
        if (user) {
            setIsOnboarding(!isProfileComplete(user))
        }
    }, [user])

    // useEffect(() => {
    //     if (skipOnboarding && isOnboarding) {
    //         router.push("/dashboard")
    //     }
    // }, [skipOnboarding, isOnboarding, router])

    // Now we can safely have conditional returns
    if (!user) {
        return <div>Loading...</div>
    }

    // Check if this is part of onboarding
    // const isOnboarding = user ? !isProfileComplete(user) : false
    const hasItemsInCart = cart.items.length > 0

    // Redirect if onboarding is skipped
    // if (skipOnboarding && isOnboarding) {
    //   router.push("/dashboard")
    //   return null
    // }

    // Mock class data (in a real app, this would come from an API)
    const classes = [
        { id: "1", name: "Web Development Fundamentals" },
        { id: "2", name: "Advanced JavaScript" },
        { id: "3", name: "React & Next.js Masterclass" },
        { id: "4", name: "Mobile App Development" },
        { id: "5", name: "Data Science Basics" },
    ]

    // Pre-select class from cart if available
    const getDefaultClassId = () => {
        if (cart.items.length > 0) {
            // This is a simplified example - in a real app, you'd map courseId to classId
            // or fetch the appropriate class based on the course
            return "1" // Default to first class for demo
        }
        return user?.classId || ""
    }

    if (!user) return null

    const defaultValues: ProfileFormValues = {
        name: user?.name || "",
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date(), // fallback to today if undefined
        classId: getDefaultClassId(),
        accountType: "individual", // Default to individual
    }

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    })

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return

        try {
            setIsSubmitting(true)

            // Format the date to ISO string for API
            const formattedData = {
                ...data,
                dateOfBirth: data.dateOfBirth.toISOString(),
                onboardingStatus: "complete" as const,
            }

            // Dispatch the update profile thunk
            await dispatch(updateUserProfileThunk(formattedData)).unwrap()

            toast({
                title: isOnboarding ? "Onboarding Complete" : "Profile Updated",
                description: isOnboarding
                    ? "Your profile has been completed successfully. You now have full access to the platform."
                    : "Your profile has been updated successfully.",
                variant: "success",
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkipOnboarding = () => {
        dispatch(skipOnboardingProcess())
        toast({
            title: "Onboarding Skipped",
            description: "You can complete your profile later from your dashboard.",
            variant: "default",
        })
        router.push("/dashboard")
    }

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">{isOnboarding ? "Complete Your Profile" : "My Profile"}</h1>

            {isOnboarding && (
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Completion Required</AlertTitle>
                    <AlertDescription>Please complete your profile to access all features of the platform.</AlertDescription>
                </Alert>
            )}

            {hasItemsInCart && (
                <Alert className="mb-6 bg-primary/10 border-primary/20">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <AlertTitle>Course Selected</AlertTitle>
                    <AlertDescription>
                        You have {cart.items.length} course{cart.items.length > 1 ? "s" : ""} in your cart. Complete your profile to
                        proceed to pricing and payment.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                <DyraneCard>
                    <CardHeader>
                        <CardTitle>{isOnboarding ? "Complete Your Profile" : "Profile Information"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="mt-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                                {user.role}
                            </div>
                        </div>

                        <Form {...form}>
                            <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Select your date of birth</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {isOnboarding && <FormDescription>Required for onboarding</FormDescription>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="classId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class/Course</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((classItem) => (
                                                        <SelectItem key={classItem.id} value={classItem.id}>
                                                            {classItem.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isOnboarding && <FormDescription>Required for onboarding</FormDescription>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {isOnboarding && (
                                    <FormField
                                        control={form.control}
                                        name="accountType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Account Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="individual" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Individual - For personal learning and development
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="corporate" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Corporate - For teams and organizations</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="space-y-2">
                                    <FormLabel htmlFor="email">Email</FormLabel>
                                    <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <FormLabel htmlFor="role">Role</FormLabel>
                                    <Input
                                        id="role"
                                        value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        disabled
                                        className="bg-muted capitalize"
                                    />
                                    <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {hasItemsInCart && (
                                <DyraneButton variant="outline" onClick={() => router.push("/cart")} className="w-full sm:w-auto">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    View Selected Courses
                                </DyraneButton>
                            )}

                            {isOnboarding && (
                                <DyraneButton variant="outline" onClick={handleSkipOnboarding} className="w-full sm:w-auto">
                                    Skip for now
                                </DyraneButton>
                            )}
                        </div>

                        <DyraneButton
                            type="submit"
                            form="profile-form"
                            disabled={isSubmitting || !form.formState.isDirty}
                            className="w-full sm:w-auto sm:ml-auto"
                        >
                            {isSubmitting ? "Saving..." : isOnboarding ? "Complete Profile" : "Save Changes"}
                        </DyraneButton>
                    </CardFooter>
                </DyraneCard>
            </div>
        </div>
    )
}
