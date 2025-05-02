// features/classes/hooks/useCourseClassOptions.ts

export type CourseClassOption = {
    id: string
    courseName: string
    sessionName: string
  }
  
  export const useCourseClassOptions = (): CourseClassOption[] => {
    // Replace this with API/Redux call as needed
    return [
      { id: '1', courseName: 'Math 101', sessionName: 'Morning' },
      { id: '2', courseName: 'Physics 201', sessionName: 'Afternoon' },
    ]
  }
  