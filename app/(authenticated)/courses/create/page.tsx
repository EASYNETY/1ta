"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector } from "@/store/hooks"
import { useRouter } from "next/navigation"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Plus, Trash2, Upload, X, ChevronRight, ChevronLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Define the schema for course creation
const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subtitle: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string({
    required_error: "Please select a category",
  }),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"], {
    required_error: "Please select a level",
  }),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  discountPrice: z.coerce.number().min(0, "Discount price must be a positive number").optional(),
  language: z.string().default("English"),
  certificate: z.boolean().default(true),
  accessType: z.enum(["Lifetime", "Limited"]).default("Lifetime"),
  supportType: z.enum(["Instructor", "Community", "Both", "None"]).default("Both"),
  tags: z.string().optional(),
  learningOutcomes: z.string().optional(),
  prerequisites: z.string().optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CreateCoursePage() {
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modules, setModules] = useState<any[]>([
    {
      id: "module-1",
      title: "Module 1",
      description: "",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Lesson 1",
          type: "video",
          duration: "30",
          description: "",
        },
      ],
    },
  ])

  // Categories
  const categories = [
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

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      level: "All Levels",
      price: 0,
      discountPrice: 0,
      language: "English",
      certificate: true,
      accessType: "Lifetime",
      supportType: "Both",
      tags: "",
      learningOutcomes: "",
      prerequisites: "",
    },
  })

  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return (
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
  }

  const onSubmit: SubmitHandler<CourseFormValues> = async (data) => {
    try {
      setIsSubmitting(true)

      // Process form data
      const courseData = {
        ...data,
        modules,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        learningOutcomes: data.learningOutcomes ? data.learningOutcomes.split("\n").filter(Boolean) : [],
        prerequisites: data.prerequisites ? data.prerequisites.split("\n").filter(Boolean) : [],
      }

      console.log("Course Data:", courseData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Course Created",
        description: "Your course has been created successfully.",
        variant: "success",
      })

      // Redirect to courses page
      router.push("/courses")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create course"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a new module
  const addModule = () => {
    const newModuleId = `module-${modules.length + 1}`
    setModules([
      ...modules,
      {
        id: newModuleId,
        title: `Module ${modules.length + 1}`,
        description: "",
        lessons: [
          {
            id: `${newModuleId}-lesson-1`,
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
    if (modules.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "A course must have at least one module.",
        variant: "destructive",
      })
      return
    }

    const updatedModules = [...modules]
    updatedModules.splice(moduleIndex, 1)
    setModules(updatedModules)
  }

  // Update module data
  const updateModule = (moduleIndex: number, field: string, value: string) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex][field] = value
    setModules(updatedModules)
  }

  // Add a new lesson to a module
  const addLesson = (moduleIndex: number) => {
    const updatedModules = [...modules]
    const moduleId = updatedModules[moduleIndex].id
    const lessonCount = updatedModules[moduleIndex].lessons.length

    updatedModules[moduleIndex].lessons.push({
      id: `${moduleId}-lesson-${lessonCount + 1}`,
      title: `Lesson ${lessonCount + 1}`,
      type: "video",
      duration: "30",
      description: "",
    })

    setModules(updatedModules)
  }

  // Remove a lesson from a module
  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    if (modules[moduleIndex].lessons.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "A module must have at least one lesson.",
        variant: "destructive",
      })
      return
    }

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1)
    setModules(updatedModules)
  }

  // Update lesson data
  const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: string) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons[lessonIndex][field] = value
    setModules(updatedModules)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{user.role === "admin" ? "Create Course" : "Request New Course"}</h1>
      </div>

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">
          {user.role === "admin" ? "Creating a New Course" : "Requesting a New Course"}
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <p className="mb-2">
            {user.role === "admin"
              ? "Fill out the form below to create a new course. All fields marked with * are required."
              : "Fill out the form below to request a new course. Your request will be reviewed by an administrator."}
          </p>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <DyraneCard>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Learn HTML, CSS, JavaScript, React, and Node.js" />
                        </FormControl>
                        <FormDescription>
                          A brief subtitle that provides additional context about your course.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your course in detail..."
                            className="min-h-[200px]"
                          />
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
                      control={form.control}
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
                              {categories.map((category) => (
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
                      control={form.control}
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
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="All Levels">All Levels</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Indicate the difficulty level of your course.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., javascript, web development, programming" />
                        </FormControl>
                        <FormDescription>
                          Add relevant tags separated by commas to help students find your course.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Course Thumbnail</h3>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
                      <div className="text-center">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to browse</p>
                        <p className="text-xs text-muted-foreground mb-4">Recommended size: 1280x720px (16:9 ratio)</p>
                        <DyraneButton variant="outline" size="sm">
                          Upload Image
                        </DyraneButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div></div>
                  <DyraneButton type="button" onClick={() => setActiveTab("details")}>
                    Next: Course Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </DyraneButton>
                </CardFooter>
              </DyraneCard>
            </TabsContent>

            <TabsContent value="details">
              <DyraneCard>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="learningOutcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Outcomes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What students will learn from this course..."
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
                    control={form.control}
                    name="prerequisites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prerequisites</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What students should know before taking this course..."
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
                      control={form.control}
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
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                              <SelectItem value="Chinese">Chinese</SelectItem>
                              <SelectItem value="Japanese">Japanese</SelectItem>
                              <SelectItem value="Arabic">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the primary language of your course content.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
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
                          <FormDescription>
                            Choose whether to offer a completion certificate for this course.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                              <SelectItem value="Lifetime">Lifetime Access</SelectItem>
                              <SelectItem value="Limited">Limited Time Access</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Specify how long students will have access to the course.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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
                              <SelectItem value="Instructor">Instructor Support</SelectItem>
                              <SelectItem value="Community">Community Support</SelectItem>
                              <SelectItem value="Both">Both Instructor & Community</SelectItem>
                              <SelectItem value="None">No Support</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Specify the type of support available to students.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Promotional Video</h3>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50">
                      <div className="text-center">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Upload a promotional video for your course</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Recommended length: 2-5 minutes, MP4 format
                        </p>
                        <DyraneButton variant="outline" size="sm">
                          Upload Video
                        </DyraneButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <DyraneButton type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </DyraneButton>
                  <DyraneButton type="button" onClick={() => setActiveTab("curriculum")}>
                    Next: Curriculum
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </DyraneButton>
                </CardFooter>
              </DyraneCard>
            </TabsContent>

            <TabsContent value="curriculum">
              <DyraneCard>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Module {moduleIndex + 1}</h3>
                          <DyraneButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModule(moduleIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </DyraneButton>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-sm font-medium">Module Title</label>
                            <Input
                              value={module.title}
                              onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                              placeholder="Enter module title"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Module Description</label>
                            <Textarea
                              value={module.description}
                              onChange={(e) => updateModule(moduleIndex, "description", e.target.value)}
                              placeholder="Enter module description"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <h4 className="text-md font-medium mb-2">Lessons</h4>
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                          {module.lessons.map((lesson: any, lessonIndex: number) => (
                            <div key={lesson.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="text-sm font-medium">Lesson {lessonIndex + 1}</h5>
                                <DyraneButton
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </DyraneButton>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-medium">Lesson Title</label>
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
                                    placeholder="Enter lesson title"
                                    className="mt-1"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium">Type</label>
                                    <Select
                                      value={lesson.type}
                                      onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, "type", value)}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="download">Download</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className="text-xs font-medium">Duration (minutes)</label>
                                    <Input
                                      type="number"
                                      value={lesson.duration}
                                      onChange={(e) =>
                                        updateLesson(moduleIndex, lessonIndex, "duration", e.target.value)
                                      }
                                      placeholder="Duration"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium">Description</label>
                                <Textarea
                                  value={lesson.description}
                                  onChange={(e) =>
                                    updateLesson(moduleIndex, lessonIndex, "description", e.target.value)
                                  }
                                  placeholder="Enter lesson description"
                                  className="mt-1"
                                />
                              </div>
                            </div>
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
                    ))}

                    <DyraneButton type="button" variant="outline" onClick={addModule}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Module
                    </DyraneButton>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <DyraneButton type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </DyraneButton>
                  <DyraneButton type="button" onClick={() => setActiveTab("pricing")}>
                    Next: Pricing & Settings
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </DyraneButton>
                </CardFooter>
              </DyraneCard>
            </TabsContent>

            <TabsContent value="pricing">
              <DyraneCard>
                <CardHeader>
                  <CardTitle>Pricing & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD) *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="e.g., 49.99" />
                          </FormControl>
                          <FormDescription>Set the regular price for your course in USD.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Price (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="e.g., 39.99" />
                          </FormControl>
                          <FormDescription>Set a discounted price for promotions (optional).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Payment Integration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center p-3 border rounded-md">
                        <div className="flex-1">
                          <h4 className="font-medium">Paystack</h4>
                          <p className="text-sm text-muted-foreground">Accept payments via Paystack</p>
                        </div>
                        <DyraneButton variant="outline" size="sm">
                          Configure
                        </DyraneButton>
                      </div>

                      <div className="flex items-center p-3 border rounded-md">
                        <div className="flex-1">
                          <h4 className="font-medium">Stripe</h4>
                          <p className="text-sm text-muted-foreground">Accept payments via Stripe</p>
                        </div>
                        <DyraneButton variant="outline" size="sm">
                          Configure
                        </DyraneButton>
                      </div>

                      <div className="flex items-center p-3 border rounded-md">
                        <div className="flex-1">
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-muted-foreground">Accept payments via PayPal</p>
                        </div>
                        <DyraneButton variant="outline" size="sm">
                          Configure
                        </DyraneButton>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Course Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h4 className="font-medium">Course Visibility</h4>
                          <p className="text-sm text-muted-foreground">Control who can see your course</p>
                        </div>
                        <Select defaultValue="public">
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
                        <Input type="number" placeholder="No limit" className="w-[180px]" />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h4 className="font-medium">Course Start Date</h4>
                          <p className="text-sm text-muted-foreground">When will the course be available</p>
                        </div>
                        <Input type="date" className="w-[180px]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <DyraneButton type="button" variant="outline" onClick={() => setActiveTab("curriculum")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </DyraneButton>
                  <DyraneButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Course..." : "Create Course"}
                  </DyraneButton>
                </CardFooter>
              </DyraneCard>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
