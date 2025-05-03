// src/components/course-form/CurriculumForm.tsx
import React from "react";
import { useFieldArray, type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { FormMessage, FormField } from "@/components/ui/form"; // Import FormField for top-level array errors
import { Plus } from "lucide-react";
import { FormNavigation } from "./FormNavigation";
import { ModuleItem } from "./ModuleItem";
import { defaultModuleValues } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface CurriculumFormProps {
    control: Control<CourseFormValues>;
    onBack: () => void;
    onNext: () => void;
}

export const CurriculumForm: React.FC<CurriculumFormProps> = ({ control, onBack, onNext }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "modules",
    });

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-6">
                    {fields.map((module, index) => (
                        <ModuleItem
                            key={module.id} // useFieldArray provides a stable id
                            moduleIndex={index}
                            control={control}
                            removeModule={remove}
                        />
                    ))}

                    <DyraneButton
                        type="button"
                        variant="outline"
                        onClick={() => append({ ...defaultModuleValues, title: `Module ${fields.length + 1}` })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Module
                    </DyraneButton>
                    {/* Display errors specific to the modules array itself (e.g., min length) */}
                    <FormField
                        control={control}
                        name="modules" // Target the top-level array
                        render={() => <FormMessage className="mt-2" />} // Display error message below the add button
                    />
                </div>
            </CardContent>
            <FormNavigation onBack={onBack} onNext={onNext} />
        </DyraneCard>
    );
};