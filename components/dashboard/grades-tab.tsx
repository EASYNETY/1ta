// components/dashboard/grades-tab.tsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/store/hooks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BookOpen, TrendingUp, Award, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock grades data
const mockGrades = [
  {
    courseId: "1",
    courseTitle: "PMP® Certification Training",
    instructor: "Dr. Sarah Johnson",
    overallGrade: 85,
    assignments: [
      { id: "1", title: "Project Charter Analysis", grade: 92, maxGrade: 100 },
      { id: "2", title: "Risk Management Plan", grade: 88, maxGrade: 100 },
      { id: "3", title: "Stakeholder Analysis", grade: 78, maxGrade: 100 },
      { id: "4", title: "Project Schedule", grade: 85, maxGrade: 100 },
    ],
    quizzes: [
      { id: "1", title: "PMBOK Knowledge Areas Quiz", grade: 90, maxGrade: 100 },
      { id: "2", title: "Project Processes Quiz", grade: 82, maxGrade: 100 },
    ],
    exams: [
      { id: "1", title: "Midterm Exam", grade: 84, maxGrade: 100 },
    ]
  },
  {
    courseId: "2",
    courseTitle: "Web Development Bootcamp",
    instructor: "Michael Chen",
    overallGrade: 92,
    assignments: [
      { id: "1", title: "HTML & CSS Portfolio", grade: 95, maxGrade: 100 },
      { id: "2", title: "JavaScript Algorithms", grade: 92, maxGrade: 100 },
      { id: "3", title: "React Component Library", grade: 85, maxGrade: 100 },
    ],
    quizzes: [
      { id: "1", title: "HTML Fundamentals Quiz", grade: 100, maxGrade: 100 },
      { id: "2", title: "CSS Layouts Quiz", grade: 90, maxGrade: 100 },
      { id: "3", title: "JavaScript Basics Quiz", grade: 95, maxGrade: 100 },
    ],
    exams: [
      { id: "1", title: "Frontend Development Exam", grade: 91, maxGrade: 100 },
    ]
  }
]

export function GradesTab() {
  const { user } = useAppSelector((state) => state.auth)
  const [selectedCourse, setSelectedCourse] = useState<string>(mockGrades[0]?.courseId || "")

  if (!user || user.role !== "student") return null

  const currentCourse = mockGrades.find(course => course.courseId === selectedCourse)
  
  // Calculate overall GPA
  const overallGPA = mockGrades.reduce((sum, course) => sum + course.overallGrade, 0) / mockGrades.length
  
  // Get letter grade
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }
  
  // Get color class based on grade
  const getGradeColorClass = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Overall GPA Card */}
      <DyraneCard>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary/10 rounded-full p-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-1">Overall Performance</h2>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-3xl font-bold">{overallGPA.toFixed(1)}%</span>
                <span className={`text-2xl font-bold ${getGradeColorClass(overallGPA)}`}>
                  {getLetterGrade(overallGPA)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Across {mockGrades.length} enrolled courses
              </p>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <div className="h-3 w-full rounded-full bg-primary/20 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-500" 
                  style={{ width: `${overallGPA}%` }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </DyraneCard>

      {/* Course Selection */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-medium">Course:</h2>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {mockGrades.map(course => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.courseTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentCourse && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={currentCourse.courseId}
        >
          {/* Course Overview */}
          <DyraneCard>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentCourse.courseTitle}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getGradeColorClass(currentCourse.overallGrade)}`}>
                    {currentCourse.overallGrade}%
                  </span>
                  <span className={`text-lg font-bold ${getGradeColorClass(currentCourse.overallGrade)}`}>
                    ({getLetterGrade(currentCourse.overallGrade)})
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Instructor: {currentCourse.instructor}
              </p>
              
              <div className="space-y-4">
                {/* Assignments */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assignments
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.assignments.map(assignment => (
                      <div key={assignment.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{assignment.title}</span>
                          <span className={getGradeColorClass(assignment.grade)}>
                            {assignment.grade}/{assignment.maxGrade}
                          </span>
                        </div>
                        <Progress value={(assignment.grade / assignment.maxGrade) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quizzes */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Quizzes
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.quizzes.map(quiz => (
                      <div key={quiz.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{quiz.title}</span>
                          <span className={getGradeColorClass(quiz.grade)}>
                            {quiz.grade}/{quiz.maxGrade}
                          </span>
                        </div>
                        <Progress value={(quiz.grade / quiz.maxGrade) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Exams */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Exams
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.exams.map(exam => (
                      <div key={exam.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{exam.title}</span>
                          <span className={getGradeColorClass(exam.grade)}>
                            {exam.grade}/{exam.maxGrade}
                          </span>
                        </div>
                        <Progress value={(exam.grade / exam.maxGrade) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </DyraneCard>
          
          {/* Grade Improvement Tips */}
          {currentCourse.overallGrade < 80 && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Improvement Tips</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Schedule a one-on-one session with your instructor</li>
                  <li>Review the course materials for topics where you scored lower</li>
                  <li>Join study groups with your classmates</li>
                  <li>Complete additional practice exercises</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}
    </div>
  )
}
