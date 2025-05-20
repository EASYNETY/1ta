# Personalized Elements

## Overview

Personalized elements enhance the user experience by tailoring content and interactions to individual users. This document outlines the implementation of four key personalized elements:

1. **Learning Path Recommendations**: Personalized course recommendations
2. **Personalized Dashboard**: Customizable dashboard widgets
3. **Learning Progress Visualization**: Interactive progress tracking
4. **Learning Streaks & Gamification**: Engagement features

## Learning Path Recommendations

The Learning Path Recommendations component displays personalized course recommendations based on the user's interests, completed courses, and learning goals.

```jsx
// components/recommendations/LearningPathRecommendations.tsx
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchRecommendations } from '@/features/recommendations/store/recommendations-slice';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { CourseCard } from '@/components/courses/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';

export function LearningPathRecommendations() {
  const { user } = useAppSelector((state) => state.auth);
  const { recommendations, loading, error } = useAppSelector((state) => state.recommendations);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (user) {
      dispatch(fetchRecommendations());
    }
  }, [dispatch, user]);
  
  if (loading) {
    return (
      <DyraneCard>
        <DyraneCardHeader>
          <Skeleton className="h-7 w-48" />
        </DyraneCardHeader>
        <DyraneCardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-64 flex-shrink-0" />
            ))}
          </div>
        </DyraneCardContent>
      </DyraneCard>
    );
  }
  
  if (error || !recommendations || recommendations.length === 0) {
    return null; // Don't show anything if there are no recommendations
  }
  
  return (
    <DyraneCard>
      <DyraneCardHeader className="flex flex-row items-center justify-between">
        <DyraneCardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </DyraneCardTitle>
      </DyraneCardHeader>
      <DyraneCardContent>
        <ScrollArea>
          <div className="flex gap-4 pb-4">
            {recommendations.map((course) => (
              <div key={course.id} className="w-64 flex-shrink-0">
                <CourseCard 
                  course={course} 
                  reason={course.recommendationReason}
                  compact
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DyraneCardContent>
    </DyraneCard>
  );
}
```

## Learning Progress Visualization

The Learning Progress Visualization component provides interactive charts to help users track their learning progress.

```jsx
// components/progress/LearningProgressChart.tsx
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LearningProgressChart() {
  const { user } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.auth_courses);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - in a real app, this would come from the Redux store
  const mockProgressData = {
    weeklyActivity: [
      { day: 'Mon', hours: 1.5 },
      { day: 'Tue', hours: 2.0 },
      { day: 'Wed', hours: 0.5 },
      { day: 'Thu', hours: 1.0 },
      { day: 'Fri', hours: 2.5 },
      { day: 'Sat', hours: 3.0 },
      { day: 'Sun', hours: 1.0 },
    ],
    courseCompletion: courses?.map(course => ({
      name: course.title,
      progress: course.progress || 0,
    })) || [],
    skillBreakdown: [
      { name: 'Programming', value: 40 },
      { name: 'Design', value: 25 },
      { name: 'Data Analysis', value: 20 },
      { name: 'Project Management', value: 15 },
    ],
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <DyraneCard>
      <DyraneCardHeader>
        <DyraneCardTitle>Learning Progress</DyraneCardTitle>
      </DyraneCardHeader>
      <DyraneCardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="h-80">
            <h3 className="text-sm font-medium mb-2">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProgressData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Time Spent']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="hours" 
                  fill="var(--color-primary)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {/* Additional tabs for courses and skills */}
        </Tabs>
      </DyraneCardContent>
    </DyraneCard>
  );
}
```

## Learning Streaks & Gamification

The Learning Streaks component encourages daily engagement with streak counters, badges, and achievements.

```jsx
// components/gamification/LearningStreak.tsx
import { useState } from 'react';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Flame, Award, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function LearningStreak() {
  // Mock data - in a real app, this would come from the Redux store
  const [streakData, setStreakData] = useState({
    currentStreak: 5,
    longestStreak: 12,
    lastThirtyDays: Array(30).fill(null).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      hasActivity: Math.random() > 0.3, // Random activity for demo
    })),
    achievements: [
      { id: 1, title: '3-Day Streak', icon: Flame, achieved: true, date: '2023-10-15' },
      { id: 2, title: '7-Day Streak', icon: Flame, achieved: false },
      { id: 3, title: 'First Course Completed', icon: Trophy, achieved: true, date: '2023-09-28' },
      { id: 4, title: 'Perfect Quiz Score', icon: Star, achieved: true, date: '2023-10-10' },
    ]
  });
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if user has activity today
  const hasActivityToday = streakData.lastThirtyDays[29]?.hasActivity || false;
  
  return (
    <DyraneCard>
      <DyraneCardHeader>
        <DyraneCardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Learning Streak
        </DyraneCardTitle>
      </DyraneCardHeader>
      <DyraneCardContent>
        <div className="space-y-6">
          {/* Current Streak */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950"
            >
              <Flame className={cn(
                "h-8 w-8",
                streakData.currentStreak > 0 
                  ? "text-orange-500" 
                  : "text-muted-foreground"
              )} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold">
                {streakData.currentStreak} {streakData.currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <p className="text-sm text-muted-foreground">
                {streakData.currentStreak > 0 
                  ? `Keep it going! You've been learning for ${streakData.currentStreak} days in a row.` 
                  : 'Start your learning streak today!'}
              </p>
            </div>
          </div>
          
          {/* Additional streak calendar and achievements sections */}
        </div>
      </DyraneCardContent>
    </DyraneCard>
  );
}
```

## Integration

These personalized elements can be integrated into the dashboard and other relevant pages:

```jsx
// app/(authenticated)/dashboard/page.tsx
import { LearningPathRecommendations } from '@/components/recommendations/LearningPathRecommendations';
import { LearningProgressChart } from '@/components/progress/LearningProgressChart';
import { LearningStreak } from '@/components/gamification/LearningStreak';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Dashboard stats */}
      <DashboardStats />
      
      {/* Personalized recommendations */}
      <LearningPathRecommendations />
      
      {/* Learning progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LearningProgressChart />
        <LearningStreak />
      </div>
    </div>
  );
}
```

## Dependencies

- recharts: `^2.5.0`
- framer-motion: `^10.0.0`
- lucide-react: `^0.284.0`
