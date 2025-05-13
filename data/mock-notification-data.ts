// data/mock-notification-data.ts

import { formatISO, subHours, subDays, subMinutes } from "date-fns";
import type { Notification } from "@/features/notifications/types/notification-types";

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: "notif_1",
    userId: "student_123",
    title: "New Assignment Posted",
    message: "Web Development assignment 3 is now available. Due in 7 days.",
    type: "assignment",
    read: false,
    createdAt: formatISO(subHours(new Date(), 1)),
    href: "/assignments/webdev-3"
  },
  {
    id: "notif_2",
    userId: "student_123",
    title: "Grade Update",
    message: "Your Data Science Midterm grade has been posted. You scored 85%.",
    type: "grade",
    read: false,
    createdAt: formatISO(subHours(new Date(), 4)),
    href: "/grades"
  },
  {
    id: "notif_3",
    userId: "student_123",
    title: "Class Reminder",
    message: "Cybersecurity lecture starts in 15 minutes. Join via the class link.",
    type: "course",
    read: true,
    createdAt: formatISO(subDays(new Date(), 1)),
    href: "/timetable"
  },
  {
    id: "notif_4",
    userId: "student_123",
    title: "New Message",
    message: "You have a new message from Dr. Smith regarding your project.",
    type: "message",
    read: false,
    createdAt: formatISO(subHours(new Date(), 2)),
    href: "/chat/room_1"
  },
  {
    id: "notif_5",
    userId: "student_123",
    title: "Payment Confirmed",
    message: "Your payment of ₦45,000 for PMP Certification has been processed.",
    type: "payment",
    read: true,
    createdAt: formatISO(subDays(new Date(), 2)),
    href: "/payment/history"
  },
  {
    id: "notif_6",
    userId: "student_123",
    title: "System Maintenance",
    message: "The platform will be down for maintenance on Sunday from 2-4 AM.",
    type: "system",
    read: false,
    createdAt: formatISO(subHours(new Date(), 12)),
    href: "#"
  },
  {
    id: "notif_7",
    userId: "student_123",
    title: "Course Update",
    message: "New content has been added to your Web Development course.",
    type: "course",
    read: true,
    createdAt: formatISO(subDays(new Date(), 3)),
    href: "/courses/web-development"
  },
  {
    id: "notif_8",
    userId: "student_123",
    title: "Assignment Due Soon",
    message: "Your Data Science assignment is due in 24 hours.",
    type: "assignment",
    read: false,
    createdAt: formatISO(subHours(new Date(), 23)),
    href: "/assignments/data-science-2"
  },
  {
    id: "notif_9",
    userId: "student_123",
    title: "New Announcement",
    message: "Important announcement about the upcoming holiday schedule.",
    type: "announcement",
    read: true,
    createdAt: formatISO(subDays(new Date(), 4)),
    href: "/announcements"
  },
  {
    id: "notif_10",
    userId: "student_123",
    title: "Profile Update Required",
    message: "Please update your profile information to complete your registration.",
    type: "system",
    read: false,
    createdAt: formatISO(subMinutes(new Date(), 30)),
    href: "/profile"
  }
];

// Mock API function to get notifications
export const mockFetchNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  console.log(`MOCK: Fetching notifications for user ${userId}, page ${page}, limit ${limit}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter notifications for the user
  const userNotifications = mockNotifications.filter(n => n.userId === userId);
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(userNotifications.length / limit);
  
  return {
    notifications: paginatedNotifications,
    pagination: {
      total: userNotifications.length,
      page,
      limit,
      totalPages
    }
  };
};

// Mock API function to mark a notification as read
export const mockMarkNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; message?: string }> => {
  console.log(`MOCK: Marking notification ${notificationId} as read`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find the notification
  const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex === -1) {
    return {
      success: false,
      message: "Notification not found"
    };
  }
  
  // Mark as read
  mockNotifications[notificationIndex].read = true;
  
  return {
    success: true,
    message: "Notification marked as read"
  };
};

// Mock API function to mark all notifications as read
export const mockMarkAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; message?: string }> => {
  console.log(`MOCK: Marking all notifications as read for user ${userId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mark all notifications for the user as read
  mockNotifications.forEach(notification => {
    if (notification.userId === userId) {
      notification.read = true;
    }
  });
  
  return {
    success: true,
    message: "All notifications marked as read"
  };
};
