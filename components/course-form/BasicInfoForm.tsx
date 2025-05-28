// src/components/course-form/BasicInfoForm.tsx
import React from "react";
// Import UseFormSetValue type from react-hook-form
import { type Control, useWatch, type UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { X } from "lucide-react";

import { FormNavigation } from "./FormNavigation";
import { CATEGORIES, levels } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

import { FormMediaUpload, StandaloneFormMediaUpload } from "@/components/ui/form-media-upload";
import { MediaType } from "@/lib/services/media-upload-service";

interface BasicInfoFormProps {
    control: Control<CourseFormValues>;
    setValue: UseFormSetValue<CourseFormValues>; // Add setValue to props
    onNext: () => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ control, setValue, onNext }) => { // Destructure setValue from props
    const imageUrl = useWatch({
        control,
        name: "image",
    });

    const handleRemoveImage = () => {
        // Use the passed setValue function instead of control.setValue
        setValue("image", "", { shouldValidate: true, shouldDirty: true });
    };

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

                {/* Course Thumbnail Upload Section */}
                <FormItem>
                    <FormLabel>Course Thumbnail: {imageUrl}</FormLabel>
                    <div className="mt-2">
                        {imageUrl && typeof imageUrl === 'string' ? (
                            <div className="space-y-3">
                                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                    <Image
                                        src={imageUrl}
                                        alt="Course Thumbnail Preview"
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemoveImage}
                                    className="flex items-center"
                                >
                                    <X className="mr-2 h-4 w-4" /> Remove / Change Thumbnail
                                </Button>
                                <FormDescription>
                                    Current thumbnail. Click the button to remove it and upload a new one.
                                </FormDescription>
                            </div>
                        ) : (
                            <>
                                <StandaloneFormMediaUpload
                                    control={control}
                                    name="image"
                                    description={
                                        "Upload a thumbnail image for your course (1280x720px recommended). Max 2MB."
                                    }
                                    mediaType={MediaType.IMAGE}
                                    showFileName={false}
                                    uploadOptions={{
                                        folder: "course-thumbnails",
                                        onUploadSuccess: (response) => {
                                            console.log("Thumbnail uploaded successfully (external callback):", response);
                                            // Prepend base URL to relative URL before setting value
                                            // const baseUrl = "http://34.249.241.206:5000";
                                            const fullUrl = response.data.files[0].url ? response.data.files[0].url : "";
                                            setValue("image", fullUrl, { shouldValidate: true, shouldDirty: true });
                                        },
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <FormField
                        control={control}
                        name="image"
                        render={() => <FormMessage className="mt-1" />}
                    />
                </FormItem>

            </CardContent>
            <FormNavigation onNext={onNext} />
        </Card>
    );
};