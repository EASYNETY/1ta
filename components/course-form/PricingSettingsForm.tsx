// src/components/course-form/PricingSettingsForm.tsx
import React from "react";
import { type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Keep Select import if CourseSettingsPlaceholder uses it
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"; // Keep Button if CourseSettingsPlaceholder uses it
import { FormNavigation } from "./FormNavigation";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface PricingSettingsFormProps {
    control: Control<CourseFormValues>;
    isSubmitting: boolean;
    onBack: () => void;
    submitLabel: string;
}

// Placeholder for Course Settings - Kept as requested
// (Ensure imports for Select/Input/Button are kept if this component uses them)
const CourseSettingsPlaceholder: React.FC = () => (
    <div className="border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Course Settings (Placeholder)</h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div><h4 className="font-medium">Visibility</h4><p className="text-sm text-muted-foreground">Control who can see it</p></div>
                <Select defaultValue="public" disabled><SelectTrigger className="w-[180px]"><SelectValue placeholder="Visibility" /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div><h4 className="font-medium">Enrollment Limit</h4><p className="text-sm text-muted-foreground">Max number of students</p></div>
                <Input type="number" placeholder="No limit" className="w-[180px]" disabled />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div><h4 className="font-medium">Start Date</h4><p className="text-sm text-muted-foreground">When it becomes available</p></div>
                <Input type="date" className="w-[180px]" disabled />
            </div>
        </div>
    </div>
);


export const PricingSettingsForm: React.FC<PricingSettingsFormProps> = ({ control, isSubmitting, onBack, submitLabel }) => {
    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Pricing & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Price & Discount Price in NGN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="price" // This should correspond to the field name in your schema
                        render={({ field }) => (
                            <FormItem>
                                {/* UPDATE Label */}
                                <FormLabel>Price (NGN) *</FormLabel>
                                <FormControl>
                                    {/* RHF handles number conversion for type="number" */}
                                    <Input
                                        type="number"
                                        min="0"
                                        // Adjust step if needed for NGN (e.g., no decimals step="1")
                                        step="1"
                                        {...field}
                                        // Pass value directly, RHF manages state
                                        // value={field.value} // RHF handles this via {...field}
                                        placeholder="e.g., 15000 or 0 for free"
                                    />
                                </FormControl>
                                {/* UPDATE Description */}
                                <FormDescription>Set the regular price in Naira (0 for free).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="discountPrice" // This should correspond to the field name in your schema
                        render={({ field }) => (
                            <FormItem>
                                {/* UPDATE Label */}
                                <FormLabel>Discount Price (NGN)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        // Adjust step if needed for NGN
                                        step="1"
                                        placeholder="e.g., 12500"
                                        {...field} // Spread first
                                        // Explicitly handle undefined for value prop compatibility
                                        value={field.value ?? ""}
                                        // Let RHF and schema transform handle conversion
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Pass undefined if empty, otherwise parse as float/int
                                            field.onChange(value === "" ? undefined : parseFloat(value));
                                        }}
                                        // Re-apply other needed props
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                    />
                                </FormControl>
                                {/* UPDATE Description */}
                                <FormDescription>Set a promotional price in Naira (optional).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* REMOVED Payment Integration Placeholder */}

                {/* Course Settings Placeholder - Kept */}
                <CourseSettingsPlaceholder />

            </CardContent>
            {/* FormNavigation remains the same */}
            <FormNavigation onBack={onBack} isSubmitting={isSubmitting} submitLabel={submitLabel} isLastStep={true} />
        </DyraneCard>
    );
};