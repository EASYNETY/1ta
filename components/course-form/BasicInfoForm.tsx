// src/components/course-form/BasicInfoForm.tsx
import React from "react";
import { type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormNavigation } from "./FormNavigation";
import { CATEGORIES, levels, LEVELS } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface BasicInfoFormProps {
    control: Control<CourseFormValues>;
    onNext: () => void;
}

// Import the FormMediaUpload component
import { FormMediaUpload } from "@/components/ui/form-media-upload";
import { MediaType } from "@/lib/services/media-upload-service";


export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ control, onNext }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Title */}
                <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Title *</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., Web Development Bootcamp" /></FormControl>
                            <FormDescription>Choose a clear and concise title.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Subtitle */}
                <FormField
                    control={control}
                    name="subtitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Subtitle</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., Learn HTML, CSS, React..." /></FormControl>
                            <FormDescription>A brief subtitle for additional context.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Description *</FormLabel>
                            <FormControl><Textarea {...field} placeholder="Describe your course in detail..." className="min-h-[150px]" /></FormControl>
                            <FormDescription>Provide a comprehensive description.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category & Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Level *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {levels.map((lvl) => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Tags */}
                <FormField
                    control={control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., javascript, web dev, react" /></FormControl>
                            <FormDescription>Comma-separated tags to help discovery.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Course Thumbnail Upload */}
                <FormMediaUpload
                    name="image"
                    label="Course Thumbnail"
                    description="Upload a thumbnail image for your course (1280x720px recommended)"
                    mediaType={MediaType.IMAGE}
                    showFileName={false}
                    uploadOptions={{
                        folder: "course-thumbnails",
                        onUploadSuccess: (response) => {
                            console.log("Thumbnail uploaded successfully:", response);
                        },
                    }}
                />

            </CardContent>
            <FormNavigation onNext={onNext} />
        </Card>
    );
};