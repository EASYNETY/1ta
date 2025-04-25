// features/auth/components/register-form.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/features/auth/store/auth-slice"
import { post } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import Image from "next/image"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "teacher"]),
    courseId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentTheme = !mounted ? 'light' : (theme === "system" ? systemTheme : theme);
  useEffect(() => setMounted(true), []);


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
      courseId: courseId || undefined,
    },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true)
      setServerError(null)

      // Remove confirmPassword before sending to API
      const { confirmPassword, courseId, ...registerData } = data

      // Make API request
      const response = await post("/auth/register", registerData, { requiresAuth: false }) as any

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        }),
      )

      // If there's a courseId, enroll the user in the course
      if (courseId) {
        try {
          await post(`/courses/${courseId}/enroll`, {}, { requiresAuth: true })
        } catch (error) {
          console.error("Failed to enroll in course:", error)
          // Continue with the flow even if enrollment fails
        }
      }

      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setServerError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">                    {mounted && (
          <Image
            src={currentTheme === "dark" ? "/logo_dark.png" : "/logo.png"}
            alt="1techacademy Logo"
            className="h-6 w-auto"
            priority
            width={80}
            height={24}
          />
        )}
          {!mounted && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>}</CardTitle>
        {courseId && <p className="text-center text-muted-foreground mt-2">Register to enroll in this course</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a</Label>
            <Select defaultValue="student" onValueChange={(value) => setValue("role", value as "student" | "teacher")}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* Hidden field for courseId */}
          <input type="hidden" {...register("courseId")} />

          {serverError && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{serverError}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href={courseId ? `/login?courseId=${courseId}` : "/login"} className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
