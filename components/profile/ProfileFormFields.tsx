// components/profile/ProfileFormFields.tsx
"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithYearMonth } from "@/components/ui/date-picker-with-year-month"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import type { UserRole } from "@/types/user.types"

interface ProfileFormFieldsProps {
    form: UseFormReturn<any>
    courses: Array<{ id: string; name: string }>
    userRole: UserRole
    userEmail: string
    isOnboarding: boolean
    isCorporateStudent?: boolean
    isCorporateManager?: boolean
}

export function ProfileFormFields({
    form,
    courses,
    userRole,
    userEmail,
    isOnboarding,
    isCorporateStudent = false,
    isCorporateManager = false,
}: ProfileFormFieldsProps) {
    // Role-specific fields component
    const RoleSpecificFields = () => {
        switch (userRole) {
            case "admin":
                return (
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="e.g., +234..." />
                                </FormControl>
                                <FormDescription>For emergency contact purposes</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
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
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ""} placeholder="e.g., +234..." />
                                    </FormControl>
                                    <FormDescription>For administrative contact</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subjects"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subjects/Areas of Expertise</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                                            placeholder="e.g., Mathematics, Physics, Computer Science"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                const subjects = value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean)
                                                field.onChange(subjects.length > 0 ? subjects : null)
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>Comma-separated list of your teaching subjects</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="officeHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Office Hours (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ""} placeholder="e.g., Mon-Fri 2-4 PM" />
                                    </FormControl>
                                    <FormDescription>When students can reach you</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )
            default: // student
                return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Name */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter your full name" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Address - Only for students */}
            {userRole === "student" && (
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="Enter your address"
                                    className="min-h-[80px]"
                                />
                            </FormControl>
                            <FormDescription>Your physical address for correspondence</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Date of Birth - Not required for corporate managers */}
            {userRole === "student" && !isCorporateManager && (
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <DatePickerWithYearMonth
                                date={field.value}
                                setDate={(date) => {
                                    console.log("Setting date of birth:", date);
                                    field.onChange(date);
                                }}
                                placeholder="Select your date of birth"
                                toDate={new Date()}
                                fromDate={new Date("1900-01-01")}
                                ariaLabel="Select Date of Birth"
                            />
                            <FormDescription>
                                {field.value ? `Selected: ${field.value.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}` : "No date selected"}
                            </FormDescription>
                            {isOnboarding && !isCorporateManager && (
                                <FormDescription>Required for individual students.</FormDescription>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Class/Course - Read-only for corporate students */}
            {userRole === "student" && (
                <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Course</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={isCorporateStudent}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your primary course" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courses.length > 0 ? (
                                        courses.map((classItem) => (
                                            <SelectItem key={classItem.id} value={classItem.id}>
                                                {classItem.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-courses" disabled>
                                            No courses available/enroled
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {isCorporateStudent && (
                                <FormDescription>Your course is pre-assigned by your organization.</FormDescription>
                            )}
                            {isOnboarding && !isCorporateStudent && !isCorporateManager && (
                                <FormDescription>Select the main course you are enroling in.</FormDescription>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Account Type (Onboarding Only) - Not for corporate students */}
            {isOnboarding && !isCorporateStudent && userRole === "student" && (
                <>
                    <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>
                                    Account Type <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="individual" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Individual - Personal learning</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="institutional" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Corporate - For teams/organizations</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormDescription>Select the type that best describes your usage.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Corporate Registration Toggle - Only for new users during onboarding and accountType not individual */}
                    {isOnboarding && !isCorporateStudent && !isCorporateManager && form.watch("accountType") !== "individual" && (
                        <FormField
                            control={form.control}
                            name="isCorporateRegistration"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Registering on behalf of an organization?</FormLabel>
                                        <FormDescription>Check this if you are registering to manage corporate students.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}
                </>
            )}

            {/* Role-Specific Fields */}
            <RoleSpecificFields />

            {/* Read-Only Fields */}
            <div className="space-y-2">
                <Label htmlFor="email-readonly">Email</Label>
                <Input id="email-readonly" type="email" value={userEmail} disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            {/* <div className="space-y-2">
                <Label htmlFor="role-readonly">Role</Label>
                <Input
                    id="role-readonly"
                    value={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    disabled
                    className="bg-muted/50 cursor-not-allowed capitalize"
                />
                <p className="text-xs text-muted-foreground">Role cannot be changed.</p>
            </div> */}
        </div>
    )
}
