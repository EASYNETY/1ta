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
  
  // Azure courses
  "azure": "/images/icons/Microsoft Azure Fundamental-01-01.png",
  "microsoft-azure": "/images/icons/Microsoft Azure Fundamental-01-01.png",
  "azure-solution-architect": "/images/icons/Microsoft Solution Architect-01-01.png",
  
  // CompTIA courses
  "comptia-cloud": "/images/icons/CompTIA Cloud+-01-01.png",
  "comptia-cloud-essentials": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  
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
  
  // Design courses
  "ui-ux": "/images/icons/UI-UX DESIGN-01-01.png",
  "design": "/images/icons/UI-UX DESIGN-01-01.png",
  
  // Analytics courses
  "power-bi": "/images/icons/Power BI Certification-01-01.png",
  "data-science": "/images/icons/Power BI Certification-01-01.png",
  "analytics": "/images/icons/Power BI Certification-01-01.png",
  
  // Marketing courses
  "digital-marketing": "/images/icons/Digital Marketing Certification-01-01.png",
  "marketing": "/images/icons/Digital Marketing Certification-01-01.png",
  
  // AI/ML courses
  "ai": "/images/icons/Python for Beginners Certification-01-01.png",
  "ai-ml": "/images/icons/Python for Beginners Certification-01-01.png",
  "machine-learning": "/images/icons/Python for Beginners Certification-01-01.png",
  "AI & Machine Learning Mastery": "/images/icons/Python for Beginners Certification-01-01.png",
  
  // Cybersecurity courses
  "cybersecurity": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "security": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "Advanced Cybersecurity Defense": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  
  // DevOps courses
  "devops": "/images/icons/AWS Solution Architect Associate-01-01.png",
  "DevOps Engineering & Automation": "/images/icons/AWS Solution Architect Associate-01-01.png",
  
  // ISO courses
  "iso": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "iso-27001": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "iso-9001": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "ISO 27001 Information Security": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  "ISO 9001 Quality Management": "/images/icons/CompTIA Cloud Essentials Certification-01-01.png",
  
  // Data Science courses
  "Data Science & Big Data Analytics": "/images/icons/Power BI Certification-01-01.png",
  "big-data": "/images/icons/Power BI Certification-01-01.png",
};

/**
 * Get the appropriate PNG icon for a course based on its name or ID
 * @param courseName - The course name or ID
 * @param courseId - Optional course ID for fallback matching
 * @returns The path to the PNG icon or a default icon
 */
export function getCourseIcon(courseName: string, courseId?: string): string {
  // First try exact match with course name
  if (courseIconMapping[courseName]) {
    return courseIconMapping[courseName];
  }
  
  // Try exact match with course ID if provided
  if (courseId && courseIconMapping[courseId]) {
    return courseIconMapping[courseId];
  }
  
  // Try partial matching with course name (case insensitive)
  const lowerCourseName = courseName.toLowerCase();
  for (const [key, iconPath] of Object.entries(courseIconMapping)) {
    if (lowerCourseName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCourseName)) {
      return iconPath;
    }
  }
  
  // Try partial matching with course ID if provided
  if (courseId) {
    const lowerCourseId = courseId.toLowerCase();
    for (const [key, iconPath] of Object.entries(courseIconMapping)) {
      if (lowerCourseId.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCourseId)) {
        return iconPath;
      }
    }
  }
  
  // Default fallback icon
  return "/images/icons/Python for Beginners Certification-01-01.png";
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
