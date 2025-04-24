// src/components/landing/DemoRequestForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { CardContent, CardFooter } from "@/components/ui/card"; // Keep using base card parts if DyraneCard doesn't export them
import { CheckCircle, Loader2 } from "lucide-react"; // Added Loader2
import { MotionTokens } from "@/lib/motion.tokens";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form"; // Add this import at the top

// Refined Schema for 1Tech Academy Inquiry
const inquiryFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  interest: z.string().min(1, { message: "Please select an area of interest" }), // Added area of interest
  message: z.string().optional(), // Optional message field
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

// Example areas of interest
const areasOfInterest = [
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Cybersecurity",
    "Cloud Computing",
    "AI & Machine Learning",
    "General Inquiry",
];

export function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // Add error state

  const {
    register,
    handleSubmit,
    control, // Needed for Shadcn Select with React Hook Form
    formState: { errors },
    reset, // Add reset function
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { // Set default values
        name: "",
        email: "",
        interest: "",
        message: "",
    }
  });

  // --- Submit Handler ---
  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    setIsSubmitted(false); // Reset submitted state on new attempt
    setSubmitError(null); // Clear previous errors

    // Simulate API call to your backend endpoint for inquiries
    try {
        console.log("Sending inquiry:", data);
        // Replace with your actual API call
        // const response = await fetch('/api/inquiry', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // });
        // if (!response.ok) {
        //     throw new Error('Something went wrong. Please try again.');
        // }
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate success
        setIsSubmitted(true);
        reset(); // Clear form fields on success
    } catch (error) {
         setSubmitError(error instanceof Error ? error.message : "An unknown error occurred.");
         console.error("Inquiry submission failed:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Animation Variants ---
  const formVariants = { /* ... keep as is ... */
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };
  const itemVariants = { /* ... keep as is ... */
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: MotionTokens.ease.easeOut,
            },
        },
    };

  // --- Success State View ---
  if (isSubmitted) {
    return (
      <motion.div
        key="success-message" // Add key for transition
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: MotionTokens.duration.medium, ease: MotionTokens.ease.easeOut }}
        className="py-10 flex flex-col items-center text-center px-6" // Added padding
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 25 }}
          className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4" // Adjusted size
        >
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-1 text-foreground">Thank You!</h3> {/* Adjusted text */}
        <p className="text-muted-foreground mb-6 text-sm">
          Your inquiry has been sent. We'll get back to you soon! {/* Adjusted text */}
        </p>
        <DyraneButton variant="outline" size="sm" onClick={() => setIsSubmitted(false)}> {/* Smaller button */}
          Send Another Inquiry
        </DyraneButton>
      </motion.div>
    );
  }

  // --- Form View ---
  return (
    // Use key for smooth transition between form and success message
    <motion.div key="inquiry-form" initial="hidden" animate="visible" exit="hidden" variants={formVariants}>
      <CardContent className="pt-6 pb-2"> {/* Adjusted padding */}
        <form id="inquiry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <motion.div className="space-y-1.5" variants={itemVariants}>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g., Ada Lovelace" // Updated placeholder
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>} {/* Smaller error text */}
          </motion.div>

          {/* Email Field */}
          <motion.div className="space-y-1.5" variants={itemVariants}>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="ada@example.com" // Updated placeholder
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </motion.div>

          {/* Area of Interest Select Field */}
          <motion.div className="space-y-1.5" variants={itemVariants}>
             <Label htmlFor="interest">Area of Interest</Label>
             {/* Need Controller for Shadcn Select with React Hook Form */}
             <Controller
                name="interest"
                control={control}
                render={({ field }) => (
                     <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value} // Control the value
                        disabled={isSubmitting}
                    >
                        <SelectTrigger id="interest" aria-invalid={errors.interest ? "true" : "false"}>
                            <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                            {areasOfInterest.map((area) => (
                                <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
             />
             {errors.interest && <p className="text-xs text-destructive">{errors.interest.message}</p>}
         </motion.div>


          {/* Optional Message Field */}
          <motion.div className="space-y-1.5" variants={itemVariants}>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Any specific questions or details?" // Updated placeholder
              {...register("message")}
              rows={3} // Adjust rows
              disabled={isSubmitting}
            />
             {/* No error display needed for optional field unless specific validation added */}
          </motion.div>

           {/* Submission Error Display */}
           {submitError && (
                <motion.div variants={itemVariants}>
                    <p className="text-sm text-destructive text-center">{submitError}</p>
                </motion.div>
           )}
        </form>
      </CardContent>
      <CardFooter>
        <motion.div className="w-full" variants={itemVariants}>
          {/* Submit Button */}
          <DyraneButton type="submit" form="inquiry-form" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                {/* Use Lucide Loader */}
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              "Send Inquiry" // Updated button text
            )}
          </DyraneButton>
        </motion.div>
      </CardFooter>
    </motion.div>
  );
}