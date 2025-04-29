"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { addItem } from "@/features/cart/store/cart-slice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, BookOpen, Users, Clock, GraduationCap } from "lucide-react"
import Link from "next/link"
import { post } from "@/lib/api-client"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  enrolled?: boolean
  price: number
  discountPrice?: number
  image?: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const courseId = params.id as string

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        // In a real implementation, this would be an API call
        // const data = await get(`/courses/${courseId}`)

        // Mock data for demonstration
        const mockCourse = {
          id: courseId,
          title: "Introduction to Mathematics",
          description:
            "Learn the fundamentals of mathematics including algebra, geometry, and calculus. This course is designed for beginners and provides a solid foundation for further studies in mathematics and related fields. Students will learn through interactive lessons, problem-solving exercises, and real-world applications.",
          instructor: "Dr. Jane Smith",
          enrolled: courseId === "1" || courseId === "3",
          price: 99.99,
          discountPrice: 49.99,
          image:
            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        }

        setCourse(mockCourse)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, toast])

  const handleEnroll = async () => {
    if (!course) return

    // If user is not authenticated, add to cart and redirect to signup
    if (!isAuthenticated) {
      dispatch(
        addItem({
          courseId: courseId,
          title: course.title,
          price: 99.99, // Replace with actual course price
          instructor: course.instructor,
          image: "/placeholder.svg?height=200&width=300", // Replace with actual course image
        }),
      )

      router.push(`/cart`)
      return
    }

    try {
      setIsEnrolling(true)

      // In a real implementation, this would be an API call
      await post(`/courses/${courseId}/enroll`, {})

      setCourse({ ...course, enrolled: true })

      toast({
        title: "Enrolled successfully",
        description: `You are now enrolled in ${course.title}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll in the course",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleAddToCart = () => {
    if (!course) return

    setIsAddingToCart(true)

    try {
      dispatch(
        addItem({
          courseId: course.id,
          title: course.title,
          price: course.price,
          discountPrice: course.discountPrice,
          image: course.image,
          instructor: course.instructor,
        }),
      )

      toast({
        title: "Added to cart",
        description: `${course.title} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add course to cart",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading course details...</div>
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <p className="text-muted-foreground mt-2">The course you're looking for doesn't exist or has been removed.</p>
        <DyraneButton asChild className="mt-6">
          <Link href="/courses">Back to Courses</Link>
        </DyraneButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </DyraneButton>
        <h1 className="text-3xl font-bold">{course.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <DyraneCard>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{course.description}</p>
            </CardContent>
          </DyraneCard>

          <DyraneCard>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Understand fundamental mathematical concepts</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Solve algebraic equations and geometric problems</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Apply mathematical principles to real-world scenarios</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Develop critical thinking and analytical skills</span>
                </li>
              </ul>
            </CardContent>
          </DyraneCard>
        </div>

        <div className="space-y-6">
          <DyraneCard>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Instructor: {course.instructor}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Duration: 8 weeks</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Level: Beginner</span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">Price:</span>
                  <div className="text-right">
                    {course.discountPrice ? (
                      <>
                        <span className="text-lg font-bold">${course.discountPrice.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${course.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">${course.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {user?.role === "student" ? (
                course.enrolled ? (
                  <DyraneButton className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning
                  </DyraneButton>
                ) : (
                  <>
                    <DyraneButton className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    </DyraneButton>
                    <DyraneButton
                      variant="outline"
                      className="w-full"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Add to Cart
                    </DyraneButton>
                  </>
                )
              ) : isAuthenticated ? (
                <DyraneButton variant="outline" className="w-full" asChild>
                  <Link href={`/courses/${course.id}/edit`}>Edit Course</Link>
                </DyraneButton>
              ) : (
                <>
                  <DyraneButton className="w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Add to Cart
                  </DyraneButton>
                  <DyraneButton variant="outline" className="w-full" asChild>
                    <Link href="/login">Login to Enroll</Link>
                  </DyraneButton>
                </>
              )}
            </CardFooter>
          </DyraneCard>

          <DyraneCard>
            <CardHeader>
              <CardTitle>Students Enrolled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Total Students</span>
                <span className="font-bold">42</span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-primary/20">
                <div className="h-full w-[70%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">70% of maximum capacity</p>
            </CardContent>
          </DyraneCard>
        </div>
      </div>
    </div>
  )
}
