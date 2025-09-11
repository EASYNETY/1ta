// components/course-form/LessonItem.tsx

import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { type Control, type Path } from "react-hook-form";
import type { CourseFormValues } from "@/lib/schemas/course.schema";
import { LESSON_TYPES } from "@/config/course-form-config";

interface LessonItemProps {
    moduleIndex: number;
    lessonIndex: number;
    control: Control<CourseFormValues>;
    removeLesson: (index: number) => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({
    moduleIndex,
    lessonIndex,
    control,
    removeLesson,
}) => {
    const lessonFieldPrefix = `modules.${moduleIndex}.lessons.${lessonIndex}`;

    return (
        <div className="border rounded-md p-4 bg-muted/20 relative space-y-4">
            {/* ... Delete Button ... */}
            <DyraneButton
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLesson(lessonIndex)}
                className="absolute top-2 right-2 h-7 w-7"
            >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Remove Lesson</span>
            </DyraneButton>

            <div className="pt-1">
                {/* Lesson Title */}
                <FormField
                    control={control}
                    name={`${lessonFieldPrefix}.title` as Path<CourseFormValues>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Lesson Title *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Enter lesson title"
                                    className="mt-1 bg-background"
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

                {/* Lesson Description */}
                <FormField
                    control={control}
                    name={`${lessonFieldPrefix}.description` as Path<CourseFormValues>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Lesson Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Enter lesson description (optional)"
                                    className="mt-1 bg-background"
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

                {/* Lesson Duration */}
                <FormField
                    control={control}
                    name={`${lessonFieldPrefix}.duration` as Path<CourseFormValues>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Duration (e.g., 10m)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. 10m or 00:15:00"
                                    className="mt-1 bg-background"
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

                {/* Lesson Type */}
                <FormField
                    control={control}
                    name={`${lessonFieldPrefix}.type` as Path<CourseFormValues>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm">Lesson Type *</FormLabel>
                            {/* FIX: Explicitly convert value to string for Select */}
                            <Select
                                onValueChange={field.onChange}
                                value={String(field.value ?? "")} // Convert to string here
                            >
                                <FormControl>
                                    <SelectTrigger className="mt-1 bg-background">
                                        {/* Ensure placeholder is shown if value is empty string */}
                                        <SelectValue placeholder="Select lesson type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {LESSON_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};
