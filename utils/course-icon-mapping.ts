// Course icon mapping utility
// Maps course names/IDs to PNG icons in /images/icons

export interface CourseIconMapping {
  [key: string]: string;
}

// Create mapping based on course names and available PNG icons
export const courseIconMapping: CourseIconMapping = {
  // PMP courses
  "pmp": "/images/icons/Prince2 practitioner-01-01.png",
  "pmp-class": "/images/icons/Prince2 practitioner-01-01.png",
  "pmp-class2025": "/images/icons/Prince2 practitioner-01-01.png",
  "PMP® Project Management": "/images/icons/Prince2 practitioner-01-01.png",

  // Prince2 courses
  "prince2": "/images/icons/Prince2 Foundation certification-01-01.png",
  "prince2-foundation": "/images/icons/Prince2 Foundation certification-01-01.png",
  "prince2-practitioner": "/images/icons/Prince2 practitioner-01-01.png",

  // AWS courses
  "aws": "/images/icons/AWS Practitioner Essential-01-01.png",
  "aws-practitioner": "/images/icons/AWS Practitioner Essential-01-01.png",
  "aws-solution-architect": "/images/icons/AWS Solution Architect Associate-01-01.png",
  "AWS Practitioner Essential": "/images/icons/AWS Practitioner Essential-01-01.png",
  "AWS Solution Architect Associate": "/images/icons/AWS Solution Architect Associate-01-01.png",

  // Azure courses
  "azure": "/images/icons/Microsoft Azure Fundamental-01-01.png",
  "microsoft-azure": "/images/icons/Microsoft Azure Fundamental-01-01.png",
  "azure-solution-architect": "/images/icons/Microsoft Solution Architect-01-01.png",
  "Microsoft Azure Fundamental": "/images/icons/Microsoft Azure Fundamental-01-01.png",
  "Microsoft Solution Architect": "/images/icons/Microsoft Solution Architect-01-01.png",

  // CompTIA courses
  "comptia-cloud": "/images/icons/CompTIA Cloud+-01-01.png",
  "comptia-cloud-essentials": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "CompTIA Cloud+": "/images/icons/CompTIA Cloud+-01-01.png",
  "CompTIA Cloud Essentials Certification": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",

  // Development courses
  "java": "/images/icons/Corporate training in Java programming-01-01.png",
  "spring-boot": "/images/icons/Spring Boot in Java-01-01.png",
  "react": "/images/icons/Frontend Development with ReactJs-01-01.png",
  "reactjs": "/images/icons/Frontend Development with ReactJs-01-01.png",
  "frontend": "/images/icons/Frontend Development with ReactJs-01-01.png",
  "html": "/images/icons/Introduction to HTML5 and CSS3-01-01.png",
  "css": "/images/icons/Introduction to HTML5 and CSS3-01-01.png",
  "html5": "/images/icons/Introduction to HTML5 and CSS3-01-01.png",
  "css3": "/images/icons/Introduction to HTML5 and CSS3-01-01.png",
  "javascript": "/images/icons/Website Development with JavaScript-01-01.png",
  "python": "/images/icons/Python for Beginners Certification-01-01.png",
  "flutter": "/images/icons/Mobile Development with Flutter-01-01.png",
  "mobile": "/images/icons/Mobile Development with Flutter-01-01.png",
  "Corporate training in Java programming": "/images/icons/Corporate training in Java programming-01-01.png",
  "Spring Boot in Java": "/images/icons/Spring Boot in Java-01-01.png",
  "Frontend Development with ReactJs": "/images/icons/Frontend Development with ReactJs-01-01.png",
  "Introduction to HTML5 and CSS3": "/images/icons/Introduction to HTML5 and CSS3-01-01.png",
  "Website Development with JavaScript": "/images/icons/Website Development with JavaScript-01-01.png",
  "Python for Beginners Certification": "/images/icons/Python for Beginners Certification-01-01.png",
  "Mobile Development with Flutter": "/images/icons/Mobile Development with Flutter-01-01.png",

  // Design courses
  "ui-ux": "/images/icons/UI-UX DESIGN-01-01.png",
  "design": "/images/icons/UI-UX DESIGN-01-01.png",
  "UI-UX DESIGN": "/images/icons/UI-UX DESIGN-01-01.png",

  // Analytics courses
  "power-bi": "/images/icons/Power BI Certification-01-01.png",
  "data-science": "/images/icons/Data Science  Big Data Analytics.png",
  "analytics": "/images/icons/Data Science  Big Data Analytics.png",
  "Power BI Certification": "/images/icons/Power BI Certification-01-01.png",
  "Data Science & Big Data Analytics": "/images/icons/Data Science  Big Data Analytics.png",
  "big-data": "/images/icons/Data Science  Big Data Analytics.png",

  // Marketing courses
  "digital-marketing": "/images/icons/Digital Marketing Certification-01-01.png",
  "marketing": "/images/icons/Digital Marketing Certification-01-01.png",
  "Digital Marketing Certification": "/images/icons/Digital Marketing Certification-01-01.png",

  // AI/ML courses
  "ai": "/images/future/AI_ MACHINE LEARNING.jpeg",
  "ai-ml": "/images/future/AI_ MACHINE LEARNING.jpeg",
  "machine-learning": "/images/future/AI_ MACHINE LEARNING.jpeg",
  "AI & Machine Learning": "/images/future/AI_ MACHINE LEARNING.jpeg",
  "AI & Machine Learning Mastery": "/images/future/AI_ MACHINE LEARNING.jpeg",
  "AI Machine Learning Mastery": "/images/future/AI_ MACHINE LEARNING.jpeg",

  // Data Science courses
  "data-science": "/images/future/DATA SCIENCE.jpeg",
  "Data Science": "/images/future/DATA SCIENCE.jpeg",
  "Data Science & Big Data Analytics": "/images/future/DATA SCIENCE.jpeg",

  // Cybersecurity courses
  "cybersecurity": "/images/future/ADVANCED CYBERSECURITY.jpeg",
  "security": "/images/future/ADVANCED CYBERSECURITY.jpeg",
  "Advanced Cybersecurity Defense": "/images/future/ADVANCED CYBERSECURITY.jpeg",

  // DevOps courses
  "devops": "/images/future/DEVOPS ENGINEERING.jpeg",
  "DevOps Engineering & Automation": "/images/future/DEVOPS ENGINEERING.jpeg",
  "DevOps Engineering Automation": "/images/future/DEVOPS ENGINEERING.jpeg",

  // ISO courses
  "iso-20000": "/images/future/ISO 20000.jpeg",
  "ISO 20000 IT Service Management": "/images/future/ISO 20000.jpeg",
  "iso": "/images/future/ISO 27001.jpeg",
  "iso-27001": "/images/future/ISO 27001.jpeg",
  "ISO 27001 Information Security": "/images/future/ISO 27001.jpeg",
  "iso-9001": "/images/future/ISO 9001.jpeg",
  "ISO 9001 Quality Management": "/images/future/ISO 9001.jpeg",
};

/**
 * Get the appropriate PNG icon for a course based on its name or ID
 * @param courseName - The course name or ID
 * @param courseId - Optional course ID for fallback matching
 * @returns The path to the PNG icon or a default icon
 */
export function getCourseIcon(courseName?: string, courseId?: string): string {
  try {
    // Handle undefined or null course name
    if (!courseName) {
      // If we have a course ID, try to use that instead
      if (courseId) {
        // Try exact match with course ID
        if (courseIconMapping[courseId]) {
          return courseIconMapping[courseId];
        }

        // Try partial matching with course ID
        try {
          const lowerCourseId = String(courseId).toLowerCase();
          for (const [key, iconPath] of Object.entries(courseIconMapping)) {
            if (lowerCourseId.includes(String(key).toLowerCase()) ||
              String(key).toLowerCase().includes(lowerCourseId)) {
              return iconPath;
            }
          }
        } catch (error) {
          console.error("Error in getCourseIcon with courseId:", error);
        }
      }

      // If no course name or ID match, return default
      return "/course-placeholder.png";
    }

    // First try exact match with course name
    if (courseIconMapping[courseName]) {
      return courseIconMapping[courseName];
    }

    // Try exact match with course ID if provided
    if (courseId && courseIconMapping[courseId]) {
      return courseIconMapping[courseId];
    }

    // Try partial matching with course name (case insensitive)
    try {
      const lowerCourseName = String(courseName).toLowerCase();
      for (const [key, iconPath] of Object.entries(courseIconMapping)) {
        if (lowerCourseName.includes(String(key).toLowerCase()) ||
          String(key).toLowerCase().includes(lowerCourseName)) {
          return iconPath;
        }
      }
    } catch (error) {
      console.error("Error in getCourseIcon with courseName:", error);
    }

    // Try partial matching with course ID if provided
    if (courseId) {
      try {
        const lowerCourseId = String(courseId).toLowerCase();
        for (const [key, iconPath] of Object.entries(courseIconMapping)) {
          if (lowerCourseId.includes(String(key).toLowerCase()) ||
            String(key).toLowerCase().includes(lowerCourseId)) {
            return iconPath;
          }
        }
      } catch (error) {
        console.error("Error in getCourseIcon with courseId:", error);
      }
    }
  } catch (error) {
    console.error("Unexpected error in getCourseIcon:", error);
  }

  // Default fallback icon
  return "/course-placeholder.png";
}

/**
 * Update course data with appropriate PNG icons
 * @param courses - Array of course objects
 * @returns Updated courses with PNG icon URLs
 */
export function updateCoursesWithPngIcons<T extends { id: string; name: string; iconUrl?: string | null }>(
  courses: T[]
): T[] {
  return courses.map(course => ({
    ...course,
    iconUrl: getCourseIcon(course.name, course.id)
  }));
}
