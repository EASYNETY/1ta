// features/search/services/search-service.ts
import { RootState } from "@/store";
import { SearchResult } from "../types/search-types";

/**
 * Search service that searches across the Redux store
 */
export const searchService = {
  /**
   * Search across all data in the Redux store
   */
  searchStore: (state: RootState, query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search courses
    const courses = state.auth_courses?.courses || [];
    courses.forEach(course => {
      if (
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.instructor?.name?.toLowerCase().includes(lowerQuery) ||
        course.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: course.id,
          title: course.title,
          description: course.description.substring(0, 100) + '...',
          type: 'course',
          href: `/courses/${course.slug}`,
          status: course.enrollmentStatus,
          image: course.image,
          category: course.category,
          date: course.lastUpdated || course.enrollmentDate,
          metadata: {
            instructor: course.instructor?.name,
            level: course.level,
            progress: course.progress,
            priceUSD: course.priceUSD,
            discountPriceUSD: course.discountPriceUSD,
            studentsEnrolled: course.studentsEnrolled,
            rating: course.rating,
            reviewsCount: course.reviewsCount,
            courseId: course.id,
            slug: course.slug
          }
        });
      }
    });

    // Search assignments
    const assignments = state.assignments?.assignments || [];
    assignments.forEach(assignment => {
      if (
        assignment.title.toLowerCase().includes(lowerQuery) ||
        (assignment.description && assignment.description.toLowerCase().includes(lowerQuery)) ||
        (assignment.courseTitle && assignment.courseTitle.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description?.substring(0, 100) + '...' || 'No description',
          type: 'assignment',
          href: `/assignments/${assignment.id}`,
          date: assignment.dueDate,
          status: assignment.status,
          metadata: {
            courseId: assignment.courseId,
            courseTitle: assignment.courseTitle,
            pointsPossible: assignment.pointsPossible,
            type: assignment.type || 'assignment',
            allowLateSubmissions: assignment.allowLateSubmissions,
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt,
            createdBy: assignment.createdBy
          }
        });
      }
    });

    // Search grades
    const grades = state.grades?.grades || [];
    grades.forEach(grade => {
      if (
        grade.title.toLowerCase().includes(lowerQuery) ||
        grade.courseName.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: grade.id,
          title: grade.title,
          description: `${grade.courseName} - Score: ${grade.score}%`,
          type: 'grade',
          href: `/grades`,
          date: grade.date,
          metadata: {
            score: grade.score,
            courseName: grade.courseName
          }
        });
      }
    });

    // Search events
    const events = state.schedule?.events || [];
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery) ||
        event.instructor?.toLowerCase().includes(lowerQuery) ||
        event.courseTitle?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: event.id,
          title: event.title,
          description: event.description || 'No description',
          type: 'event',
          href: `/schedule`,
          date: event.startTime,
          metadata: {
            endTime: event.endTime,
            location: event.location,
            instructor: event.instructor,
            courseTitle: event.courseTitle,
            type: event.type,
            courseId: event.courseId,
            classId: event.classId,
            meetingLink: event.meetingLink,
            attendees: event.attendees,
            instructorId: event.instructorId,
            isUpcoming: new Date(event.startTime) > new Date()
          }
        });
      }
    });

    // Search payments
    const myPayments = state.paymentHistory?.myPayments || [];
    myPayments.forEach(payment => {
      if (
        payment.description.toLowerCase().includes(lowerQuery) ||
        payment.providerReference.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: payment.id,
          title: payment.description,
          description: `Amount: ₦${(payment.amount / 100).toLocaleString()} - ${payment.status}`,
          type: 'payment',
          href: `/payments`,
          date: payment.createdAt,
          status: payment.status,
          metadata: {
            amount: payment.amount,
            currency: payment.currency,
            provider: payment.provider,
            providerReference: payment.providerReference
          }
        });
      }
    });

    return results;
  },

  /**
   * Get recent activity based on notifications and other recent items
   */
  getRecentActivity: (state: RootState): SearchResult[] => {
    const results: SearchResult[] = [];

    // Get recent notifications and convert to search results
    const notifications = state.notifications?.notifications || [];
    notifications.slice(0, 5).forEach(notification => {
      if (notification.href) {
        results.push({
          id: notification.id,
          title: notification.title,
          description: notification.message,
          type: mapNotificationTypeToSearchType(notification.type),
          href: notification.href,
          date: notification.createdAt,
          metadata: notification.metadata
        });
      }
    });

    // Add most recent accessed courses
    const courses = state.auth_courses?.courses || [];
    const recentCourses = [...courses]
      .sort((a, b) => {
        const dateA = a.lastAccessedDate ? new Date(a.lastAccessedDate).getTime() : 0;
        const dateB = b.lastAccessedDate ? new Date(b.lastAccessedDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);

    recentCourses.forEach(course => {
      results.push({
        id: course.id,
        title: course.title,
        description: `Last accessed course`,
        type: 'course',
        href: `/courses/${course.slug}`,
        date: course.lastAccessedDate || course.enrollmentDate || new Date().toISOString(),
        image: course.image,
        status: course.enrollmentStatus,
        category: course.category
      });
    });

    // Add upcoming assignments
    const assignments = state.assignments?.assignments || [];
    const upcomingAssignments = [...assignments]
      .filter(a => new Date(a.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 2);

    upcomingAssignments.forEach(assignment => {
      results.push({
        id: assignment.id,
        title: assignment.title,
        description: `Due soon`,
        type: 'assignment',
        href: `/assignments/${assignment.id}`,
        date: assignment.dueDate,
        status: assignment.status
      });
    });

    // Sort by date (most recent first) and limit to 10
    return results
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }
};

/**
 * Map notification type to search result type
 */
function mapNotificationTypeToSearchType(notificationType: string): SearchResultType {
  switch (notificationType) {
    case 'assignment': return 'assignment';
    case 'grade': return 'grade';
    case 'course': return 'course';
    case 'payment': return 'payment';
    default: return 'course'; // Default fallback
  }
}
