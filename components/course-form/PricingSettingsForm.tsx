// src/components/course-form/PricingSettingsForm.tsx
import React from "react";
import { type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { FormNavigation } from "./FormNavigation";
import type { CourseFormValues } from "@/lib/schemas/course.schema";

interface PricingSettingsFormProps {
    control: Control<CourseFormValues>;
    isSubmitting: boolean;
    onBack: () => void;
    submitLabel: string;
}

// Placeholders for complex sections
const PaymentIntegrationPlaceholder: React.FC = () => (
    <div className="border rounded-lg p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Payment Integration (Placeholder)</h3>
        <div className="space-y-4">
            {["Paystack", "Stripe", "PayPal"].map((provider) => (
                <div key={provider} className="flex items-center p-3 border rounded-md">
                    <div className="flex-1">
                        <h4 className="font-medium">{provider}</h4>
                        <p className="text-sm text-muted-foreground">Accept payments via {provider}</p>
                    </div>
                    <DyraneButton type="button" variant="outline" size="sm" disabled>Configure</DyraneButton>
                </div>
            ))}
        </div>
    </div>
);

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
                {/* Price & Discount Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (USD) *</FormLabel>
                                <FormControl><Input type="number" min="0" step="0.01" {...field} placeholder="e.g., 49.99 or 0 for free" /></FormControl>
                                <FormDescription>Set the regular price (0 for free).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="discountPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount Price (USD)</FormLabel>
                                <FormControl>
                                    {/* Important: Keep type="number" but handle potential empty string */}
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g., 39.99"
                                        {...field}
                                        value={field.value ?? ""} // Ensure value is never null/undefined for input
                                        onChange={(e) => {
                                            // Allow empty string or convert to number
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : parseFloat(value));
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>Set a promotional price (optional).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Payment Integration Placeholder */}
                <PaymentIntegrationPlaceholder />

                {/* Course Settings Placeholder */}
                <CourseSettingsPlaceholder />

            </CardContent>
            <FormNavigation onBack={onBack} isSubmitting={isSubmitting} submitLabel={submitLabel} isLastStep={true} />
        </DyraneCard>
    );
};