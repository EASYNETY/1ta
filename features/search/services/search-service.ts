// features/search/services/search-service.ts
import { RootState } from "@/store";
import { SearchResult, SearchResultType } from "../types/search-types";
import { enhanceSearchWithHelpContent } from "./help-search-indexer";
import { getCourseIcon } from "@/utils/course-icon-mapping";

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

    // Search classes
    const classes = state.classes?.adminClasses || [];
    classes.forEach(classItem => {
      if (
        classItem.courseTitle?.toLowerCase().includes(lowerQuery) ||
        classItem.description?.toLowerCase().includes(lowerQuery) ||
        classItem.teacherName?.toLowerCase().includes(lowerQuery) ||
        classItem.location?.toLowerCase().includes(lowerQuery) ||
        classItem.schedule?.toLowerCase().includes(lowerQuery)
      ) {
        // Check if class has available slots and enrolment has started
        const hasAvailableSlots = classItem.maxSlots && classItem.studentCount
          ? classItem.maxSlots > classItem.studentCount
          : true;
        const enrolmentStarted = classItem.enrolmentStartDate
          ? new Date(classItem.enrolmentStartDate) <= new Date()
          : true;
        const enrolmentStatus = hasAvailableSlots && enrolmentStarted ? 'open' : 'closed';

        results.push({
          id: classItem.id,
          title: classItem.courseTitle,
          description: classItem.description?.substring(0, 100) + '...' || 'Class for ' + classItem.courseTitle,
          type: 'class',
          href: `/classes/${classItem.id}`,
          status: enrolmentStatus,
          date: classItem.startDate,
          metadata: {
            courseId: classItem.courseId,
            teacherId: classItem.teacherId,
            teacherName: classItem.teacherName,
            schedule: classItem.schedule,
            location: classItem.location,
            maxSlots: classItem.maxSlots,
            availableSlots: classItem.maxSlots ? classItem.maxSlots - (classItem.studentCount || 0) : undefined,
            enrolmentStartDate: classItem.enrolmentStartDate,
            startDate: classItem.startDate,
            endDate: classItem.endDate,
            status: classItem.status
          }
        });
      }
    });

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
          status: course.available_for_enrolment ? 'open' : 'closed', // Updated to use available_for_enrolment
          image: course.iconUrl || course.image || getCourseIcon(course.title, course.id),
          category: course.category,
          date: course.lastAccessedDate || course.enrolmentDate,
          metadata: {
            instructor: course.instructor?.name,
            level: course.level,
            progress: course.progress,
            priceUSD: course.priceUSD,
            discountPriceUSD: course.discountPriceUSD,
            // Include optional fields only if they exist
            ...(course.lessonCount && { lessonCount: course.lessonCount }),
            ...(course.moduleCount && { moduleCount: course.moduleCount }),
            courseId: course.id,
            slug: course.slug,
            available_for_enrolment: course.available_for_enrolment // Add enrolment availability
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
            assignmentType: 'assignment', // Default type for assignments
            allowLateSubmissions: assignment.allowLateSubmissions,
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt,
            createdBy: assignment.createdBy
          }
        });
      }
    });

    // Search grade items
    const gradeItems = state.grades?.gradeItems || [];
    gradeItems.forEach(gradeItem => {
      if (
        gradeItem.title.toLowerCase().includes(lowerQuery) ||
        (gradeItem.courseTitle && gradeItem.courseTitle.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: gradeItem.id,
          title: gradeItem.title,
          description: `${gradeItem.courseTitle || 'Course'} - Points: ${gradeItem.pointsPossible}`,
          type: 'grade',
          href: `/grades`,
          date: gradeItem.updatedAt,
          metadata: {
            pointsPossible: gradeItem.pointsPossible,
            courseTitle: gradeItem.courseTitle,
            courseId: gradeItem.courseId
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
          description: `Amount: ₦${(payment.amount).toLocaleString()} - ${payment.status}`,
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

    // Enhance search results with help content
    return enhanceSearchWithHelpContent(results, query);
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
        date: course.lastAccessedDate || course.enrolmentDate || new Date().toISOString(),
        image: course.iconUrl || course.image || getCourseIcon(course.title, course.id),
        status: course.enrolmentStatus,
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
    case 'class': return 'class';
    case 'payment': return 'payment';
    case 'event': return 'event';
    case 'help': return 'help';
    case 'user': return 'user';
    default: return 'course'; // Default fallback
  }
}
