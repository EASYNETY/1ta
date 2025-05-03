// src/components/course-form/ModuleItem.tsx

import React from "react";
// --- Import FieldArrayPath ---
import { useFieldArray, type Control, type Path, type FieldArrayPath } from "react-hook-form";
// --- End Import ---
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { LessonItem } from "./LessonItem";
import { defaultLessonValues } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface ModuleItemProps {
    moduleIndex: number;
    control: Control<CourseFormValues>;
    removeModule: (index: number) => void;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({ moduleIndex, control, removeModule }) => {
    const moduleFieldNamePrefix = `modules.${moduleIndex}`;

    // Initialize useFieldArray for the lessons within this module
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control,
        // --- Use FieldArrayPath Assertion ---
        name: `${moduleFieldNamePrefix}.lessons` as FieldArrayPath<CourseFormValues>,
        // --- End Assertion ---
    });

    return (
        <div className="border rounded-lg p-4 bg-card shadow-sm">
            {/* Module Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h3 className="text-lg font-semibold">Module {moduleIndex + 1}</h3>
                <DyraneButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeModule(moduleIndex)}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove Module {moduleIndex + 1}</span>
                </DyraneButton>
            </div>

            {/* Module Title and Description Fields */}
            <div className="space-y-4 mb-6">
                {/* Module Title */}
                <FormField
                    control={control}
                    name={`${moduleFieldNamePrefix}.title` as Path<CourseFormValues>} // Path is correct here
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Module Title *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g., Introduction to..."
                                    className="mt-1"
                                    value={String(field.value ?? "")}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Module Description */}
                <FormField
                    control={control}
                    name={`${moduleFieldNamePrefix}.description` as Path<CourseFormValues>} // Path is correct here
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Module Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Briefly describe this module's content (optional)"
                                    className="mt-1"
                                    rows={3}
                                    value={String(field.value ?? "")}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Lessons Section */}
            <h4 className="text-base font-semibold mb-3">Lessons</h4>
            <div className="space-y-4 pl-4 border-l-2 border-border ml-1">
                {lessonFields.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No lessons added yet. Click "Add Lesson" to start.</p>
                )}
                {lessonFields.map((lesson, lessonIndex) => (
                    <LessonItem
                        key={lesson.id}
                        moduleIndex={moduleIndex}
                        lessonIndex={lessonIndex}
                        control={control}
                        removeLesson={removeLesson}
                    />
                ))}

                {/* Add Lesson Button */}
                <DyraneButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLesson({ ...defaultLessonValues, title: `Lesson ${lessonFields.length + 1}` })}
                    className="mt-4"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson to Module {moduleIndex + 1}
                </DyraneButton>
            </div>

            {/* Error message specifically for the lessons array */}
            <FormField
                control={control}
                // Path assertion is okay here for displaying errors,
                // but FieldArrayPath would also work if preferred.
                name={`${moduleFieldNamePrefix}.lessons` as Path<CourseFormValues>}
                render={() => <FormMessage className="mt-2 ml-5 text-xs" />}
            />
        </div>
    );
};