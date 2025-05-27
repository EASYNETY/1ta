// src/components/course-form/PricingSettingsForm.tsx
import React, { useState } from "react";
import { type Control } from "react-hook-form";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { FormNavigation } from "./FormNavigation";
import type { CourseFormValues } from "@/lib/schemas/course.schema";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/store/hooks";
import { AdminGuard } from "@/components/auth/PermissionGuard";

interface PricingSettingsFormProps {
    control: Control<CourseFormValues>;
    isSubmitting: boolean;
    onBack: () => void;
    submitLabel: string;
}


export const PricingSettingsForm: React.FC<PricingSettingsFormProps> = ({ control, isSubmitting, onBack, submitLabel }) => {
    const [showDollarPricing, setShowDollarPricing] = useState(false);
    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Pricing & Settings</span>
                    <AdminGuard>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-normal">
                                {showDollarPricing ? 'USD' : 'NGN'}
                            </span>
                            <Switch
                                checked={showDollarPricing}
                                onCheckedChange={setShowDollarPricing}
                                aria-label="Toggle currency"
                            />
                        </div>
                    </AdminGuard>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Naira Pricing */}
                {!showDollarPricing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="priceNaira" // New field for Naira price
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (NGN) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="e.g., 15000 or 0 for free"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? undefined : parseFloat(value));
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>Set the regular price in Naira (0 for free).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="discountPriceNaira" // New field for Naira discount price
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Price (NGN)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="e.g., 12500"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? undefined : parseFloat(value));
                                            }}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormDescription>Set a promotional price in Naira (optional).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* Dollar Pricing - Only visible to admins */}
                <AdminGuard>
                    {showDollarPricing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={control}
                                name="price" // Original field for USD price
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (USD) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 49.99 or 0 for free"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? undefined : parseFloat(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Set the base price in US Dollars.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="discountPrice" // Original field for USD discount price
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Price (USD)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 29.99"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? undefined : parseFloat(value));
                                                }}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                        <FormDescription>Set a promotional price in US Dollars (optional).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </AdminGuard>

                {/* Course Settings */}
                <div className="border rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-medium mb-4">Course Settings</h3>
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="available_for_enrolment"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                                    <div>
                                        <FormLabel>Availability</FormLabel>
                                        <FormDescription className="text-sm text-muted-foreground">
                                            Control if students can enrol in this course
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

            </CardContent>
            {/* FormNavigation remains the same */}
            <FormNavigation onBack={onBack} isSubmitting={isSubmitting} submitLabel={submitLabel} isLastStep={true} />
        </DyraneCard>
    );
};