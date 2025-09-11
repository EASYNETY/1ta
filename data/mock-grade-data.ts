// data/mock-grade-data.ts
import type {
    GradeItem,
    StudentGrade,
    CourseGrade,
    TeacherGradeItemView,
    StudentGradeItemView,
    CreateGradeItemPayload,
    AssignGradePayload,
    CalculateCourseGradesPayload,
  } from "@/features/grades/types/grade-types"
  import { formatISO, subDays, addDays } from "date-fns"
  
  // --- Mock Data Store (Use 'let' for mutability) ---
  let mockGradeItemsStore: GradeItem[] = [
    {
      id: "grade_1",
      title: "Midterm Exam",
      courseId: "1",
      courseTitle: "PMP® Certification Training",
      description: "Comprehensive exam covering chapters 1-5 of the PMBOK Guide.",
      dueDate: formatISO(subDays(new Date(), 10)),
      pointsPossible: 100,
      weight: 0.25, // 25% of final grade
      type: "exam",
      status: "published",
      gradeScale: "percentage",
      createdAt: formatISO(subDays(new Date(), 30)),
      updatedAt: formatISO(subDays(new Date(), 30)),
      createdBy: "teacher_1",
    },
    {
      id: "grade_2",
      title: "Project Charter Assignment",
      courseId: "1",
      courseTitle: "PMP® Certification Training",
      description: "Create a project charter for the case study provided.",
      dueDate: formatISO(subDays(new Date(), 15)),
      pointsPossible: 50,
      weight: 0.15, // 15% of final grade
      type: "assignment",
      status: "published",
      gradeScale: "points",
      createdAt: formatISO(subDays(new Date(), 25)),
      updatedAt: formatISO(subDays(new Date(), 25)),
      createdBy: "teacher_1",
    },
    {
      id: "grade_3",
      title: "Final Project",
      courseId: "1",
      courseTitle: "PMP® Certification Training",
      description: "Comprehensive project management plan for a real-world scenario.",
      dueDate: formatISO(addDays(new Date(), 20)),
      pointsPossible: 200,
      weight: 0.35, // 35% of final grade
      type: "project",
      status: "published",
      gradeScale: "percentage",
      createdAt: formatISO(subDays(new Date(), 20)),
      updatedAt: formatISO(subDays(new Date(), 20)),
      createdBy: "teacher_1",
    },
    {
      id: "grade_4",
      title: "HTML & CSS Quiz",
      courseId: "webdev_101",
      courseTitle: "Web Development Bootcamp",
      description: "Quiz covering HTML tags, CSS selectors, and layout concepts.",
      dueDate: formatISO(subDays(new Date(), 5)),
      pointsPossible: 30,
      weight: 0.1, // 10% of final grade
      type: "quiz",
      status: "published",
      gradeScale: "points",
      createdAt: formatISO(subDays(new Date(), 15)),
      updatedAt: formatISO(subDays(new Date(), 15)),
      createdBy: "teacher_2",
    },
    {
      id: "grade_5",
      title: "JavaScript Fundamentals Exam",
      courseId: "webdev_101",
      courseTitle: "Web Development Bootcamp",
      description: "Comprehensive exam on JavaScript basics, functions, and DOM manipulation.",
      dueDate: formatISO(subDays(new Date(), 2)),
      pointsPossible: 100,
      weight: 0.25, // 25% of final grade
      type: "exam",
      status: "published",
      gradeScale: "percentage",
      createdAt: formatISO(subDays(new Date(), 10)),
      updatedAt: formatISO(subDays(new Date(), 10)),
      createdBy: "teacher_2",
    },
  ]
  
  let mockStudentGradesStore: StudentGrade[] = [
    // Grades for Midterm Exam (grade_1)
    {
      id: "student_grade_1",
      gradeItemId: "grade_1",
      studentId: "student_1",
      studentName: "Alice Student",
      points: 85,
      percentage: 85,
      letterGrade: "B",
      feedback: "Good understanding of core concepts. Work on risk management section.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 8)),
      gradedBy: "teacher_1",
      updatedAt: formatISO(subDays(new Date(), 8)),
    },
    {
      id: "student_grade_2",
      gradeItemId: "grade_1",
      studentId: "student_2",
      studentName: "Bob Learner",
      points: 92,
      percentage: 92,
      letterGrade: "A",
      feedback: "Excellent work! Very thorough understanding of the material.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 8)),
      gradedBy: "teacher_1",
      updatedAt: formatISO(subDays(new Date(), 8)),
    },
  
    // Grades for Project Charter Assignment (grade_2)
    {
      id: "student_grade_3",
      gradeItemId: "grade_2",
      studentId: "student_1",
      studentName: "Alice Student",
      points: 45,
      percentage: 90,
      letterGrade: "A-",
      feedback: "Well-structured charter. Consider adding more detail to stakeholder section.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 12)),
      gradedBy: "teacher_1",
      updatedAt: formatISO(subDays(new Date(), 12)),
    },
    {
      id: "student_grade_4",
      gradeItemId: "grade_2",
      studentId: "student_2",
      studentName: "Bob Learner",
      points: 40,
      percentage: 80,
      letterGrade: "B",
      feedback: "Good work. Scope section needs more clarity.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 12)),
      gradedBy: "teacher_1",
      updatedAt: formatISO(subDays(new Date(), 12)),
    },
  
    // Grades for HTML & CSS Quiz (grade_4)
    {
      id: "student_grade_5",
      gradeItemId: "grade_4",
      studentId: "student_1",
      studentName: "Alice Student",
      points: 28,
      percentage: 93.33,
      letterGrade: "A",
      feedback: "Excellent understanding of CSS selectors and layout principles.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 3)),
      gradedBy: "teacher_2",
      updatedAt: formatISO(subDays(new Date(), 3)),
    },
    {
      id: "student_grade_6",
      gradeItemId: "grade_4",
      studentId: "student_2",
      studentName: "Bob Learner",
      points: 25,
      percentage: 83.33,
      letterGrade: "B",
      feedback: "Good work. Review flexbox concepts for better understanding.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 3)),
      gradedBy: "teacher_2",
      updatedAt: formatISO(subDays(new Date(), 3)),
    },
  
    // Grades for JavaScript Fundamentals Exam (grade_5)
    {
      id: "student_grade_7",
      gradeItemId: "grade_5",
      studentId: "student_1",
      studentName: "Alice Student",
      points: 88,
      percentage: 88,
      letterGrade: "B+",
      feedback: "Strong grasp of core concepts. Work on async functions.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 1)),
      gradedBy: "teacher_2",
      updatedAt: formatISO(subDays(new Date(), 1)),
    },
    {
      id: "student_grade_8",
      gradeItemId: "grade_5",
      studentId: "student_2",
      studentName: "Bob Learner",
      points: 95,
      percentage: 95,
      letterGrade: "A",
      feedback: "Excellent work! Your code was clean and well-structured.",
      status: "published",
      gradedAt: formatISO(subDays(new Date(), 1)),
      gradedBy: "teacher_2",
      updatedAt: formatISO(subDays(new Date(), 1)),
    },
  ]
  
  const mockCourseGradesStore: CourseGrade[] = [
    {
      id: "course_grade_1",
      courseId: "1",
      courseTitle: "PMP® Certification Training",
      studentId: "student_1",
      studentName: "Alice Student",
      overallPercentage: 87.5,
      letterGrade: "B+",
      gradeItems: [
        {
          categoryName: "exam",
          weight: 0.25,
          average: 85,
          items: [
            {
              id: "grade_1",
              title: "Midterm Exam",
              points: 85,
              pointsPossible: 100,
              percentage: 85,
              weight: 0.25,
            },
          ],
        },
        {
          categoryName: "assignment",
          weight: 0.15,
          average: 90,
          items: [
            {
              id: "grade_2",
              title: "Project Charter Assignment",
              points: 45,
              pointsPossible: 50,
              percentage: 90,
              weight: 0.15,
            },
          ],
        },
        {
          categoryName: "project",
          weight: 0.35,
          average: 0, // Not graded yet
          items: [],
        },
      ],
      status: "published",
      updatedAt: formatISO(subDays(new Date(), 1)),
    },
    {
      id: "course_grade_2",
      courseId: "1",
      courseTitle: "PMP® Certification Training",
      studentId: "student_2",
      studentName: "Bob Learner",
      overallPercentage: 89.0,
      letterGrade: "B+",
      gradeItems: [
        {
          categoryName: "exam",
          weight: 0.25,
          average: 92,
          items: [
            {
              id: "grade_1",
              title: "Midterm Exam",
              points: 92,
              pointsPossible: 100,
              percentage: 92,
              weight: 0.25,
            },
          ],
        },
        {
          categoryName: "assignment",
          weight: 0.15,
          average: 80,
          items: [
            {
              id: "grade_2",
              title: "Project Charter Assignment",
              points: 40,
              pointsPossible: 50,
              percentage: 80,
              weight: 0.15,
            },
          ],
        },
        {
          categoryName: "project",
          weight: 0.35,
          average: 0, // Not graded yet
          items: [],
        },
      ],
      status: "published",
      updatedAt: formatISO(subDays(new Date(), 1)),
    },
    {
      id: "course_grade_3",
      courseId: "webdev_101",
      courseTitle: "Web Development Bootcamp",
      studentId: "student_1",
      studentName: "Alice Student",
      overallPercentage: 90.67,
      letterGrade: "A-",
      gradeItems: [
        {
          categoryName: "quiz",
          weight: 0.1,
          average: 93.33,
          items: [
            {
              id: "grade_4",
              title: "HTML & CSS Quiz",
              points: 28,
              pointsPossible: 30,
              percentage: 93.33,
              weight: 0.1,
            },
          ],
        },
        {
          categoryName: "exam",
          weight: 0.25,
          average: 88,
          items: [
            {
              id: "grade_5",
              title: "JavaScript Fundamentals Exam",
              points: 88,
              pointsPossible: 100,
              percentage: 88,
              weight: 0.25,
            },
          ],
        },
      ],
      status: "published",
      updatedAt: formatISO(new Date()),
    },
    {
      id: "course_grade_4",
      courseId: "webdev_101",
      courseTitle: "Web Development Bootcamp",
      studentId: "student_2",
      studentName: "Bob Learner",
      overallPercentage: 92.83,
      letterGrade: "A",
      gradeItems: [
        {
          categoryName: "quiz",
          weight: 0.1,
          average: 83.33,
          items: [
            {
              id: "grade_4",
              title: "HTML & CSS Quiz",
              points: 25,
              pointsPossible: 30,
              percentage: 83.33,
              weight: 0.1,
            },
          ],
        },
        {
          categoryName: "exam",
          weight: 0.25,
          average: 95,
          items: [
            {
              id: "grade_5",
              title: "JavaScript Fundamentals Exam",
              points: 95,
              pointsPossible: 100,
              percentage: 95,
              weight: 0.25,
            },
          ],
        },
      ],
      status: "published",
      updatedAt: formatISO(new Date()),
    },
  ]
  
  // --- Helper Functions ---
  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return "A+"
    if (percentage >= 93) return "A"
    if (percentage >= 90) return "A-"
    if (percentage >= 87) return "B+"
    if (percentage >= 83) return "B"
    if (percentage >= 80) return "B-"
    if (percentage >= 77) return "C+"
    if (percentage >= 73) return "C"
    if (percentage >= 70) return "C-"
    if (percentage >= 67) return "D+"
    if (percentage >= 63) return "D"
    if (percentage >= 60) return "D-"
    return "F"
  }
  
  // --- Mock API Functions ---
  
  // Fetch for Teacher/Admin (includes grade statistics)
  export const getMockGradeItemsForCourse = async (
    courseId?: string,
    classId?: string,
  ): Promise<TeacherGradeItemView[]> => {
    console.log(`MOCK: Fetching grade items for Course ${courseId} / Class ${classId}`)
    await new Promise((res) => setTimeout(res, 400))
    let gradeItems = mockGradeItemsStore
    if (courseId) gradeItems = gradeItems.filter((item) => item.courseId === courseId)
    if (classId) gradeItems = gradeItems.filter((item) => item.classId === classId)
  
    const results: TeacherGradeItemView[] = gradeItems.map((item) => {
      const grades = mockStudentGradesStore.filter((grade) => grade.gradeItemId === item.id)
      const totalGraded = grades.length
  
      let averageScore = 0
      let highestScore = 0
      let lowestScore = item.pointsPossible
  
      if (totalGraded > 0) {
        const sum = grades.reduce((acc, grade) => acc + grade.points, 0)
        averageScore = sum / totalGraded
        highestScore = Math.max(...grades.map((grade) => grade.points))
        lowestScore = Math.min(...grades.map((grade) => grade.points))
      }
  
      return {
        ...item,
        totalGraded,
        averageScore,
        highestScore,
        lowestScore,
        totalStudentsInClass: 30, // Mock value
      }
    })
  
    return JSON.parse(JSON.stringify(results))
  }
  
  // Fetch for Student (includes their grades)
  export const getMockGradeItemsForStudent = async (
    userId: string,
    courseId?: string,
  ): Promise<StudentGradeItemView[]> => {
    console.log(`MOCK: Fetching grade items for Student ${userId}, Course ${courseId}`)
    await new Promise((res) => setTimeout(res, 350))
    let gradeItems = mockGradeItemsStore.filter((item) => item.status === "published")
    if (courseId) gradeItems = gradeItems.filter((item) => item.courseId === courseId)
  
    const results: StudentGradeItemView[] = gradeItems.map((item) => {
      const grade =
        mockStudentGradesStore.find(
          (g) => g.gradeItemId === item.id && g.studentId === userId && g.status === "published",
        ) || null
  
      return { ...item, grade }
    })
  
    return JSON.parse(JSON.stringify(results))
  }
  
  export const getMockGradeItemById = async (
    gradeItemId: string,
    role: string,
    userId?: string,
  ): Promise<GradeItem | StudentGradeItemView | TeacherGradeItemView> => {
    console.log(`MOCK: Fetching grade item ${gradeItemId} for role ${role}`)
    await new Promise((res) => setTimeout(res, 200))
    const gradeItem = mockGradeItemsStore.find((item) => item.id === gradeItemId)
    if (!gradeItem) throw new Error("Grade item not found")
  
    if (role === "student" && userId) {
      const grade =
        mockStudentGradesStore.find(
          (g) => g.gradeItemId === gradeItem.id && g.studentId === userId && g.status === "published",
        ) || null
      return JSON.parse(JSON.stringify({ ...gradeItem, grade }))
    } else if (role === "teacher" || role === "admin") {
      const grades = mockStudentGradesStore.filter((g) => g.gradeItemId === gradeItem.id)
      const totalGraded = grades.length
  
      let averageScore = 0
      let highestScore = 0
      let lowestScore = gradeItem.pointsPossible
  
      if (totalGraded > 0) {
        const sum = grades.reduce((acc, grade) => acc + grade.points, 0)
        averageScore = sum / totalGraded
        highestScore = Math.max(...grades.map((grade) => grade.points))
        lowestScore = Math.min(...grades.map((grade) => grade.points))
      }
  
      return JSON.parse(
        JSON.stringify({
          ...gradeItem,
          totalGraded,
          averageScore,
          highestScore,
          lowestScore,
          totalStudentsInClass: 30, // Mock value
        }),
      )
    }
  
    return JSON.parse(JSON.stringify(gradeItem))
  }
  
  export const createMockGradeItem = async (payload: CreateGradeItemPayload): Promise<GradeItem> => {
    console.log("MOCK: Creating grade item", payload)
    await new Promise((res) => setTimeout(res, 300))
  
    const newGradeItem: GradeItem = {
      ...payload.gradeItem,
      id: `grade_new_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
      courseTitle: `Course for ${payload.gradeItem.courseId}`, // Placeholder title
      status: payload.gradeItem.status ?? "draft",
    }
  
    mockGradeItemsStore.unshift(newGradeItem)
    console.log("MOCK: Grade item created, new count:", mockGradeItemsStore.length)
    return JSON.parse(JSON.stringify(newGradeItem))
  }
  
  export const updateMockGradeItem = async (gradeItemId: string, payload: Partial<GradeItem>): Promise<GradeItem> => {
    console.log(`MOCK: Updating grade item ${gradeItemId}`, payload)
    await new Promise((res) => setTimeout(res, 250))
    const index = mockGradeItemsStore.findIndex((item) => item.id === gradeItemId)
    if (index === -1) throw new Error("Grade item not found")
    mockGradeItemsStore[index] = {
      ...mockGradeItemsStore[index],
      ...payload,
      updatedAt: formatISO(new Date()),
    }
    return JSON.parse(JSON.stringify(mockGradeItemsStore[index]))
  }
  
  export const deleteMockGradeItem = async (gradeItemId: string): Promise<void> => {
    console.log(`MOCK: Deleting grade item ${gradeItemId}`)
    await new Promise((res) => setTimeout(res, 300))
    const initialLength = mockGradeItemsStore.length
    mockGradeItemsStore = mockGradeItemsStore.filter((item) => item.id !== gradeItemId)
    // Also delete related grades
    mockStudentGradesStore = mockStudentGradesStore.filter((grade) => grade.gradeItemId !== gradeItemId)
    if (mockGradeItemsStore.length === initialLength) throw new Error("Grade item not found")
  }
  
  export const getMockStudentGradesForGradeItem = async (gradeItemId: string): Promise<StudentGrade[]> => {
    console.log(`MOCK: Fetching student grades for grade item ${gradeItemId}`)
    await new Promise((res) => setTimeout(res, 300))
    const grades = mockStudentGradesStore.filter((grade) => grade.gradeItemId === gradeItemId)
    return JSON.parse(JSON.stringify(grades))
  }
  
  export const getMockStudentGradeById = async (gradeId: string): Promise<StudentGrade> => {
    console.log(`MOCK: Fetching student grade ${gradeId}`)
    await new Promise((res) => setTimeout(res, 200))
    const grade = mockStudentGradesStore.find((g) => g.id === gradeId)
    if (!grade) throw new Error("Student grade not found")
    return JSON.parse(JSON.stringify(grade))
  }
  
  export const assignMockGrade = async (payload: AssignGradePayload): Promise<StudentGrade> => {
    console.log(`MOCK: Assigning grade for student ${payload.studentId} on grade item ${payload.gradeItemId}`)
    await new Promise((res) => setTimeout(res, 400))
    const gradeItem = mockGradeItemsStore.find((item) => item.id === payload.gradeItemId)
    if (!gradeItem) throw new Error("Grade item not found")
  
    // Calculate percentage
    const percentage = (payload.points / gradeItem.pointsPossible) * 100
  
    // Determine letter grade if applicable
    let letterGrade: string | null = null
    if (gradeItem.gradeScale === "percentage" || gradeItem.gradeScale === "letter") {
      letterGrade = getLetterGrade(percentage)
    }
  
    // Check if grade already exists
    const existingIndex = mockStudentGradesStore.findIndex(
      (g) => g.gradeItemId === payload.gradeItemId && g.studentId === payload.studentId,
    )
  
    const newGrade: StudentGrade = {
      id:
        existingIndex > -1
          ? mockStudentGradesStore[existingIndex].id
          : `student_grade_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      gradeItemId: payload.gradeItemId,
      studentId: payload.studentId,
      studentName: `Student ${payload.studentId}`, // TODO: Get actual name
      points: payload.points,
      percentage,
      letterGrade,
      feedback: payload.feedback || null,
      status: payload.status,
      gradedAt: formatISO(new Date()),
      gradedBy: payload.gradedBy,
      updatedAt: formatISO(new Date()),
    }
  
    if (existingIndex > -1) {
      mockStudentGradesStore[existingIndex] = newGrade
    } else {
      mockStudentGradesStore.push(newGrade)
    }
  
    return JSON.parse(JSON.stringify(newGrade))
  }
  
  export const updateMockGrade = async (gradeId: string, payload: Partial<StudentGrade>): Promise<StudentGrade> => {
    console.log(`MOCK: Updating grade ${gradeId}`, payload)
    await new Promise((res) => setTimeout(res, 250))
    const index = mockStudentGradesStore.findIndex((g) => g.id === gradeId)
    if (index === -1) throw new Error("Grade not found")
  
    // If points are being updated, recalculate percentage and letter grade
    if (payload.points !== undefined) {
      const gradeItem = mockGradeItemsStore.find((item) => item.id === mockStudentGradesStore[index].gradeItemId)
      if (gradeItem) {
        const percentage = (payload.points / gradeItem.pointsPossible) * 100
        payload.percentage = percentage
  
        if (gradeItem.gradeScale === "percentage" || gradeItem.gradeScale === "letter") {
          payload.letterGrade = getLetterGrade(percentage)
        }
      }
    }
  
    mockStudentGradesStore[index] = {
      ...mockStudentGradesStore[index],
      ...payload,
      updatedAt: formatISO(new Date()),
    }
  
    return JSON.parse(JSON.stringify(mockStudentGradesStore[index]))
  }
  
  export const getMockCourseGrades = async (
    courseId: string,
    classId?: string,
    studentId?: string,
  ): Promise<CourseGrade[]> => {
    console.log(`MOCK: Fetching course grades for course ${courseId}`)
    await new Promise((res) => setTimeout(res, 350))
    let grades = mockCourseGradesStore.filter((g) => g.courseId === courseId)
    if (studentId) grades = grades.filter((g) => g.studentId === studentId)
    return JSON.parse(JSON.stringify(grades))
  }
  
  export const calculateMockCourseGrades = async (payload: CalculateCourseGradesPayload): Promise<CourseGrade[]> => {
    console.log(`MOCK: Calculating course grades for course ${payload.courseId}`)
    await new Promise((res) => setTimeout(res, 500))
  
    // This would be a complex calculation in a real system
    // For mock purposes, we'll just return the existing course grades
    const grades = mockCourseGradesStore.filter((g) => g.courseId === payload.courseId)
  
    // Update the status if publishImmediately is true
    if (payload.publishImmediately) {
      grades.forEach((grade) => {
        grade.status = "published"
        grade.updatedAt = formatISO(new Date())
      })
    }
  
    return JSON.parse(JSON.stringify(grades))
  }
