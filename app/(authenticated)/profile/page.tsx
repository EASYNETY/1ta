"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateUserProfileThunk } from "@/features/auth/store/auth-thunks"
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { Form } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { GraduationCap } from "lucide-react"

// Import modular components
import { ProfileAlerts } from "@/components/profile/ProfileAlerts"
import { ProfileAvatarInfo } from "@/components/profile/ProfileAvatarInfo"
import { ProfileFormFields } from "@/components/profile/ProfileFormFields"
import { CorporateManagerFields } from "@/components/profile/CorporateManagerFields"
import { isStudent } from "@/types/user.types"

// Define schema here or import from shared location
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }).optional(),
    classId: z.string().optional(),
    accountType: z.enum(["individual", "institutional"]),
    bio: z.string().optional(),
    phone: z.string().optional(),
    // Corporate manager fields
    companyName: z.string().optional(),
    studentCount: z.number().positive().optional(),
    selectedCourses: z.array(z.string()).optional(),
    isCorporateRegistration: z.boolean().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, skipOnboarding } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart?.items ?? [])
    const allCourses = useAppSelector((state) => state.auth_courses?.courses ?? [])
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOnboarding, setIsOnboarding] = useState(false)
    const [isCorporateManager, setIsCorporateManager] = useState(false)

    // Determine if onboarding is needed
    useEffect(() => {
        if (user && !skipOnboarding) {
            setIsOnboarding(!isProfileComplete(user))
            // Only set isCorporateManager if user is a student
            if (isStudent(user)) {
                setIsCorporateManager(user.isCorporateManager === true)
            } else {
                setIsCorporateManager(false)
            }
        } else {
            setIsOnboarding(false)
            setIsCorporateManager(false)
        }
    }, [user, skipOnboarding])

    // Prepare course options for the select dropdown
    const courseOptions = useMemo(
        () =>
            allCourses.map((course) => ({
                id: course.id,
                name: course.title || course.slug || `Course ${course.id}`,
            })),
        [allCourses],
    )

    const hasItemsInCart = cartItems.length > 0

    // Function to determine the default course ID
    const determineDefaultCourseId = useCallback(() => {
        // Only access student-specific properties if user is a student
        if (user && isStudent(user)) {
            // For corporate students, use the pre-assigned course
            if (user.corporateId && !user.isCorporateManager && user.classId) {
                return user.classId
            }

            // Check if user is already enrolled in a course
            if (user.classId && courseOptions.some((c) => c.id === user.classId)) {
                return user.classId
            }
        }

        // For new signups with items in cart
        if (isOnboarding && hasItemsInCart && cartItems[0]?.courseId) {
            return cartItems[0].courseId
        }

        // Fallback if only one course option exists
        if (courseOptions.length === 1) {
            return courseOptions[0].id
        }

        return ""
    }, [isOnboarding, hasItemsInCart, cartItems, user, courseOptions])

    // Initialize the form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            dateOfBirth: undefined,
            classId: "",
            accountType: "individual",
            bio: user?.bio || "",
            phone: user?.phone || "",
            isCorporateRegistration: false,
        },
        mode: "onBlur",
    })

    // Effect to set form values once user data is available
    useEffect(() => {
        if (user) {
            const defaultCourseId = determineDefaultCourseId()
            const formValues: Partial<ProfileFormValues> = {
                name: user.name || "",
                bio: user.bio || "",
                phone: user.phone || "",
                classId: defaultCourseId,
                accountType: "individual", // Default value
            }

            // Only set student-specific fields if user is a student
            if (isStudent(user)) {
                formValues.dateOfBirth = user.dateOfBirth ? new Date(user.dateOfBirth) : undefined
                formValues.companyName = user.corporateId || ""
                formValues.isCorporateRegistration = user.isCorporateManager === true

                // Set account type based on corporateId
                if (user.corporateId) {
                    formValues.accountType = "institutional"
                }
            }

            form.reset(formValues)
        }
    }, [user, form, determineDefaultCourseId])

    // Loading state
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        )
    }

    // Form submission handler
    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return
        setIsSubmitting(true)

        try {
            let formattedData: any = {
                ...data,
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
                onboardingStatus: "complete" as const,
            }

            // Handle corporate manager registration
            if (data.isCorporateRegistration) {
                formattedData = {
                    ...formattedData,
                    isCorporateManager: true,
                    corporateId: data.companyName,
                    // Additional corporate manager fields would be processed here
                }

                // Here you would call an API to generate student slots
                // This is where you'd create the corporate student accounts
                if (data.studentCount && data.selectedCourses?.length) {
                    try {
                        // Mock API call - replace with actual implementation
                        console.log("Creating corporate student slots:", {
                            corporateId: data.companyName,
                            studentCount: data.studentCount,
                            courses: data.selectedCourses,
                        })

                        // You would dispatch an action here to create the student slots
                        // dispatch(createCorporateStudentSlotsThunk({
                        //   corporateId: data.companyName,
                        //   studentCount: data.studentCount,
                        //   courses: data.selectedCourses,
                        // }));

                        toast({
                            title: "Corporate Registration Successful",
                            description: `Created ${data.studentCount} student slots for your organization.`,
                            variant: "success",
                        })
                    } catch (error) {
                        toast({
                            title: "Error Creating Student Slots",
                            description: "Failed to create student accounts. Please try again.",
                            variant: "destructive",
                        })
                    }
                }
            }

            // For corporate students, ensure they can't change certain fields
            if (isStudent(user) && user.corporateId && !user.isCorporateManager) {
                // Preserve the corporate ID and pre-assigned course
                formattedData.corporateId = user.corporateId
                if (user.classId) {
                    formattedData.classId = user.classId
                }
            }

            // Remove undefined dateOfBirth if it wasn't provided
            if (!formattedData.dateOfBirth) delete formattedData.dateOfBirth

            await dispatch(updateUserProfileThunk(formattedData)).unwrap()

            toast({
                title: isOnboarding ? "Onboarding Complete" : "Profile Updated",
                description: isOnboarding ? "Welcome! Your profile is set up." : "Your details have been saved.",
                variant: "success",
            })

            // Mark onboarding as locally complete *after* successful submission
            if (isOnboarding) {
                dispatch(skipOnboardingProcess())
            }

            // Redirect logic
            if (isOnboarding && data.isCorporateRegistration) {
                router.push("/corporate-management") // Redirect corporate managers to their dashboard
            } else if (isOnboarding && hasItemsInCart) {
                router.push(`/pricing?type=${data.accountType}`) // Redirect to pricing/checkout
            } else if (isOnboarding) {
                router.push("/dashboard") // Redirect to dashboard if onboarding is done
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
            toast({ title: "Update Error", description: errorMessage, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Skip onboarding handler
    const handleSkipOnboarding = () => {
        dispatch(skipOnboardingProcess())
        toast({ title: "Onboarding Skipped", description: "You can complete your profile later." })
        router.push("/dashboard")
    }

    // Determine if the user is a corporate student (has corporateId but is not a manager)
    const isCorporateStudent = isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager

    return (
        <div className="mx-auto space-y-6">
            <h1 className="text-3xl font-bold">
                {isOnboarding ? "Complete Your Profile" : "My Profile"}
                {isCorporateStudent && " (Corporate Student)"}
                {isCorporateManager && " (Corporate Manager)"}
            </h1>

            <ProfileAlerts
                isOnboarding={isOnboarding}
                hasItemsInCart={hasItemsInCart}
                cartItemCount={cartItems.length}
                isCorporateStudent={isCorporateStudent}
                isCorporateManager={isCorporateManager}
            />

            <Card className="bg-card/5 backdrop-blur-sm border-primary/10 shadow-lg">
                <CardHeader>
                    {isCorporateStudent && isStudent(user) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                You are registered as part of <strong>{user.corporateId}</strong> organization. Some fields may be
                                pre-assigned and cannot be changed.
                            </p>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <ProfileAvatarInfo user={user} />

                    <Form {...form}>
                        <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
                            {/* Show corporate manager fields if applicable */}
                            {form.watch("isCorporateRegistration") && <CorporateManagerFields form={form} courses={courseOptions} />}

                            {/* Standard profile fields */}
                            <ProfileFormFields
                                form={form}
                                courses={courseOptions}
                                userRole={user.role}
                                userEmail={user.email}
                                isOnboarding={isOnboarding}
                                isCorporateStudent={isCorporateStudent}
                                isCorporateManager={isCorporateManager}
                            />
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {hasItemsInCart && !isOnboarding && (
                            <DyraneButton variant="outline" onClick={() => router.push("/checkout")} className="w-full sm:w-auto">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                View Cart ({cartItems.length})
                            </DyraneButton>
                        )}
                        {isOnboarding && !isCorporateStudent && (
                            <DyraneButton
                                variant="outline"
                                onClick={handleSkipOnboarding}
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                Skip for now
                            </DyraneButton>
                        )}
                    </div>

                    <DyraneButton
                        type="submit"
                        form="profile-form"
                        disabled={isSubmitting || (!form.formState.isDirty && !isOnboarding)}
                        className="w-full sm:w-auto sm:ml-auto"
                    >
                        {isSubmitting ? "Saving..." : isOnboarding ? "Complete Profile" : "Save Changes"}
                    </DyraneButton>
                </CardFooter>
            </Card>
        </div>
    )
}
