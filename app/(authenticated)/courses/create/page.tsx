// app/(authenticated)/courses/create/page.tsx
"use client"

import React, { useState } from "react"
import { useForm, type SubmitHandler, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector } from "@/store/hooks" // Assuming this path is correct
import { useRouter } from "next/navigation"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card" // Assuming this path is correct
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card" // Assuming this path is correct
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button" // Assuming this path is correct
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form" // Assuming this path is correct
import { Input } from "@/components/ui/input" // Assuming this path is correct
import { Textarea } from "@/components/ui/textarea" // Assuming this path is correct
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Assuming this path is correct
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Assuming this path is correct
import { useToast } from "@/hooks/use-toast" // Assuming this path is correct
import { AlertCircle, Plus, Trash2, Upload, X, ChevronRight, ChevronLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Assuming this path is correct
import Link from "next/link"

// --- Type Definitions ---

// Define a placeholder User type - replace with your actual User type from Redux state if available
interface User {
  id: string
  role: "admin" | "teacher" | "student" | string // Adjust roles as needed
  // Add other relevant user properties
}

// Define the structure for a Lesson
interface Lesson {
  id: string
  title: string
  type: "video" | "quiz" | "assignment" | "text" | "download"
  duration: string // Keep as string to match input state, parse if needed for calculations
  description: string
}

// Define the structure for a Module
interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

// Define the schema for course creation using Zod
const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subtitle: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string({
    required_error: "Please select a category.",
  }),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"], {
    required_error: "Please select a level.",
  }),
  price: z.coerce.number().min(0, "Price must be a positive number or zero."), // Allow 0
  discountPrice: z.coerce.number().min(0, "Discount price must be a positive number or zero.").optional(),
  language: z.string().default("English"),
  certificate: z.boolean().default(true),
  accessType: z.enum(["Lifetime", "Limited"]).default("Lifetime"),
  supportType: z.enum(["Instructor", "Community", "Both", "None"]).default("Both"),
  tags: z.string().optional(),
  learningOutcomes: z.string().optional(), // Will be split into array later
  prerequisites: z.string().optional(), // Will be split into array later
})

// Infer the type from the schema
type CourseFormValues = z.infer<typeof courseSchema>

// --- Constants ---
const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
  "Project Management",
  "Business",
  "Design",
  "Marketing",
]

const LEVELS: CourseFormValues["level"][] = ["Beginner", "Intermediate", "Advanced", "All Levels"]
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic"]
const ACCESS_TYPES: CourseFormValues["accessType"][] = ["Lifetime", "Limited"]
const SUPPORT_TYPES: CourseFormValues["supportType"][] = ["Instructor", "Community", "Both", "None"]
const LESSON_TYPES: Lesson["type"][] = ["video", "quiz", "assignment", "text", "download"]

// --- Helper Components ---

// Component for Access Denied Message
const AccessDeniedMessage: React.FC = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="text-muted-foreground mt-2">You don't have permission to create courses.</p>
      <DyraneButton asChild className="mt-4">
        <Link href="/courses">Back to Courses</Link>
      </DyraneButton>
    </div>
  </div>
)

// --- Tab Content Components ---

interface TabProps {
  control: Control<CourseFormValues>
}

interface NavigationProps {
  onBack?: () => void
  onNext?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

// --- Basic Info Tab ---
interface BasicInfoTabProps extends TabProps, NavigationProps { }

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ control, onNext }) => (
  <DyraneCard>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Title *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., Web Development Bootcamp" />
            </FormControl>
            <FormDescription>Choose a clear and concise title that describes your course.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="subtitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Subtitle</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., Learn HTML, CSS, JavaScript, React, and Node.js" />
            </FormControl>
            <FormDescription>A brief subtitle that provides additional context about your course.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Description *</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Describe your course in detail..." className="min-h-[200px]" />
            </FormControl>
            <FormDescription>
              Provide a comprehensive description of your course, including what students will learn.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose the category that best fits your course.</FormDescription>
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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Indicate the difficulty level of your course.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., javascript, web development, programming" />
            </FormControl>
            <FormDescription>Add relevant tags separated by commas to help students find your course.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Thumbnail Upload Placeholder */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Course Thumbnail</h3>
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
          <div className="text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to browse</p>
            <p className="text-xs text-muted-foreground mb-4">Recommended size: 1280x720px (16:9 ratio)</p>
            <DyraneButton type="button" variant="outline" size="sm">
              Upload Image
            </DyraneButton>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end">
      {onNext && (
        <DyraneButton type="button" onClick={onNext}>
          Next: Course Details
          <ChevronRight className="ml-2 h-4 w-4" />
        </DyraneButton>
      )}
    </CardFooter>
  </DyraneCard>
)

// --- Course Details Tab ---
interface CourseDetailsTabProps extends TabProps, NavigationProps { }

const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({ control, onBack, onNext }) => (
  <DyraneCard>
    <CardHeader>
      <CardTitle>Course Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <FormField
        control={control}
        name="learningOutcomes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Learning Outcomes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="What students will learn from this course (one item per line)..."
                className="min-h-[150px]"
              />
            </FormControl>
            <FormDescription>
              List the key learning outcomes, one per line. These will be displayed as bullet points.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="prerequisites"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prerequisites</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="What students should know before taking this course (one item per line)..."
                className="min-h-[150px]"
              />
            </FormControl>
            <FormDescription>
              List any prerequisites, one per line. These will be displayed as bullet points.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the primary language of your course content.</FormDescription>
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
              <Select
                onValueChange={(value) => field.onChange(value === "true")} // Convert string back to boolean
                defaultValue={String(field.value)} // Convert boolean to string for Select defaultValue
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Yes, offer a certificate</SelectItem>
                  <SelectItem value="false">No certificate</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose whether to offer a completion certificate for this course.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="accessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "Lifetime" ? "Lifetime Access" : "Limited Time Access"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Specify how long students will have access to the course.</FormDescription>
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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select support type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "Both" ? "Both Instructor & Community" : `${type} Support`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Specify the type of support available to students.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Promotional Video Upload Placeholder */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Promotional Video</h3>
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
          <div className="text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Upload a promotional video for your course</p>
            <p className="text-xs text-muted-foreground mb-4">Recommended length: 2-5 minutes, MP4 format</p>
            <DyraneButton type="button" variant="outline" size="sm">
              Upload Video
            </DyraneButton>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      {onBack && (
        <DyraneButton type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </DyraneButton>
      )}
      {onNext && (
        <DyraneButton type="button" onClick={onNext}>
          Next: Curriculum
          <ChevronRight className="ml-2 h-4 w-4" />
        </DyraneButton>
      )}
    </CardFooter>
  </DyraneCard>
)

// --- Curriculum Tab ---

interface LessonItemProps {
  lesson: Lesson
  moduleIndex: number
  lessonIndex: number
  updateLesson: (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: string | Lesson["type"]) => void
  removeLesson: (moduleIndex: number, lessonIndex: number) => void
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  moduleIndex,
  lessonIndex,
  updateLesson,
  removeLesson,
}) => (
  <div className="border rounded-lg p-3">
    <div className="flex justify-between items-center mb-3">
      <h5 className="text-sm font-medium">Lesson {lessonIndex + 1}</h5>
      <DyraneButton type="button" variant="ghost" size="sm" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
        <X className="h-4 w-4 text-red-500" />
      </DyraneButton>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      <div>
        <label htmlFor={`lesson-title-${lesson.id}`} className="text-xs font-medium">
          Lesson Title
        </label>
        <Input
          id={`lesson-title-${lesson.id}`}
          value={lesson.title}
          onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
          placeholder="Enter lesson title"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`lesson-type-${lesson.id}`} className="text-xs font-medium">
            Type
          </label>
          <Select
            value={lesson.type}
            onValueChange={(value: Lesson["type"]) => updateLesson(moduleIndex, lessonIndex, "type", value)}
          >
            <SelectTrigger id={`lesson-type-${lesson.id}`} className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {LESSON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor={`lesson-duration-${lesson.id}`} className="text-xs font-medium">
            Duration (minutes)
          </label>
          <Input
            id={`lesson-duration-${lesson.id}`}
            type="number"
            value={lesson.duration}
            min="0"
            onChange={(e) => updateLesson(moduleIndex, lessonIndex, "duration", e.target.value)}
            placeholder="e.g., 30"
            className="mt-1"
          />
        </div>
      </div>
    </div>

    <div>
      <label htmlFor={`lesson-desc-${lesson.id}`} className="text-xs font-medium">
        Description
      </label>
      <Textarea
        id={`lesson-desc-${lesson.id}`}
        value={lesson.description}
        onChange={(e) => updateLesson(moduleIndex, lessonIndex, "description", e.target.value)}
        placeholder="Enter lesson description (optional)"
        className="mt-1"
        rows={2}
      />
    </div>
  </div>
)

interface ModuleItemProps {
  module: Module
  moduleIndex: number
  updateModule: (moduleIndex: number, field: keyof Pick<Module, "title" | "description">, value: string) => void
  removeModule: (moduleIndex: number) => void
  addLesson: (moduleIndex: number) => void
  updateLesson: (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: string | Lesson["type"]) => void
  removeLesson: (moduleIndex: number, lessonIndex: number) => void
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  moduleIndex,
  updateModule,
  removeModule,
  addLesson,
  updateLesson,
  removeLesson,
}) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">Module {moduleIndex + 1}</h3>
      <DyraneButton type="button" variant="ghost" size="sm" onClick={() => removeModule(moduleIndex)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </DyraneButton>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <label htmlFor={`module-title-${module.id}`} className="text-sm font-medium">
          Module Title
        </label>
        <Input
          id={`module-title-${module.id}`}
          value={module.title}
          onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
          placeholder="Enter module title"
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor={`module-desc-${module.id}`} className="text-sm font-medium">
          Module Description
        </label>
        <Textarea
          id={`module-desc-${module.id}`}
          value={module.description}
          onChange={(e) => updateModule(moduleIndex, "description", e.target.value)}
          placeholder="Enter module description (optional)"
          className="mt-1"
          rows={3}
        />
      </div>
    </div>

    <h4 className="text-md font-medium mb-2">Lessons</h4>
    <div className="space-y-4 pl-4 border-l-2 border-muted">
      {module.lessons.map((lesson, lessonIndex) => (
        <LessonItem
          key={lesson.id}
          lesson={lesson}
          moduleIndex={moduleIndex}
          lessonIndex={lessonIndex}
          updateLesson={updateLesson}
          removeLesson={removeLesson}
        />
      ))}

      <DyraneButton
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addLesson(moduleIndex)}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Lesson
      </DyraneButton>
    </div>
  </div>
)

interface CurriculumTabProps extends NavigationProps {
  modules: Module[]
  setModules: React.Dispatch<React.SetStateAction<Module[]>>
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({ modules, setModules, onBack, onNext }) => {
  const { toast } = useToast()

  // Add a new module
  const addModule = () => {
    const newModuleId = `module-${Date.now()}` // Use timestamp for uniqueness
    setModules((prevModules) => [
      ...prevModules,
      {
        id: newModuleId,
        title: `Module ${prevModules.length + 1}`,
        description: "",
        lessons: [
          {
            id: `${newModuleId}-lesson-${Date.now() + 1}`, // Unique lesson ID
            title: "Lesson 1",
            type: "video",
            duration: "30",
            description: "",
          },
        ],
      },
    ])
  }

  // Remove a module
  const removeModule = (moduleIndex: number) => {
    if (modules.length <= 1) {
      toast({
        title: "Cannot Remove Module",
        description: "A course must have at least one module.",
        variant: "destructive",
      })
      return
    }
    setModules((prevModules) => prevModules.filter((_, index) => index !== moduleIndex))
  }

  // Update module data (only title and description handled here)
  const updateModule = (moduleIndex: number, field: keyof Pick<Module, "title" | "description">, value: string) => {
    setModules((prevModules) =>
      prevModules.map((mod, index) => (index === moduleIndex ? { ...mod, [field]: value } : mod))
    )
  }

  // Add a new lesson to a module
  const addLesson = (moduleIndex: number) => {
    setModules((prevModules) =>
      prevModules.map((mod, index) => {
        if (index === moduleIndex) {
          const lessonCount = mod.lessons.length
          const newLessonId = `${mod.id}-lesson-${Date.now()}` // Unique ID
          return {
            ...mod,
            lessons: [
              ...mod.lessons,
              {
                id: newLessonId,
                title: `Lesson ${lessonCount + 1}`,
                type: "video",
                duration: "30",
                description: "",
              },
            ],
          }
        }
        return mod
      })
    )
  }

  // Remove a lesson from a module
  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    if (modules[moduleIndex]?.lessons.length <= 1) {
      toast({
        title: "Cannot Remove Lesson",
        description: "A module must have at least one lesson.",
        variant: "destructive",
      })
      return
    }
    setModules((prevModules) =>
      prevModules.map((mod, mIndex) =>
        mIndex === moduleIndex
          ? {
            ...mod,
            lessons: mod.lessons.filter((_, lIndex) => lIndex !== lessonIndex),
          }
          : mod
      )
    )
  }

  // Update lesson data
  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string | Lesson["type"]
  ) => {
    setModules((prevModules) =>
      prevModules.map((mod, mIndex) =>
        mIndex === moduleIndex
          ? {
            ...mod,
            lessons: mod.lessons.map((lesson, lIndex) =>
              lIndex === lessonIndex ? { ...lesson, [field]: value } : lesson
            ),
          }
          : mod
      )
    )
  }

  return (
    <DyraneCard>
      <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <ModuleItem
              key={module.id}
              module={module}
              moduleIndex={moduleIndex}
              updateModule={updateModule}
              removeModule={removeModule}
              addLesson={addLesson}
              updateLesson={updateLesson}
              removeLesson={removeLesson}
            />
          ))}

          <DyraneButton type="button" variant="outline" onClick={addModule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </DyraneButton>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onBack && (
          <DyraneButton type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </DyraneButton>
        )}
        {onNext && (
          <DyraneButton type="button" onClick={onNext}>
            Next: Pricing & Settings
            <ChevronRight className="ml-2 h-4 w-4" />
          </DyraneButton>
        )}
      </CardFooter>
    </DyraneCard>
  )
}

// --- Pricing & Settings Tab ---
interface PricingSettingsTabProps extends TabProps, NavigationProps { }

const PricingSettingsTab: React.FC<PricingSettingsTabProps> = ({ control, isSubmitting, onBack, submitLabel }) => (
  <DyraneCard>
    <CardHeader>
      <CardTitle>Pricing & Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (USD) *</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} placeholder="e.g., 49.99 or 0 for free" />
              </FormControl>
              <FormDescription>Set the regular price for your course in USD (0 for free).</FormDescription>
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
                <Input type="number" min="0" step="0.01" {...field} placeholder="e.g., 39.99" />
              </FormControl>
              <FormDescription>Set a discounted price for promotions (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Placeholder Payment Integration Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Payment Integration (Placeholder)</h3>
        <div className="space-y-4">
          {["Paystack", "Stripe", "PayPal"].map((provider) => (
            <div key={provider} className="flex items-center p-3 border rounded-md">
              <div className="flex-1">
                <h4 className="font-medium">{provider}</h4>
                <p className="text-sm text-muted-foreground">Accept payments via {provider}</p>
              </div>
              <DyraneButton type="button" variant="outline" size="sm" disabled>
                Configure
              </DyraneButton>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder Course Settings Section */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Course Settings (Placeholder)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <h4 className="font-medium">Course Visibility</h4>
              <p className="text-sm text-muted-foreground">Control who can see your course</p>
            </div>
            <Select defaultValue="public" disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <h4 className="font-medium">Enrollment Limit</h4>
              <p className="text-sm text-muted-foreground">Set a maximum number of students</p>
            </div>
            <Input type="number" placeholder="No limit" className="w-[180px]" disabled />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <h4 className="font-medium">Course Start Date</h4>
              <p className="text-sm text-muted-foreground">When will the course be available</p>
            </div>
            <Input type="date" className="w-[180px]" disabled />
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      {onBack && (
        <DyraneButton type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </DyraneButton>
      )}
      <DyraneButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : submitLabel ?? "Create Course"}
      </DyraneButton>
    </CardFooter>
  </DyraneCard>
)

// --- Main Page Component ---

export default function CreateCoursePage() {
  const { user } = useAppSelector((state) => state.auth as { user: User | null }) // Cast state.auth or ensure selector provides typed user
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("basic")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize Modules state with proper types
  const [modules, setModules] = useState<Module[]>([
    {
      id: `module-${Date.now()}`, // Use timestamp for initial unique ID
      title: "Module 1",
      description: "",
      lessons: [
        {
          id: `lesson-${Date.now() + 1}`, // Use timestamp for initial unique ID
          title: "Lesson 1",
          type: "video",
          duration: "30",
          description: "",
        },
      ],
    },
  ])

  // Initialize react-hook-form
  // Initialize react-hook-form
  const form = useForm<CourseFormValues>({
    // @ts-ignore
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "", // Keep as "" for optional inputs if desired initial state
      description: "",
      category: "Project Management", // <--- FIX: Change undefined to empty string ""
      level: "All Levels",
      price: 0,
      discountPrice: undefined, // undefined is correct for optional numbers
      language: "English",
      certificate: true,
      accessType: "Lifetime",
      supportType: "Both",
      tags: "", // Keep as "" for optional inputs if desired initial state
      learningOutcomes: "", // Keep as ""
      prerequisites: "", // Keep as ""
    },
    mode: "onChange", // Optional: Validate on change
  })

  // Check user authorization
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return <AccessDeniedMessage />
  }

  // Form submission handler
  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      // Basic validation: Check if there are modules and lessons
      if (modules.length === 0 || modules.some((m) => m.lessons.length === 0)) {
        toast({
          title: "Curriculum Incomplete",
          description: "Please ensure every module has at least one lesson.",
          variant: "destructive",
        })
        setActiveTab("curriculum") // Navigate to curriculum tab
        setIsSubmitting(false)
        return
      }

      // Process form data (split strings into arrays)
      const courseData = {
        ...data,
        modules, // Add the curriculum state
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        learningOutcomes: data.learningOutcomes ? data.learningOutcomes.split("\n").filter(Boolean) : [],
        prerequisites: data.prerequisites ? data.prerequisites.split("\n").filter(Boolean) : [],
        // Add instructorId, thumbnail URL, promo video URL etc. from actual uploads/state
        instructorId: user.id, // Example: associating the course with the logged-in user
      }

      console.log("Submitting Course Data:", courseData)

      // --- Replace with your actual API call ---
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay
      // const response = await fetch('/api/courses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(courseData),
      // });
      // if (!response.ok) {
      //   throw new Error('Failed to create course. Server responded with ' + response.status);
      // }
      // const result = await response.json();
      // console.log('API Response:', result);
      // --- End of API call ---

      toast({
        title: user.role === "admin" ? "Course Created" : "Course Request Submitted",
        description:
          user.role === "admin"
            ? "The new course has been created successfully."
            : "Your course request has been submitted for review.",
        variant: "success",
      })

      router.push("/courses") // Redirect after successful submission
    } catch (error) {
      console.error("Course creation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTeacher = user.role === "teacher"
  const submitButtonLabel = isTeacher ? "Request Course Creation" : "Create Course"

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{isTeacher ? "Request New Course" : "Create New Course"}</h1>
      </div>

      {/* Informational Alert */}
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">
          {isTeacher ? "Requesting a New Course" : "Creating a New Course"}
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          {isTeacher
            ? "Fill out the form below to request a new course. Your request will be reviewed by an administrator. Ensure all details are accurate."
            : "Fill out the form below to create a new course. All fields marked with * are required. You can save as draft later."}
        </AlertDescription>
      </Alert>

      {/* Main Form and Tabs */}
      <Form {...form}>
        {/* @ts-ignore */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="basic">1. Basic Info</TabsTrigger>
              <TabsTrigger value="details">2. Details</TabsTrigger>
              <TabsTrigger value="curriculum">3. Curriculum</TabsTrigger>
              <TabsTrigger value="pricing">4. Pricing</TabsTrigger>
            </TabsList>

            {/* Tab ContentPanels */}
            <TabsContent value="basic">
              {/* @ts-ignore */}
              <BasicInfoTab control={form.control} onNext={() => setActiveTab("details")} />
            </TabsContent>

            <TabsContent value="details">
              <CourseDetailsTab
                // @ts-ignore 
                control={form.control}
                onBack={() => setActiveTab("basic")}
                onNext={() => setActiveTab("details")}
              />
            </TabsContent>

            <TabsContent value="curriculum">
              <CurriculumTab
                modules={modules}
                setModules={setModules}
                onBack={() => setActiveTab("details")}
                onNext={() => setActiveTab("pricing")}
              />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingSettingsTab
                // @ts-ignore 
                control={form.control}
                isSubmitting={isSubmitting}
                onBack={() => setActiveTab("curriculum")}
                submitLabel={submitButtonLabel}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}