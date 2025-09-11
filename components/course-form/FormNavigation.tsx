// src/components/course-form/FormNavigation.tsx
import React from "react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormNavigationProps {
    onBack?: () => void;
    onNext?: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    isLastStep?: boolean;
    isSubmittable?: boolean; // Can the form be submitted from this step? (defaults to isLastStep)
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
    onBack,
    onNext,
    isSubmitting = false,
    submitLabel = "Submit",
    isLastStep = false,
    isSubmittable, // Defaults to isLastStep if undefined
}) => {
    const showSubmit = isSubmittable === undefined ? isLastStep : isSubmittable;

    return (
        <CardFooter className="flex justify-between">
            {onBack ? (
                <DyraneButton type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </DyraneButton>
            ) : (
                <div /> // Placeholder to maintain space
            )}

            {showSubmit ? (
                <DyraneButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : submitLabel}
                </DyraneButton>
            ) : onNext ? (
                <DyraneButton type="button" onClick={onNext} disabled={isSubmitting}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                </DyraneButton>
            ) : (
                <div /> // Placeholder if neither submit nor next
            )}
        </CardFooter>
    );
};
