// app/(authenticated)/courses/create/page.tsx
"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

// Import Schemas and Types
import { courseSchema, type CourseFormValues } from "@/lib/schemas/course.schema";

// Import Config
import { defaultModuleValues } from "@/config/course-form-config";

// Import Modular Form Components
import { BasicInfoForm } from "@/components/course-form/BasicInfoForm";
import { CourseDetailsForm } from "@/components/course-form/CourseDetailsForm";
import { CurriculumForm } from "@/components/course-form/CurriculumForm";
import { PricingSettingsForm } from "@/components/course-form/PricingSettingsForm";

// Define a placeholder User type - replace with your actual User type
interface User {
  id: string;
  role: "admin" | "teacher" | "student" | string;
}

// Helper Component for Access Denied Message
const AccessDeniedMessage: React.FC = () => (
  <div className="flex h-[50vh] items-center justify-center p-4">
    <div className="text-center">
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="text-muted-foreground mt-2">You don't have permission to create courses.</p>
      <DyraneButton asChild className="mt-4">
        <Link href="/courses">Back to Courses</Link>
      </DyraneButton>
    </div>
  </div>
);

// --- Main Page Component ---
export default function CreateCoursePage() {
  const { user } = useAppSelector((state) => state.auth as { user: User | null });
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize react-hook-form with the full schema including modules

  const form = useForm<CourseFormValues>({
    // @ts-ignore
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      category: undefined, // No default category initially
      level: "All Levels",
      price: 0,
      discountPrice: undefined, // Correct default for optional number
      language: "English",
      certificate: true,
      accessType: "Lifetime",
      supportType: "Both",
      tags: "",
      learningOutcomes: "",
      prerequisites: "",
      modules: [{ ...defaultModuleValues }], // Start with one default module
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Check user authorization
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return <AccessDeniedMessage />;
  }

  const isTeacher = user.role === "teacher";
  const submitButtonLabel = isTeacher ? "Request Course Creation" : "Create Course";

  // Form submission handler
  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Form Data Submitted:", data); // Log raw RHF data

    try {
      // --- Data Processing (Example: Split comma/newline strings) ---
      // Do this *before* sending to API
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        learningOutcomes: data.learningOutcomes ? data.learningOutcomes.split('\n').map(item => item.trim()).filter(Boolean) : [],
        prerequisites: data.prerequisites ? data.prerequisites.split('\n').map(item => item.trim()).filter(Boolean) : [],
        // NOTE: Modules/Lessons are already structured correctly by RHF useFieldArray
        instructorId: user.id, // Add instructor ID
        // TODO: Add logic to handle actual file uploads (thumbnail, video)
        //       and replace placeholders with URLs/IDs before API call.
      };

      console.log("Processed Data for API:", processedData);

      // --- Replace with your actual API call ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
      // const response = await fetch('/api/courses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(processedData), // Send processed data
      // });
      // if (!response.ok) throw new Error('Failed to create course.');
      // const result = await response.json();
      // --- End of API call ---

      toast({
        title: isTeacher ? "Course Request Submitted" : "Course Created",
        description: isTeacher
          ? "Your request will be reviewed by an admin."
          : "The new course is ready.",
        variant: "success",
      });
      router.push("/courses"); // Redirect after success

    } catch (error) {
      console.error("Course creation failed:", error);
      // Check if Zod errors exist (though resolver should prevent submission on error)
      if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
        console.error("Validation Errors: ", form.formState.errors);
        toast({
          title: "Validation Error",
          description: "Please check the highlighted fields in the form.",
          variant: "destructive",
        });
        // Try to navigate to the first tab with an error
        const errorFields = Object.keys(form.formState.errors);
        if (errorFields.some(f => ['title', 'subtitle', 'description', 'category', 'level', 'tags'].includes(f))) setActiveTab('basic');
        else if (errorFields.some(f => ['learningOutcomes', 'prerequisites', 'language', 'certificate', 'accessType', 'supportType'].includes(f))) setActiveTab('details');
        else if (errorFields.some(f => f.startsWith('modules'))) setActiveTab('curriculum');
        else if (errorFields.some(f => ['price', 'discountPrice'].includes(f))) setActiveTab('pricing');

      } else {
        toast({
          title: "Submission Error",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to navigate tabs, triggering validation for the current tab
  const handleTabChange = async (newTab: string) => {
    let fieldsToValidate: (keyof CourseFormValues)[] = [];
    switch (activeTab) {
      case 'basic':
        fieldsToValidate = ['title', 'subtitle', 'description', 'category', 'level', 'tags'];
        break;
      case 'details':
        fieldsToValidate = ['learningOutcomes', 'prerequisites', 'language', 'certificate', 'accessType', 'supportType'];
        break;
      case 'curriculum':
        fieldsToValidate = ['modules']; // Validate the whole array structure
        break;
      // No validation needed before leaving pricing (it's the last step before submit)
      // case 'pricing': fieldsToValidate = ['price', 'discountPrice']; break;
    }

    // Trigger validation only for the fields in the *current* tab before moving
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setActiveTab(newTab); // Move to the next tab if current is valid
    } else {
      toast({
        title: "Hold on!",
        description: "Please fix the errors on the current tab before proceeding.",
        variant: "default",
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{isTeacher ? "Request New Course" : "Create New Course"}</h1>
      </div>

      {/* Informational Alert */}
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">
          {isTeacher ? "Course Request" : "New Course Creation"}
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          {isTeacher
            ? "Fill out the details below. Your request will be reviewed by an administrator."
            : "Complete all sections to create a new course. Fields marked * are required."}
        </AlertDescription>
      </Alert>

      {/* Main Form and Tabs */}
      <Form {...form}>
        {/* @ts-ignore */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Keep onValueChange={setActiveTab} for direct tab clicks,
                 but use handleTabChange for Next/Back button clicks */}
            <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="basic">1. Basic Info</TabsTrigger>
              <TabsTrigger value="details">2. Details</TabsTrigger>
              <TabsTrigger value="curriculum">3. Curriculum</TabsTrigger>
              <TabsTrigger value="pricing">4. Pricing</TabsTrigger>
            </TabsList>

            {/* Tab Content Panels */}
            <TabsContent value="basic" forceMount // Keep content mounted for RHF state
              className={activeTab === 'basic' ? 'block' : 'hidden'} // Control visibility manually
            >
              <BasicInfoForm
                // @ts-ignore
                control={form.control}
                onNext={() => handleTabChange("details")}
              />
            </TabsContent>

            <TabsContent value="details" forceMount
              className={activeTab === 'details' ? 'block' : 'hidden'}
            >
              <CourseDetailsForm
                // @ts-ignore
                control={form.control}
                onBack={() => setActiveTab("basic")} // Allow direct back navigation
                onNext={() => handleTabChange("curriculum")}
              />
            </TabsContent>

            <TabsContent value="curriculum" forceMount
              className={activeTab === 'curriculum' ? 'block' : 'hidden'}
            >
              <CurriculumForm
                // @ts-ignore
                control={form.control}
                onBack={() => setActiveTab("details")}
                onNext={() => handleTabChange("pricing")}
              />
            </TabsContent>

            <TabsContent value="pricing" forceMount
              className={activeTab === 'pricing' ? 'block' : 'hidden'}
            >
              <PricingSettingsForm
                // @ts-ignore
                control={form.control}
                isSubmitting={isSubmitting}
                onBack={() => setActiveTab("curriculum")}
                submitLabel={submitButtonLabel}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}