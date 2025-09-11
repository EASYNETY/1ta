// app/(authenticated)/profile/page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateUserProfileThunk, createCorporateStudentSlotsThunk } from "@/features/auth/store/auth-thunks"
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice"
import { fetchCourses } from "@/features/public-course/store/public-course-slice"
import { fetchClassById } from "@/features/classes/store/classes-thunks"
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
import { BarcodeDialog } from "@/components/tools/BarcodeDialog"

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
    isCorporateRegistration: z.preprocess(
        (val) => {
            // Attempt to convert common numeric representations (0 or 1) to boolean.
            // This handles cases where a UI component might incorrectly send a number.
            if (typeof val === 'number') {
                return val === 1;
            }
            // Also handle string "true" or "false" just in case, though less likely for this error
            if (typeof val === 'string') {
                if (val.toLowerCase() === 'true') return true;
                if (val.toLowerCase() === 'false') return false;
            }
            // Pass through other values (already boolean, undefined, null) for Zod to handle.
            return val;
        },
        z.boolean().optional() // The underlying type is still an optional boolean.
    ),
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
            if (isStudent(user)) {
                setIsCorporateManager(user.isCorporateManager === true) // Ensures boolean
            } else {
                setIsCorporateManager(false)
            }
        } else {
            setIsOnboarding(false)
            setIsCorporateManager(false)
        }
        setIsInitialized(true)
    }, [user, skipOnboarding])

    const courseOptions = useMemo(() => {
        const authCourseOptions = allCourses.map((course) => ({
            id: course.id,
            name: course.title || course.slug || `Course ${course.id}`,
        }));
        const publicCourseOptions = publicCourses.map((course) => ({
            id: course.id,
            name: course.title || course.slug || `Course ${course.id}`,
        }));
        const combinedOptions = [...authCourseOptions];
        publicCourseOptions.forEach(option => {
            if (!combinedOptions.some(existing => existing.id === option.id)) {
                combinedOptions.push(option);
            }
        });
        return combinedOptions;
    }, [allCourses, publicCourses])

    const currentClass = useAppSelector(state => state.classes.currentClass);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: useMemo(() => ({
            name: "",
            address: "",
            dateOfBirth: undefined,
            classId: "",
            accountType: "individual",
            bio: "",
            phone: "",
            subjects: [],
            officeHours: "",
            isCorporateRegistration: false, // Initialized as boolean
            companyName: "",
            initialStudentCount: undefined,
            initialSelectedCourses: [],
            purchasedStudentSlots: 0,
        }), []),
        mode: "onBlur",
    })

    const hasItemsInCart = cartItems.length > 0

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "classId" && value.classId) {
                dispatch(fetchClassById(value.classId));
            }
        });
        return () => subscription.unsubscribe();
    }, [form, dispatch]);

    const determineDefaultCourseId = useCallback(() => {
        if (user && isStudent(user)) {
            if (user.corporateId && !user.isCorporateManager && user.classId) {
                return user.classId
            }
            if (user.classId && courseOptions.some((c) => c.id === user.classId)) {
                return user.classId
            }
        }
        if (isOnboarding && hasItemsInCart && cartItems[0]?.courseId) {
            return cartItems[0]?.courseId
        }
        if (courseOptions.length === 1) {
            return courseOptions[0].id
        }
        return ""
    }, [isOnboarding, hasItemsInCart, cartItems, user, courseOptions])

    useEffect(() => {
        if (user && isInitialized) {
            const defaultCourseId = determineDefaultCourseId()
            const formValues: ProfileFormValues = {
                name: user.name || "",
                address: isStudent(user) ? user.address || "" : "",
                bio: user.bio || "",
                phone: user.phone || "",
                accountType: user.accountType || "individual",
                // Ensure this is explicitly boolean
                isCorporateRegistration: isStudent(user) ? user.isCorporateManager === true : false,
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
                const teacherUser = user as TeacherUser;
                formValues.subjects = teacherUser.subjects || []
                formValues.officeHours = teacherUser.officeHours || ""
            }
            form.reset(formValues, { keepDefaultValues: false })
        }
    }, [user, form, determineDefaultCourseId, isInitialized])

    const onFormInvalid = (errors: FieldErrors<ProfileFormValues>) => {
        console.error("Form validation failed (Zod resolver):", errors);
        // Check if the specific error for isCorporateRegistration is present
        let description = "Please correct the errors highlighted in the form fields before submitting.";
        if (errors.isCorporateRegistration) {
            description = `There's an issue with the 'Corporate Registration' field: ${errors.isCorporateRegistration.message}. Please check its value.`;
        }
        toast({
            title: "Invalid Form Data",
            description: description,
            variant: "destructive",
        });
    };

    const handleSubmit = async (data: ProfileFormValues) => {
        if (!user) {
            toast({ title: "Error", description: "User session not found. Please log in again.", variant: "destructive" })
            router.push("/login")
            return
        }

        let isValid = true;
        form.clearErrors([
            "companyName",
            "initialStudentCount",
            "initialSelectedCourses",
            "dateOfBirth",
            "classId",
            "subjects",
            "name"
        ]);

        if (isOnboarding) {
            if (data.isCorporateRegistration) { // This data.isCorporateRegistration should now be a proper boolean due to preprocess
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
            } else if (user.role === "student" && !data.isCorporateRegistration) {
                if (!data.dateOfBirth) {
                    form.setError("dateOfBirth", { type: "manual", message: "Date of birth is required." })
                    isValid = false
                }
                if (!data.classId || data.classId.trim() === "") {
                    form.setError("classId", { type: "manual", message: "Please select your course." })
                    isValid = false
                }
            } else if (user.role === "teacher") {
                if (!data.subjects || data.subjects.length === 0) {
                    form.setError("subjects", { type: "manual", message: "Please enter at least one subject." })
                    isValid = false
                }
            }
        }
        if (!data.name || data.name.trim().length < 2) {
            form.setError("name", { type: "manual", message: "Name is required (min 2 chars)." });
            isValid = false;
        }

        if (!isValid) {
            toast({
                title: "Action Required",
                description: "Please correct the issues highlighted in the form and try again.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true)
        let corporateIdForAction: string | undefined
        let corporateActionNeeded = false

        try {
            let updatePayload: Partial<User> = {
                name: data.name,
                bio: data.bio || undefined,
                phone: data.phone || undefined,
            }

            if (isStudent(user) || (isOnboarding && !data.isCorporateRegistration)) {
                const studentPayload = updatePayload as Partial<StudentUser>
                studentPayload.address = data.address || undefined
                if (data.dateOfBirth) {
                    studentPayload.dateOfBirth = data.dateOfBirth.toISOString()
                }
                if (!isStudent(user) || !(user.corporateId && !user.isCorporateManager)) {
                    studentPayload.classId = data.classId || undefined
                }
                if (isOnboarding && data.isCorporateRegistration) {
                    studentPayload.isCorporateManager = true // Will be boolean
                    studentPayload.corporateId = data.companyName
                    studentPayload.accountType = "corporate"
                    studentPayload.onboardingStatus = "complete"
                    delete studentPayload.classId
                    delete studentPayload.dateOfBirth
                    corporateIdForAction = data.companyName || ""
                    if (data.initialStudentCount && data.initialSelectedCourses?.length) {
                        corporateActionNeeded = true
                        studentPayload.purchasedStudentSlots = data.initialStudentCount
                    }
                }
                else if (isStudent(user) && user.isCorporateManager) {
                    if (data.initialStudentCount && data.initialStudentCount > 0 && data.initialSelectedCourses?.length) {
                        const currentSlots = user.purchasedStudentSlots || 0
                        studentPayload.purchasedStudentSlots = currentSlots + data.initialStudentCount
                        corporateActionNeeded = true
                        corporateIdForAction = user.corporateId || ""
                    }
                }
                else if (isOnboarding) {
                    updatePayload.onboardingStatus = "complete"
                }
                updatePayload = studentPayload
            } else if (user.role === "teacher") {
                const teacherPayload = updatePayload as Partial<TeacherUser>
                teacherPayload.subjects = data.subjects || []
                teacherPayload.officeHours = data.officeHours || undefined
                if (isOnboarding) {
                    teacherPayload.onboardingStatus = "complete"
                }
                updatePayload = teacherPayload
            } else if (isOnboarding) {
                updatePayload.onboardingStatus = "complete"
            }

            await dispatch(updateUserProfileThunk(updatePayload)).unwrap()
            toast({ title: isOnboarding ? "Profile Complete!" : "Profile Updated", variant: "success" })

            if (corporateActionNeeded && corporateIdForAction && data.initialStudentCount && data.initialSelectedCourses && data.initialSelectedCourses.length > 0) {
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
                    if (isStudent(user) && user.isCorporateManager) {
                        form.reset({
                            ...form.getValues(),
                            initialStudentCount: undefined,
                            initialSelectedCourses: [],
                        });
                    }
                } catch (slotError: any) {
                    toast({
                        title: "Error Creating Student Slots",
                        description: slotError.message || "Failed to create student slots.",
                        variant: "destructive",
                    })
                }
            }

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
            console.error("Profile update error:", error)
            const errorMessage = error?.message || error || "Failed to update profile"
            toast({ title: "Update Error", description: errorMessage, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkipOnboarding = () => {
        dispatch(skipOnboardingProcess())
        toast({ title: "Onboarding Skipped", description: "You can complete your profile later." })
        router.push("/dashboard")
    }

    const isCorporateStudent = isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager
    const isCorporateManagerView = isStudent(user) && user.isCorporateManager // Now consistently reflects the *user's* status

    if (!user || !isInitialized) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Determine if the form should show Corporate Manager fields based on form state or user's actual role
    const showCorporateManagerFields = (isOnboarding && form.watch("isCorporateRegistration")) || isCorporateManagerView;


    return (
        <div className="mx-auto space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-4">
                {isOnboarding ? "Complete Your Profile" : "My Profile"}
                {isCorporateStudent && " (Corporate Student)"}
                {isCorporateManagerView && " (Corporate Manager)"}
                {isStudent(user) && user.barcodeId && (
                    <BarcodeDialog barcodeId={user.barcodeId} userId={user.id} triggerLabel="View Barcode" />
                )}
            </h1>

            <ProfileAlerts
                isOnboarding={isOnboarding}
                hasItemsInCart={hasItemsInCart}
                cartItemCount={cartItems.length}
                isCorporateStudent={isCorporateStudent}
                isCorporateManager={isCorporateManagerView}
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
                    {currentClass && (
                        <div className={`p-3 rounded-md mb-4 text-sm font-semibold ${currentClass.availableSlots && currentClass.availableSlots > 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                            {currentClass.availableSlots && currentClass.availableSlots > 0 ? (
                                <>Slots Available for {currentClass.name || 'selected course'}: {currentClass.availableSlots} / {currentClass.maxSlots}</>
                            ) : (
                                <>No slots currently available for {currentClass.name || 'selected course'}.</>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <ProfileAvatarInfo
                        user={user}
                        onAvatarChange={(url) => {
                            if (user) {
                                dispatch(updateUserProfileThunk({ avatarUrl: url }))
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
                        <form id="profile-form" onSubmit={form.handleSubmit(handleSubmit, onFormInvalid)} className="mt-6">
                            {showCorporateManagerFields ? (
                                <CorporateManagerFields
                                    form={form}
                                    courses={courseOptions}
                                    purchasedStudentSlots={isStudent(user) ? user.purchasedStudentSlots : 0}
                                    isExistingManager={isCorporateManagerView}
                                />
                            ) : null}

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
                        disabled={isSubmitting || (!form.formState.isDirty && !isOnboarding && !isCorporateManagerView && !(isCorporateManagerView && (form.getValues().initialStudentCount || 0) > 0))}
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
