// components/profile/ProfileFormFields.tsx
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerWithYearMonth } from "@/components/ui/date-picker-with-year-month"; // Import the new date picker
import { Label } from "../ui/label";

// Re-define schema or import from a shared location
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    classId: z.string({ required_error: "Please select a class/course" }),
    accountType: z.enum(["individual", "institutional"]), // Removed required_error as it's conditional
    bio: z.string().optional(),
    phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormFieldsProps {
    form: UseFormReturn<ProfileFormValues>;
    courses: Array<{ id: string; name: string }>;
    userRole: string;
    userEmail: string;
    isOnboarding: boolean;
}

export function ProfileFormFields({ form, courses, userRole, userEmail, isOnboarding }: ProfileFormFieldsProps) {

    // Role-specific fields component (internal or could be separate)
    const RoleSpecificFields = () => {
        switch (userRole) {
            case "admin":
                return (
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g., +234..." /></FormControl>
                                <FormDescription>For emergency contact purposes</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            case "teacher":
                return (
                    <>
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professional Bio (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="Share your background..."
                                            className="min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormDescription>Visible to students</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g., +234..." /></FormControl>
                                    <FormDescription>For administrative contact</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                );
            default: // student
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Name */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} placeholder="Enter your full name" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Date of Birth */}
            <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <DatePickerWithYearMonth
                            date={field.value}
                            setDate={field.onChange} // Pass RHF's onChange
                            placeholder="Select your date of birth"
                            toDate={new Date()} // Can't be born in the future
                            fromDate={new Date("1900-01-01")} // Reasonable minimum
                            ariaLabel="Select Date of Birth"
                        />
                        {isOnboarding && <FormDescription>Required for onboarding.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Class/Course */}
            <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Primary Class/Course</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your primary class or course" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {courses.length > 0 ? (
                                    courses.map((classItem) => (
                                        <SelectItem key={classItem.id} value={classItem.id}>
                                            {classItem.name} {/* Display course name/title */}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-courses" disabled>
                                        No courses available/enrolled
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {isOnboarding && <FormDescription>Select the main course you are enrolling in.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Account Type (Onboarding Only) */}
            {isOnboarding && (
                <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Account Type <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value} // Use controlled value
                                    defaultValue={field.value} // Set default
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="individual" /></FormControl>
                                        <FormLabel className="font-normal">Individual - Personal learning</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="institutional" /></FormControl>
                                        <FormLabel className="font-normal">Corporate - For teams/organizations</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormDescription>Select the type that best describes your usage.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Role-Specific Fields */}
            <RoleSpecificFields />

            {/* Read-Only Fields */}
            <div className="space-y-2">
                <Label htmlFor="email-readonly">Email</Label>
                <Input id="email-readonly" type="email" value={userEmail} disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="role-readonly">Role</Label>
                <Input id="role-readonly" value={userRole.charAt(0).toUpperCase() + userRole.slice(1)} disabled className="bg-muted/50 cursor-not-allowed capitalize" />
                <p className="text-xs text-muted-foreground">Role cannot be changed.</p>
            </div>

        </div>
    );
}