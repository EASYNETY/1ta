// features/classes/types/class-interface.ts

export interface Class {
  id: string;
  name: string;
  description: string;
  course_id: string;
  start_date: string;
  end_date: string;
  schedule: any; // This could be more specific based on your needs
  max_students: number;
  max_slots: number;           // New field
  available_slots: number;     // New field
  enrolled_students_count: number; // New field
  is_active: boolean;
  status: string;              // Can be 'active', 'full', 'cancelled', etc.
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClassWithCourse extends Class {
  course?: {
    id: string;
    name: string;
    description: string;
    category: string;
    is_iso_certification: boolean;
    available_for_enrollment: boolean;
    image_url: string;
    icon_url: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrollment_date: string;
  status: string; // 'active', 'completed', 'dropped', etc.
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRequest {
  class_id: string;
  student_id: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrollment: ClassEnrollment;
    class: Class;
  };
  error?: string;
}

export interface BulkEnrollmentRequest {
  class_id: string;
  student_ids: string[];
  corporate_id?: string;
}

export interface BulkEnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    enrollments: ClassEnrollment[];
    class: Class;
  };
  error?: string;
}
