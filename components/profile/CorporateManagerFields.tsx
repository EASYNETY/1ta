// components/profile/CorporateManagerFields.tsx

"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Building, BookOpen } from "lucide-react"

interface CorporateManagerFieldsProps {
    form: UseFormReturn<any>
    courses: Array<{ id: string; name: string }>
    purchasedStudentSlots?: number | null
    isExistingManager?: boolean
}

export function CorporateManagerFields({
    form,
    courses,
    purchasedStudentSlots = 0,
    isExistingManager = false,
}: CorporateManagerFieldsProps) {
    return (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-medium mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Corporate Management Details
            </h3>

            <div className="space-y-4">
                {/* Company Name */}
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company/Organization Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter your organization name" />
                            </FormControl>
                            <FormDescription>This will be used as your corporate identifier</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Current Student Slots - Only shown for existing managers */}
                {isExistingManager && (
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-blue-800 dark:text-blue-300">Current Student Slots</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    You currently have {purchasedStudentSlots || 0} student slots
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{purchasedStudentSlots || 0}</div>
                        </div>
                    </div>
                )}

                {/* Number of Students - For new managers or adding more slots */}
                <FormField
                    control={form.control}
                    name="initialStudentCount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isExistingManager ? "Additional Student Slots" : "Number of Students to Manage"}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number.parseInt(e.target.value) || 0)}
                                    value={field.value === undefined ? "" : field.value}
                                    placeholder={isExistingManager ? "Enter additional slots needed" : "Enter number of students"}
                                />
                            </FormControl>
                            <FormDescription>
                                {isExistingManager
                                    ? "How many additional student accounts do you need?"
                                    : "How many student accounts do you need to create?"}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Course Selection */}
                <FormField
                    control={form.control}
                    name="initialSelectedCourses"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center">
                                <BookOpen className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Courses to Assign
                            </FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={courses.map((course) => ({
                                        label: course.name,
                                        value: course.id,
                                    }))}
                                    placeholder="Select courses for your students"
                                    selected={field.value || []}
                                    onChange={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                            <FormDescription>Select the courses you want to assign to your students</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        {isExistingManager
                            ? "After updating, you'll be able to manage your additional student accounts from your corporate dashboard."
                            : "After completing registration, you'll be able to manage your student accounts, track their progress, and handle course assignments from your corporate dashboard."}
                    </p>
                </div>
            </div>
        </Card>
    )
}
