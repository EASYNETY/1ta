// app/(authenticated)/courses/[slug]/edit/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, Frown } from "lucide-react"; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { fetchAuthCourseBySlug, updateAuthCourse } from "@/features/auth-course/store/auth-course-slice";

// Import Schemas and Types
import { courseSchema, LessonFormValues, type CourseFormValues, defaultCourseValues } from "@/lib/schemas/course.schema";


// Import Config (might not be needed if defaults come from fetched data)
// import { defaultModuleValues } from "@/config/course-form-config";

// Import Modular Form Components
import { BasicInfoForm } from "@/components/course-form/BasicInfoForm";
import { CourseDetailsForm } from "@/components/course-form/CourseDetailsForm";
import { CurriculumForm } from "@/components/course-form/CurriculumForm";
import { PricingSettingsForm } from "@/components/course-form/PricingSettingsForm";
import { AuthCourse } from "@/data/mock-auth-course-data";
import { UserRole } from "@/types/user.types";

// Import types
// Define an extended AuthCourse interface that includes the Naira pricing fields
interface ExtendedAuthCourse extends AuthCourse {
    priceNaira?: number;
    discountPriceNaira?: number;
}


// Define a placeholder User type - replace with your actual User type
interface User {
    id: string;
    role: UserRole;
}

// Helper Component for Access Denied Message
const AccessDeniedMessage: React.FC<{ message?: string }> = ({ message }) => (
    <div className="flex h-[50vh] items-center justify-center p-4">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground mt-2">{message || "You don't have permission to edit this course."}</p>
            <DyraneButton asChild className="mt-4">
                <Link href="/courses">Back to Courses</Link>
            </DyraneButton>
        </div>
    </div>
);

// Helper Component for Loading State
const LoadingIndicator: React.FC = () => (
    <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading course data...</p>
    </div>
);

// Helper Component for Error State
const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex h-[50vh] items-center justify-center p-4">
        <div className="text-center text-destructive">
            <Frown className="h-10 w-10 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Error Loading Course</h2>
            <p className="mt-2">{message}</p>
            <DyraneButton asChild variant="outline" className="mt-4">
                <Link href="/courses">Back to Courses</Link>
            </DyraneButton>
        </div>
    </div>
);


// --- Helper Function to Format Fetched Data for the Form ---
// This is the reverse of the processing done in onSubmit
const formatCourseDataForForm = (course: ExtendedAuthCourse): Partial<CourseFormValues> => {

    // Define the valid lesson types for the form schema explicitly
    const validFormLessonTypes: Set<LessonFormValues['type']> = new Set([
        "video", "quiz", "assignment", "text", "download"
    ]);
    // Ensure modules and lessons have the basic structure expected by the form's default empty state
    // (Mainly ensuring optional fields are at least empty strings if needed by schema defaults)
    const formattedModules = course.modules?.map(mod => ({
        // Keep id only if your backend/update logic requires it for PATCH/PUT
        // id: mod.id,
        title: mod.title ?? "",
        description: mod.description ?? "",
        lessons: mod.lessons?.map(les => {
            // --- FIX: Map incoming lesson type to a valid form type ---
            let mappedType: LessonFormValues['type'];
            if (validFormLessonTypes.has(les.type as any)) {
                // If the type from AuthCourse is directly valid in LessonFormValues, use it
                mappedType = les.type as LessonFormValues['type'];
            } else {
                // Otherwise, map unknown/invalid types (like "other") to a default valid type
                console.warn(`Mapping unsupported lesson type "${les.type}" to "text" for lesson "${les.title}"`);
                mappedType = "text"; // Or choose "video" or another default
            }
            // --- End Fix ---

            return {
                // id: les.id, // Keep id only if needed for update logic
                title: les.title ?? "",
                type: mappedType, // Use the mapped type
                duration: les.duration ?? "",
                // Ensure description mapping matches the structure expected by LessonFormValues
                // If LessonFormValues expects `description: string`, use les.description or fallback
                // If AuthLesson structure is different, adjust accordingly.
                // Assuming AuthLesson might have description nested in content:
                description: typeof les.content === 'object' && les.content !== null && 'description' in les.content
                    ? String((les.content as any).description ?? "")
                    : "", // Fallback if description is not in content or content is null/undefined
            };
        }) ?? []
    })) ?? [];

    function parseStringOrArray(value: unknown): string[] {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    }


    return {
        title: course.title ?? "",
        subtitle: course.subtitle ?? "",
        image: course.image ?? "",
        description: course.description ?? "",
        category: course.category ?? "",
        // @ts-ignore
        level: course.level ?? "all levels" as "beginner" | "intermediate" | "advanced" | "all levels",
        available_for_enrolment: course.isAvailableForEnrolment ?? true,
        price: course.priceUSD ?? 0,
        priceNaira: course.priceNaira ?? 0,
        discountPrice: course.discountPriceUSD,
        discountPriceNaira: course.discountPriceNaira,
        language: course.language ?? "English",
        certificate: course.certificate ?? true,
        accessType: course.accessType ?? "Lifetime",
        supportType: course.supportType ?? "Both",
        tags: parseStringOrArray(course.tags).join(", "),
        learningOutcomes: parseStringOrArray(course.learningOutcomes).join("\n"),
        prerequisites: parseStringOrArray(course.prerequisites).join("\n"),
        modules: formattedModules,
    };
};


// --- Main Edit Page Component ---
export default function EditCoursePage() {
    const { user } = useAppSelector((state) => state.auth as { user: User | null });
    const router = useRouter();
    const params = useParams(); // Get route parameters
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    const [courseData, setCourseData] = useState<ExtendedAuthCourse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("basic");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const slug = typeof params?.slug === 'string' ? params.slug : null; // Extract slug

    // Form Initialization - Initialized empty, reset after data fetch
    const form = useForm<CourseFormValues>({
        // @ts-ignore - Ignore type mismatch between Zod schema and React Hook Form
        resolver: zodResolver(courseSchema),
        // Use the defaultCourseValues from the schema
        defaultValues: defaultCourseValues,
        mode: "onChange",
    });

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!slug) {
            setError("Course slug not found in URL.");
            setIsLoading(false);
            return;
        }
        if (!user) {
            // Might already be handled by layout, but good practice
            setError("You must be logged in to edit courses.");
            setIsLoading(false);
            return;
        }

        const fetchCourse = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Use the fetchAuthCourseBySlug thunk to get the course data
                const data = await dispatch(fetchAuthCourseBySlug(slug)).unwrap();

                if (!data) {
                    setError(`Course with slug "${slug}" not found.`);
                    setCourseData(null);
                } else {
                    // Basic permission check (Example: only admin or teacher can edit, adjust if needed)
                    if (user.role !== "admin" && user.role !== 'super_admin' && user.role !== "teacher") { // Adjust permission check if needed (e.g., only the specific instructor)
                        setError("You do not have permission to edit this course.");
                        setCourseData(null);
                    } else {
                        setCourseData(data as ExtendedAuthCourse);
                        const formattedData = formatCourseDataForForm(data as ExtendedAuthCourse);
                        form.reset(formattedData); // Reset form with fetched & formatted data
                    }
                }
            } catch (err) {
                console.error("Failed to fetch course data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching course data.");
                setCourseData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [slug, form.reset, user, dispatch]); // Add dispatch to dependency array


    // --- Permissions Check ---
    // Check if user is logged in (might be redundant if layout handles this)
    if (!user) {
        // Redirect to login or show message - depends on app structure
        // For now, show access denied
        return <AccessDeniedMessage message="Please log in to edit courses." />;
    }
    // Check basic role permission (Admin or Teacher can access edit pages in general)
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "teacher") {
        return <AccessDeniedMessage />;
    }
    // More specific permission check is done after data fetch inside useEffect


    const isTeacher = user.role === "teacher";
    // Adjust labels for edit mode
    const submitButtonLabel = isTeacher ? "Request Update" : "Update Course";
    const pageTitle = isTeacher ? "Request Course Update" : "Edit Course";
    const alertTitle = isTeacher ? "Requesting an Update" : "Editing Course";
    const alertDescription = isTeacher
        ? "Modify the details below. Your update request will be reviewed by an administrator."
        : "Update the course details below. Changes will be saved upon submission.";


    // Form submission handler for UPDATE
    const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
        if (!courseData) {
            toast({ title: "Error", description: "Cannot submit, course data not loaded.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        console.log("Form Data Submitted for Update:", data);

        try {
            // Dispatch the updateAuthCourse thunk
            // @ts-ignore - Ignore type mismatch for instructorId
            const result = await dispatch(updateAuthCourse({
                courseSlug: courseData.slug,
                courseData: data
            })).unwrap();

            console.log("Course updated successfully:", result);

            toast({
                title: isTeacher ? "Update Request Submitted" : "Course Updated",
                description: isTeacher
                    ? "Your update request will be reviewed."
                    : "The course has been updated successfully.",
                variant: "success",
            });
            // Redirect to course view page or list page after update
            // router.push(`/courses`); // Redirect to the course view page

        } catch (error) {
            // Error handling remains similar to create page
            console.error("Course update failed:", error);
            if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
                console.error("Validation Errors: ", form.formState.errors);
                toast({ /* ... validation error toast ... */ });
                // (Tab navigation logic remains the same)
                const errorFields = Object.keys(form.formState.errors);
                if (errorFields.some(f => ['title', 'subtitle', 'description', 'category', 'level', 'tags'].includes(f))) setActiveTab('basic');
                else if (errorFields.some(f => ['learningOutcomes', 'prerequisites', 'language', 'certificate', 'accessType', 'supportType'].includes(f))) setActiveTab('details');
                else if (errorFields.some(f => f.startsWith('modules'))) setActiveTab('curriculum');
                else if (errorFields.some(f => ['price', 'discountPrice'].includes(f))) setActiveTab('pricing');
            } else {
                toast({ /* ... generic error toast ... */ });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tab change handler (remains the same)
    const handleTabChange = async (newTab: string) => {
        // ... same handleTabChange logic ...
        let fieldsToValidate: (keyof CourseFormValues)[] = [];
        switch (activeTab) {
            case 'basic': fieldsToValidate = ['title', 'subtitle', 'description', 'category', 'level', 'tags']; break;
            case 'details': fieldsToValidate = ['learningOutcomes', 'prerequisites', 'language', 'certificate', 'accessType', 'supportType']; break;
            case 'curriculum': fieldsToValidate = ['modules']; break;
        }
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setActiveTab(newTab);
        } else {
            toast({
                title: "Hold on!",
                description: "Please fix the errors on this tab.",
                variant: "default", // Or "warning"
            });
        }
    };


    // --- Conditional Rendering ---
    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (error) {
        // Handle "Not Found" specifically? Or just show generic error?
        if (error.includes("not found")) {
            return <ErrorDisplay message={error} />; // Or a dedicated "Not Found" component
        }
        if (error.includes("permission")) {
            return <AccessDeniedMessage message={error} />;
        }
        return <ErrorDisplay message={error} />;
    }

    if (!courseData) {
        // Should be caught by error state, but as a fallback
        return <ErrorDisplay message="Course data could not be loaded." />;
    }


    // --- Render the Form ---
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
                <DyraneButton variant="outline" asChild>
                    <Link href={`/courses`}>Cancel & View Courses</Link>
                </DyraneButton>
            </div>

            {/* Alert */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">
                    {alertTitle}
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    {alertDescription}
                </AlertDescription>
            </Alert>

            {/* Main Form and Tabs - Identical structure to Create Page */}
            <Form {...form}>
                {/* @ts-ignore <-- ACCEPTED from previous state */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
                            <TabsTrigger value="basic">1. Basic Info</TabsTrigger>
                            <TabsTrigger value="details">2. Details</TabsTrigger>
                            <TabsTrigger value="curriculum">3. Curriculum</TabsTrigger>
                            <TabsTrigger value="pricing">4. Pricing</TabsTrigger>
                        </TabsList>

                        {/* Re-use the exact same form section components */}
                        <TabsContent value="basic" forceMount className={activeTab === 'basic' ? 'block' : 'hidden'} >
                            <BasicInfoForm
                                // @ts-ignore <-- ACCEPTED from previous state
                                control={form.control}
                                setValue={form.setValue}
                                onNext={() => handleTabChange("details")}
                            />
                        </TabsContent>

                        <TabsContent value="details" forceMount className={activeTab === 'details' ? 'block' : 'hidden'} >
                            <CourseDetailsForm
                                // @ts-ignore <-- ACCEPTED from previous state
                                control={form.control}
                                onBack={() => setActiveTab("basic")}
                                onNext={() => handleTabChange("curriculum")}
                            />
                        </TabsContent>

                        <TabsContent value="curriculum" forceMount className={activeTab === 'curriculum' ? 'block' : 'hidden'} >
                            <CurriculumForm
                                // @ts-ignore <-- ACCEPTED from previous state
                                control={form.control}
                                onBack={() => setActiveTab("details")}
                                onNext={() => handleTabChange("pricing")}
                            />
                        </TabsContent>

                        <TabsContent value="pricing" forceMount className={activeTab === 'pricing' ? 'block' : 'hidden'} >
                            <PricingSettingsForm
                                // @ts-ignore <-- ACCEPTED from previous state
                                control={form.control}
                                isSubmitting={isSubmitting}
                                onBack={() => setActiveTab("curriculum")}
                                submitLabel={submitButtonLabel} // Use updated label
                            />
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}