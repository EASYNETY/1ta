// app/(authenticated)/profile/page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateUserProfileThunk, createCorporateStudentSlotsThunk } from "@/features/auth/store/auth-thunks"
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice"
import { fetchCourses } from "@/features/public-course/store/public-course-slice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { Form } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { GraduationCap, Loader2 } from "lucide-react"

// Import modular components
import { ProfileAlerts } from "@/components/profile/ProfileAlerts"
import { ProfileAvatarInfo } from "@/components/profile/ProfileAvatarInfo"
import { ProfileFormFields } from "@/components/profile/ProfileFormFields"
import { CorporateManagerFields } from "@/components/profile/CorporateManagerFields"
import { isStudent } from "@/types/user.types"
import type { User, StudentUser, TeacherUser } from "@/types/user.types"

// Define schema here or import from shared location
const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
    classId: z.string().optional(),
    accountType: z.enum(["individual", "corporate", "institutional"]).default("individual"),
    bio: z.string().optional(),
    phone: z.string().optional(),
    // Teacher specific fields
    subjects: z.array(z.string()).optional().nullable(),
    officeHours: z.string().optional(),
    // Corporate Onboarding Specific Fields
    isCorporateRegistration: z.boolean().optional(),
    companyName: z.string().optional(),
    initialStudentCount: z.preprocess(
        (val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val)),
        z.number().positive("Must be > 0").int("Must be a whole number").optional(),
    ),
    initialSelectedCourses: z.array(z.string()).optional(),
    purchasedStudentSlots: z.number().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, skipOnboarding } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart?.items ?? [])
    const allCourses = useAppSelector((state) => state.auth_courses?.courses ?? [])
    const publicCourses = useAppSelector((state) => state.public_courses?.allCourses ?? [])
    const publicCoursesStatus = useAppSelector((state) => state.public_courses?.status)
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOnboarding, setIsOnboarding] = useState(false)
    const [isCorporateManager, setIsCorporateManager] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // Fetch public courses if not already loaded
    useEffect(() => {
        if (publicCoursesStatus === "idle") {
            dispatch(fetchCourses())
        }
    }, [publicCoursesStatus, dispatch])

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
        setIsInitialized(true)
    }, [user, skipOnboarding])

    // Prepare course options for the select dropdown, combining auth courses and public courses
    const courseOptions = useMemo(() => {
        // Get courses from auth_courses
        const authCourseOptions = allCourses.map((course) => ({
            id: course.id,
            name: course.title || course.slug || `Course ${course.id}`,
        }));

        // Get courses from public_courses
        const publicCourseOptions = publicCourses.map((course) => ({
            id: course.id,
            name: course.title || course.slug || `Course ${course.id}`,
        }));

        // Combine both arrays and remove duplicates based on id
        const combinedOptions = [...authCourseOptions];

        // Add public courses that aren't already in the auth courses
        publicCourseOptions.forEach(option => {
            if (!combinedOptions.some(existing => existing.id === option.id)) {
                combinedOptions.push(option);
            }
        });

        return combinedOptions;
    }, [allCourses, publicCourses])

    const hasItemsInCart = cartItems.length > 0

    // Function to determine the default course ID
    const determineDefaultCourseId = useCallback(() => {
        // Only access student-specific properties if user is a student
        if (user && isStudent(user)) {
            // For corporate students, use the pre-assigned course
            if (user.corporateId && !user.isCorporateManager && user.classId) {
                return user.classId
            }

            // Check if user is already enroled in a course
            if (user.classId && courseOptions.some((c) => c.id === user.classId)) {
                return user.classId
            }
        }

        // For new signups with items in cart
        if (isOnboarding && hasItemsInCart && cartItems[0]?.courseId) {
            return cartItems[0]?.courseId
        }

        // Fallback if only one course option exists
        if (courseOptions.length === 1) {
            return courseOptions[0].id
        }

        return ""
    }, [isOnboarding, hasItemsInCart, cartItems, user, courseOptions])

    // Initialize the form with more flexible defaults that match what we'll set later
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any, // Use type assertion to avoid resolver type conflicts
        defaultValues: useMemo(() => {
            // Return empty defaults initially
            return {
                name: "",
                address: "",
                dateOfBirth: undefined,
                classId: "",
                accountType: "individual",
                bio: "",
                phone: "",
                subjects: [],
                officeHours: "",
                isCorporateRegistration: false,
                companyName: "",
                initialStudentCount: undefined,
                initialSelectedCourses: [],
                purchasedStudentSlots: 0,
            }
        }, []), // Empty dependency array means this only runs once
        mode: "onBlur",
    })

    // Effect to set form values once user data is available
    useEffect(() => {
        if (user && isInitialized) {
            const defaultCourseId = determineDefaultCourseId()

            // Create form values based on user data
            const formValues: ProfileFormValues = {
                name: user.name || "",
                address: isStudent(user) ? user.address || "" : "",
                bio: user.bio || "",
                phone: user.phone || "",
                accountType: user.accountType || "individual",
                isCorporateRegistration: isStudent(user) ? user.isCorporateManager : false,
                companyName: isStudent(user) ? user.corporateId || "" : "",
                initialStudentCount: undefined,
                initialSelectedCourses: [],
                purchasedStudentSlots: isStudent(user) ? user.purchasedStudentSlots || 0 : 0,
                classId: defaultCourseId,
                dateOfBirth: undefined,
                subjects: [],
                officeHours: "",
            }

            if (isStudent(user)) {
                formValues.dateOfBirth = user.dateOfBirth ? new Date(user.dateOfBirth) : undefined
            } else if (user.role === "teacher") {
                formValues.subjects = user.subjects || []
                formValues.officeHours = user.officeHours || ""
            }

            // Reset the form with the user data
            form.reset(formValues, {
                keepDefaultValues: false, // Don't keep the initial default values
            })
        }
    }, [user, form, determineDefaultCourseId, isInitialized])

    // Loading state
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        )
    }

    // Form submission handler
    const handleSubmit = async (data: ProfileFormValues) => {
        if (!user) {
            toast({ title: "Error", description: "User session not found. Please log in again.", variant: "destructive" })
            router.push("/login")
            return
        }

        // --- Contextual Validation ---
        let isValid = true
        form.clearErrors()

        if (isOnboarding) {
            if (data.isCorporateRegistration) {
                // Corporate Manager Onboarding Validation
                if (!data.companyName || data.companyName.trim().length < 2) {
                    form.setError("companyName", { type: "manual", message: "Company name is required." })
                    isValid = false
                }
                if (data.initialStudentCount || (data.initialSelectedCourses && data.initialSelectedCourses.length > 0)) {
                    if (data.initialStudentCount === undefined || data.initialStudentCount <= 0) {
                        form.setError("initialStudentCount", { type: "manual", message: "Number of students required (>0)." })
                        isValid = false
                    }
                    if (!data.initialSelectedCourses || data.initialSelectedCourses.length === 0) {
                        form.setError("initialSelectedCourses", { type: "manual", message: "Select course(s)." })
                        isValid = false
                    }
                }
            } else if (user.role === "student") {
                // Individual Student Onboarding Validation
                if (!data.dateOfBirth) {
                    form.setError("dateOfBirth", { type: "manual", message: "Date of birth is required." })
                    isValid = false
                }
                if (!data.classId || data.classId.trim() === "") {
                    form.setError("classId", { type: "manual", message: "Please select your course." })
                    isValid = false
                }
            } else if (user.role === "teacher") {
                // Teacher Onboarding Validation
                if (!data.subjects || data.subjects.length === 0) {
                    form.setError("subjects", { type: "manual", message: "Please enter at least one subject." })
                    isValid = false
                }
            }
        }
        if (!data.name || data.name.trim().length < 2) {
            form.setError("name", { type: "manual", message: "Name is required (min 2 chars)." })
            isValid = false
        }

        if (!isValid) {
            toast({ title: "Validation Error", description: "Please fix errors.", variant: "destructive" })
            return
        }
        // --- End Contextual Validation ---

        setIsSubmitting(true)
        let corporateIdForAction: string | undefined
        let corporateActionNeeded = false

        try {
            // Define payload type with proper type casting for student-specific fields
            let updatePayload: Partial<User> = {
                // Base fields always included
                name: data.name,
                bio: data.bio || undefined,
                phone: data.phone || undefined,
            }

            // Create a separate student-specific payload if needed
            if (isStudent(user) || (isOnboarding && !data.isCorporateRegistration)) {
                // Cast to StudentUser for student-specific properties
                const studentPayload = updatePayload as Partial<StudentUser>

                // Add address only for students
                studentPayload.address = data.address || undefined

                if (data.dateOfBirth) {
                    studentPayload.dateOfBirth = data.dateOfBirth.toISOString()
                }

                if (!isStudent(user) || !(user.corporateId && !user.isCorporateManager)) {
                    studentPayload.classId = data.classId || undefined
                }

                // If onboarding as corporate manager
                if (isOnboarding && data.isCorporateRegistration) {
                    studentPayload.isCorporateManager = true
                    studentPayload.corporateId = data.companyName
                    studentPayload.accountType = "corporate"
                    studentPayload.onboardingStatus = "complete"

                    // Remove fields not applicable to manager profile itself
                    delete studentPayload.classId
                    delete studentPayload.dateOfBirth

                    corporateIdForAction = data.companyName || ""

                    if (data.initialStudentCount && data.initialSelectedCourses?.length) {
                        corporateActionNeeded = true
                        // Set initial purchased slots
                        studentPayload.purchasedStudentSlots = data.initialStudentCount
                    }
                }
                // For existing corporate managers, handle student slot updates
                else if (isStudent(user) && user.isCorporateManager) {
                    if (data.initialStudentCount && data.initialStudentCount > 0) {
                        // Add to existing slots
                        const currentSlots = user.purchasedStudentSlots || 0
                        studentPayload.purchasedStudentSlots = currentSlots + data.initialStudentCount

                        corporateActionNeeded = true
                        corporateIdForAction = user.corporateId || ""
                    }
                }
                // Mark complete for other roles/individual students
                else if (isOnboarding) {
                    updatePayload.onboardingStatus = "complete"
                }

                // Use the properly typed payload
                updatePayload = studentPayload
            } else if (user.role === "teacher") {
                // Teacher-specific fields
                // Create a properly typed teacher payload
                const teacherPayload = updatePayload as Partial<TeacherUser>
                teacherPayload.subjects = data.subjects || []
                teacherPayload.officeHours = data.officeHours || undefined

                if (isOnboarding) {
                    teacherPayload.onboardingStatus = "complete"
                }

                // Use the properly typed payload
                updatePayload = teacherPayload
            } else if (isOnboarding) {
                // For non-student roles during onboarding
                updatePayload.onboardingStatus = "complete"
            }

            // --- Dispatch Profile Update ---
            await dispatch(updateUserProfileThunk(updatePayload)).unwrap()
            toast({ title: isOnboarding ? "Profile Complete!" : "Profile Updated", variant: "success" })

            // --- Trigger Corporate Slot Creation ---
            if (corporateActionNeeded && corporateIdForAction && data.initialStudentCount && data.initialSelectedCourses) {
                try {
                    await dispatch(
                        createCorporateStudentSlotsThunk({
                            corporateId: corporateIdForAction,
                            studentCount: data.initialStudentCount,
                            courses: data.initialSelectedCourses,
                        }),
                    ).unwrap()
                    toast({
                        title: "Student Slots Created",
                        description: `Successfully created ${data.initialStudentCount} student slots.`,
                        variant: "success",
                    })
                } catch (slotError: any) {
                    toast({
                        title: "Error Creating Student Slots",
                        description: slotError.message || "Failed to create student slots.",
                        variant: "destructive",
                    })
                }
            }

            // --- Mark onboarding done locally & Redirect ---
            if (isOnboarding) {
                dispatch(skipOnboardingProcess())
                if (data.isCorporateRegistration) {
                    router.push("/corporate-management")
                } else if (hasItemsInCart) {
                    router.push(`/checkout`)
                } else {
                    router.push("/dashboard")
                }
            }
        } catch (error: any) {
            toast({ title: "Update Error", description: error.message || "Failed to update profile", variant: "destructive" })
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
    const isCorporateManagerView = isStudent(user) && user.isCorporateManager

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
                    <ProfileAvatarInfo
                        user={user}
                        onAvatarChange={(url) => {
                            // When avatar URL changes, update the profile
                            if (user) {
                                dispatch(updateUserProfileThunk({
                                    avatarUrl: url
                                }))
                                .unwrap()
                                .then(() => {
                                    toast({
                                        title: "Profile Updated",
                                        description: "Your profile picture has been updated successfully.",
                                        variant: "success",
                                    });
                                })
                                .catch((error) => {
                                    toast({
                                        title: "Update Failed",
                                        description: error.message || "There was a problem updating your profile picture. Please try again.",
                                        variant: "destructive",
                                    });
                                });
                            }
                        }}
                    />

                    <Form {...form}>
                        <form id="profile-form" onSubmit={form.handleSubmit(handleSubmit)} className="mt-6">
                            {/* Show corporate manager fields if applicable */}
                            {(isOnboarding && form.watch("isCorporateRegistration")) || isCorporateManagerView ? (
                                <CorporateManagerFields
                                    form={form}
                                    courses={courseOptions}
                                    purchasedStudentSlots={isStudent(user) ? user.purchasedStudentSlots : 0}
                                    isExistingManager={isCorporateManagerView}
                                />
                            ) : null}

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
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Saving..." : isOnboarding ? "Complete Profile" : "Save Changes"}
                    </DyraneButton>
                </CardFooter>
            </Card>
        </div>
    )
}
