// src/components/course-form/CourseDetailsForm.tsx
import React from "react";
import { type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Upload } from "lucide-react";
import { FormNavigation } from "./FormNavigation";
import { LANGUAGES, ACCESS_TYPES, SUPPORT_TYPES } from "@/config/course-form-config";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface CourseDetailsFormProps {
    control: Control<CourseFormValues>;
    onBack: () => void;
    onNext: () => void;
}

// Placeholder for Video Upload component
const VideoUploaderPlaceholder: React.FC = () => (
    <div className="border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Promotional Video (Placeholder)</h3>
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
            <div className="text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Upload a short promo video (MP4)</p>
                <p className="text-xs text-muted-foreground mb-4">Recommended: 2-5 minutes</p>
                <DyraneButton type="button" variant="outline" size="sm" disabled>
                    Upload Video
                </DyraneButton>
            </div>
        </div>
    </div>
);

export const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({ control, onBack, onNext }) => {
    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Learning Outcomes */}
                <FormField
                    control={control}
                    name="learningOutcomes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Learning Outcomes</FormLabel>
                            <FormControl><Textarea {...field} placeholder="List key outcomes, one per line..." className="min-h-[120px]" /></FormControl>
                            <FormDescription>What students will be able to do after the course (one item per line).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Prerequisites */}
                <FormField
                    control={control}
                    name="prerequisites"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prerequisites</FormLabel>
                            <FormControl><Textarea {...field} placeholder="List requirements, one per line..." className="min-h-[120px]" /></FormControl>
                            <FormDescription>What students should know beforehand (one item per line).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Language & Certificate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {LANGUAGES.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="certificate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Certificate</FormLabel>
                                <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={String(field.value)}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Offer certificate?" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Yes, offer certificate</SelectItem>
                                        <SelectItem value="false">No certificate</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Access Type & Support Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="accessType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Access Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select access type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {ACCESS_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="supportType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Support Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select support type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {SUPPORT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Promo Video Placeholder */}
                <VideoUploaderPlaceholder />

            </CardContent>
            <FormNavigation onBack={onBack} onNext={onNext} />
        </DyraneCard>
    );
};