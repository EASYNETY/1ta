// Mock user database
const users = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    },
    {
      id: "2",
      name: "Teacher User",
      email: "teacher@example.com",
      password: "password123",
      role: "teacher",
    },
    {
      id: "3",
      name: "Student User",
      email: "student@example.com",
      password: "password123",
      role: "student",
    },
  ]
  
  // Mock courses database
  const courses = [
    {
      id: "1",
      title: "Introduction to Mathematics",
      description: "Learn the fundamentals of mathematics including algebra, geometry, and calculus.",
      instructor: "Dr. Jane Smith",
      enrolledStudents: ["3"],
    },
    {
      id: "2",
      title: "Advanced Physics",
      description: "Explore the laws of physics and their applications in the real world.",
      instructor: "Prof. John Doe",
      enrolledStudents: [],
    },
    {
      id: "3",
      title: "World History",
      description: "A comprehensive overview of major historical events and their impact on society.",
      instructor: "Dr. Robert Johnson",
      enrolledStudents: ["3"],
    },
  ]
  
  // Mock auth functions
  export function login(credentials: { email: string; password: string }) {
    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password)
  
    if (!user) {
      throw new Error("Invalid email or password")
    }
  
    const { password, ...userWithoutPassword } = user
  
    return {
      user: userWithoutPassword,
      token: `mock-token-${user.id}-${Date.now()}`,
    }
  }
  
  export function register(userData: { name: string; email: string; password: string; role: string }) {
    // Check if user already exists
    if (users.some((u) => u.email === userData.email)) {
      throw new Error("User with this email already exists")
    }
  
    // Create new user
    const newUser = {
      id: `${users.length + 1}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role as "admin" | "teacher" | "student",
    }
  
    users.push(newUser)
  
    const { password, ...userWithoutPassword } = newUser
  
    return {
      user: userWithoutPassword,
      token: `mock-token-${newUser.id}-${Date.now()}`,
    }
  }
  
  // Mock user functions
  export function updateUser(userId: string, userData: Partial<{ name: string }>) {
    const userIndex = users.findIndex((u) => u.id === userId)
  
    if (userIndex === -1) {
      throw new Error("User not found")
    }
  
    users[userIndex] = { ...users[userIndex], ...userData }
  
    const { password, ...userWithoutPassword } = users[userIndex]
  
    return userWithoutPassword
  }
  
  // Mock course functions
  export function getCourses() {
    return courses.map((course) => ({
      ...course,
      enrolled: course.enrolledStudents.length > 0,
    }))
  }
  
  export function createCourse(courseData: { title: string; description: string }) {
    const newCourse = {
      id: `${courses.length + 1}`,
      title: courseData.title,
      description: courseData.description,
      instructor: "Current User",
      enrolledStudents: [],
    }
  
    courses.push(newCourse)
  
    return newCourse
  }
  
  export function enrollInCourse(courseId: string) {
    const courseIndex = courses.findIndex((c) => c.id === courseId)
  
    if (courseIndex === -1) {
      throw new Error("Course not found")
    }
  
    // Assuming student ID 3 for mock purposes
    const studentId = "3"
  
    if (!courses[courseIndex].enrolledStudents.includes(studentId)) {
      courses[courseIndex].enrolledStudents.push(studentId)
    }
  
    return {
      success: true,
      message: "Successfully enrolled in course",
    }
  }
  