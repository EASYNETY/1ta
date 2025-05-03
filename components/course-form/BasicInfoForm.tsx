// src/components/course-form/BasicInfoForm.tsx
import React from "react";
import { type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Upload } from "lucide-react";
import { FormNavigation } from "./FormNavigation";
import { CATEGORIES, LEVELS } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface BasicInfoFormProps {
    control: Control<CourseFormValues>;
    onNext: () => void;
}

// Placeholder for Thumbnail Upload component
const ThumbnailUploaderPlaceholder: React.FC = () => (
    <div className="border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Course Thumbnail (Placeholder)</h3>
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
            <div className="text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop image, or click to browse</p>
                <p className="text-xs text-muted-foreground mb-4">Recommended: 1280x720px</p>
                <DyraneButton type="button" variant="outline" size="sm" disabled>
                    Upload Image
                </DyraneButton>
            </div>
        </div>
    </div>
);


export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ control, onNext }) => {
    return (
        <DyraneCard>
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
                                        {LEVELS.map((lvl) => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
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

                {/* Thumbnail Placeholder */}
                <ThumbnailUploaderPlaceholder />

            </CardContent>
            <FormNavigation onNext={onNext} />
        </DyraneCard>
    );
};