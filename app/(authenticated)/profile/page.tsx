// app/(authenticated)/profile/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUserProfileThunk } from "@/features/auth/store/auth-thunks";
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card
import { useToast } from "@/hooks/use-toast";
import { isProfileComplete } from "@/features/auth/utils/profile-completeness";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react"; // Changed icon import

// Import modular components
import { ProfileAlerts } from "@/components/profile/ProfileAlerts";
import { ProfileAvatarInfo } from "@/components/profile/ProfileAvatarInfo";
import { ProfileFormFields } from "@/components/profile/ProfileFormFields";
import { User } from "@/types/user.types";

// Define schema here or import from shared location
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    classId: z.string().nonempty("Please select a class/course"), // Made non-empty
    accountType: z.enum(["individual", "institutional"]),
    bio: z.string().optional(),
    phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, skipOnboarding } = useAppSelector((state) => state.auth); // Ensure user is null-safe
    // Use optional chaining and nullish coalescing for safety
    const cartItems = useAppSelector((state) => state.cart?.items ?? []);
    const allCourses = useAppSelector((state) => state.auth_courses?.courses ?? []);
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);

    // Determine if onboarding is needed
    useEffect(() => {
        if (user && !skipOnboarding) { // Check skipOnboarding flag
            setIsOnboarding(!isProfileComplete(user));
        } else {
            setIsOnboarding(false); // Not onboarding if skipped or no user
        }
    }, [user, skipOnboarding]);

    // Prepare course options for the select dropdown
    const courseOptions = useMemo(() => allCourses.map(course => ({
        id: course.id,
        // Use course title for display, ensure it's available
        name: course.title || course.slug || `Course ${course.id}`,
    })), [allCourses]);

    const hasItemsInCart = cartItems.length > 0;

    // Function to determine the default course ID
    const determineDefaultCourseId = useCallback(() => {
        if (isOnboarding && hasItemsInCart && cartItems[0]?.courseId) {
            return cartItems[0].courseId;
        }
        // Check if user is already enrolled in a course
        if (user?.classId && courseOptions.some(c => c.id === user.classId)) {
            return user.classId;
        }
        // Fallback if only one course option exists (e.g., fetched enrolled courses)
        if (courseOptions.length === 1) {
            return courseOptions[0].id;
        }
        return ""; // No default otherwise
    }, [isOnboarding, hasItemsInCart, cartItems, user?.classId, courseOptions]);

    // Initialize the form
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        // Default values set dynamically in useEffect
        defaultValues: {
            name: user?.name || "",
            // Use undefined initially for date if not set, DatePicker handles placeholder
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
            classId: "", // Will be set in useEffect
            accountType: "individual", // Default
            // @ts-ignore
            bio: user?.bio || "",
             // @ts-ignore
            phoneNumber: user?.phoneNumber || "",
        },
        mode: "onBlur", // Or "onChange"
    });

    // Effect to set form values once user data is available
    useEffect(() => {
        if (user) {
            const defaultCourseId = determineDefaultCourseId();
            form.reset({ // Use reset to update all default values based on user
                name: user.name || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
                classId: defaultCourseId,
                accountType: user.accountType || "individual", // Use existing or default
                 // @ts-ignore
                bio: user.bio || "",
                 // @ts-ignore
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user, form, determineDefaultCourseId]); // form.reset is stable

    // Loading state
    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                {/* Simple loading indicator */}
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Form submission handler
    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const formattedData = {
                ...data,
                // Ensure date is correctly formatted, handle potential undefined
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
                onboardingStatus: "complete" as const, // Mark onboarding complete on successful submit
            };
            // Remove undefined dateOfBirth if it wasn't provided
            if (!formattedData.dateOfBirth) delete formattedData.dateOfBirth;

            await dispatch(updateUserProfileThunk(formattedData)).unwrap();

            toast({
                title: isOnboarding ? "Onboarding Complete" : "Profile Updated",
                description: isOnboarding ? "Welcome! Your profile is set up." : "Your details have been saved.",
                variant: "success",
            });

            // Mark onboarding as locally complete *after* successful submission
            if (isOnboarding) {
                dispatch(skipOnboardingProcess()); // Use the skip action to prevent loop
            }

            // Redirect logic
            if (isOnboarding && hasItemsInCart) {
                router.push(`/pricing?type=${data.accountType}`); // Redirect to pricing/checkout
            } else if (isOnboarding) {
                router.push("/dashboard"); // Redirect to dashboard if onboarding is done
            }
            // No redirect needed if just updating profile

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
            toast({ title: "Update Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Skip onboarding handler
    const handleSkipOnboarding = () => {
        dispatch(skipOnboardingProcess());
        toast({ title: "Onboarding Skipped", description: "You can complete your profile later." });
        router.push("/dashboard"); // Redirect after skipping
    };

    return (
        // Rely on parent layout for padding
        <div className="mx-auto space-y-6">
            <h1 className="text-3xl font-bold">{isOnboarding ? "Complete Your Profile" : "My Profile"}</h1>

            <ProfileAlerts
                isOnboarding={isOnboarding}
                hasItemsInCart={hasItemsInCart}
                cartItemCount={cartItems.length}
            />

            {/* Main Profile Card */}
            <Card className="bg-card/5 backdrop-blur-sm border-primary/10 shadow-lg"> {/* Adjusted styling */}
                <CardHeader>
                    {/* Avatar and basic info moved inside CardContent */}
                </CardHeader>
                <CardContent>
                    <ProfileAvatarInfo user={user as User} />

                    {/* Form Component */}
                    <Form {...form}>
                        <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
                            {/* Pass necessary props to the fields component */}
                            <ProfileFormFields
                                form={form}
                                courses={courseOptions}
                                userRole={user.role}
                                userEmail={user.email}
                                isOnboarding={isOnboarding}
                            />
                            {/* Form submission button is now outside ProfileFormFields, in CardFooter */}
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-6"> {/* Added pt-6 */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {hasItemsInCart && !isOnboarding && ( // Show only if NOT onboarding
                            <DyraneButton variant="outline" onClick={() => router.push("/checkout")} className="w-full sm:w-auto">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                View Cart ({cartItems.length})
                            </DyraneButton>
                        )}
                        {isOnboarding && (
                            <DyraneButton variant="outline" onClick={handleSkipOnboarding} className="w-full sm:w-auto" disabled={isSubmitting}>
                                Skip for now
                            </DyraneButton>
                        )}
                    </div>

                    <DyraneButton
                        type="submit"
                        form="profile-form" // Link button to the form
                        disabled={isSubmitting || (!form.formState.isDirty && !isOnboarding)} // Disable if not dirty unless onboarding
                        className="w-full sm:w-auto sm:ml-auto" // Ensure button aligns right on larger screens
                    >
                        {isSubmitting ? "Saving..." : isOnboarding ? "Complete Profile" : "Save Changes"}
                    </DyraneButton>
                </CardFooter>
            </Card>
        </div>
    );
}