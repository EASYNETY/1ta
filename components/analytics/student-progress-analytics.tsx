"use client"

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { selectAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { safeArray, safeFilter, safeLength } from '@/lib/utils/safe-data'
import { format, subDays } from 'date-fns'

// Types for analytics data
interface ProgressDataPoint {
  date: string
  progress: number
}

interface CourseProgressData {
  courseId: string
  courseTitle: string
  progress: number
  quizScores: number
  assignmentCompletion: number
  lastActivity: string
}

interface ActivityDataPoint {
  date: string
  lessons: number
  quizzes: number
  assignments: number
}

const COLORS = ['#C99700', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export function StudentProgressAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30')

  // Get courses from Redux store
  const courses = useAppSelector(selectAuthCourses)

  // Generate progress data
  const generateProgressData = (): ProgressDataPoint[] => {
    const days = parseInt(timeRange)
    const data: ProgressDataPoint[] = []

    // Generate data points for each day in the selected time range
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)

      // Calculate a simulated progress value
      // In a real implementation, this would come from actual user activity data
      const baseProgress = courses.reduce((sum, course) => {
        const totalLessons = course.modules?.reduce((acc, module) =>
          acc + safeLength(module.lessons), 0) || 0

        const completedLessons = safeLength(course.completedLessons)
        return sum + (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0)
      }, 0) / Math.max(courses.length, 1)

      // Add some randomness to simulate daily fluctuations
      const randomFactor = Math.random() * 5 - 2.5 // Random value between -2.5 and 2.5
      const progress = Math.min(100, Math.max(0, baseProgress + randomFactor * (i / days)))

      data.push({
        date: format(date, 'MMM dd'),
        progress: Math.round(progress)
      })
    }

    return data
  }

  // Generate course progress data
  const generateCourseProgressData = (): CourseProgressData[] => {
    return courses.map(course => {
      // Calculate course progress
      const totalLessons = course.modules?.reduce((acc, module) =>
        acc + safeLength(module.lessons), 0) || 0

      const completedLessons = safeLength(course.completedLessons)
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Calculate quiz scores
      const quizScores = Object.values(course.quizScores || {}).reduce((sum, score) => sum + score, 0)
      const quizCount = Object.keys(course.quizScores || {}).length
      const averageQuizScore = quizCount > 0 ? Math.round(quizScores / quizCount) : 0

      // Calculate assignment completion
      const assignments = course.assignments || []
      const completedAssignments = assignments.filter(assignment =>
        assignment.status === 'completed' || assignment.status === 'graded'
      ).length
      const assignmentCompletion = assignments.length > 0
        ? Math.round((completedAssignments / assignments.length) * 100)
        : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        progress,
        quizScores: averageQuizScore,
        assignmentCompletion,
        lastActivity: course.lastActivityDate || 'N/A'
      }
    })
  }

  // Generate activity data
  const generateActivityData = (): ActivityDataPoint[] => {
    const days = parseInt(timeRange)
    const data: ActivityDataPoint[] = []

    // Generate data points for each day in the selected time range
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)

      // In a real implementation, this would come from actual user activity data
      // Here we're generating random values for demonstration
      data.push({
        date: format(date, 'MMM dd'),
        lessons: Math.floor(Math.random() * 5),
        quizzes: Math.floor(Math.random() * 2),
        assignments: Math.floor(Math.random() * 2)
      })
    }

    return data
  }

  // Generate distribution data for pie chart
  const generateDistributionData = () => {
    // Calculate total time spent on different activities
    // In a real implementation, this would come from actual user activity data
    return [
      { name: 'Lessons', value: 45 },
      { name: 'Quizzes', value: 20 },
      { name: 'Assignments', value: 25 },
      { name: 'Discussion', value: 10 }
    ]
  }

  const progressData = generateProgressData()
  const courseProgressData = generateCourseProgressData()
  const activityData = generateActivityData()
  const distributionData = generateDistributionData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Progress Analytics</h2>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Progress Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>
                Your overall learning progress across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 'auto', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" aspect={2}>
                  <LineChart data={progressData} margin={{ top: 20, right: 30, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#C99700"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Activity Distribution</CardTitle>
              <CardDescription>
                How your learning time is distributed across different activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 'auto', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" aspect={2}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Time Spent']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 mt-6">
          {/* Course Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Comparison</CardTitle>
              <CardDescription>
                Your progress across different courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 'auto', minHeight: '400px' }}>
                <ResponsiveContainer width="100%" aspect={1.5}>
                  <BarChart
                    data={courseProgressData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      type="category"
                      dataKey="courseTitle"
                      width={100}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    <Legend />
                    <Bar dataKey="progress" name="Overall Progress" fill="#C99700" />
                    <Bar dataKey="quizScores" name="Quiz Scores" fill="#8884d8" />
                    <Bar dataKey="assignmentCompletion" name="Assignment Completion" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-6">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Learning Activity</CardTitle>
              <CardDescription>
                Number of learning activities completed each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 'auto', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" aspect={2}>
                  <BarChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 5, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lessons" name="Lessons" fill="#C99700" />
                    <Bar dataKey="quizzes" name="Quizzes" fill="#8884d8" />
                    <Bar dataKey="assignments" name="Assignments" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
