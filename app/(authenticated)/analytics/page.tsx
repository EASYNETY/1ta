"use client"

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { PageHeader } from '@/components/layout/auth/page-header'
import { StudentProgressAnalytics } from '@/components/analytics/student-progress-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('progress')
  const dispatch = useAppDispatch()

  // Get auth state and courses from Redux store
  const { user, isAuthenticated, isInitialized } = useAppSelector(state => state.auth)
  const { courses, status } = useAppSelector(state => state.auth_courses)

  // Fetch courses if needed
  useEffect(() => {
    if (isAuthenticated && user && status === 'idle') {
      dispatch(fetchAuthCourses())
    }
  }, [dispatch, isAuthenticated, user, status])

  // Loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to view your analytics.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Analytics"
        subheading="Track your learning progress and performance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 mt-6">
          {status === 'loading' ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : status === 'failed' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load analytics data. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <StudentProgressAnalytics />
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Detailed analysis of your performance across courses
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] h-auto flex items-center justify-center">
              <p className="text-muted-foreground">
                Performance analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Recommendations based on your learning patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] h-auto flex items-center justify-center">
              <p className="text-muted-foreground">
                Personalized recommendations coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
