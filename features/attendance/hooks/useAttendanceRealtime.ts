import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import {
  fetchCourseAttendance,
  fetchStudentAttendance,
  fetchAllAttendanceRecords
} from '../store/attendance-slice';

interface UseAttendanceRealtimeOptions {
  courseClassId?: string;
  studentId?: string;
  enabled?: boolean;
  includeAnalytics?: boolean;
}

export const useAttendanceRealtime = ({
  courseClassId,
  studentId,
  enabled = true,
  includeAnalytics = false
}: UseAttendanceRealtimeOptions) => {
  const dispatch = useAppDispatch();

  const handleAttendanceUpdate = useCallback((data: any) => {
    console.log('📊 Attendance update received:', data);

    // Refetch course attendance if courseClassId matches
    if (courseClassId && data.classId === courseClassId) {
      dispatch(fetchCourseAttendance(courseClassId));
    }

    // Refetch student attendance if studentId matches
    if (studentId && data.studentId === studentId) {
      dispatch(fetchStudentAttendance(studentId));
    }

    // Refetch analytics data if requested
    if (includeAnalytics) {
      dispatch(fetchAllAttendanceRecords());
    }
  }, [courseClassId, studentId, includeAnalytics, dispatch]);

  const handleAttendanceMarked = useCallback((data: any) => {
    console.log('✅ Attendance marked:', data);
    handleAttendanceUpdate(data);
  }, [handleAttendanceUpdate]);

  const handleAttendanceUpdated = useCallback((data: any) => {
    console.log('🔄 Attendance updated:', data);
    handleAttendanceUpdate(data);
  }, [handleAttendanceUpdate]);

  // Set up real-time listeners for attendance events
  useRealtimeUpdates({
    eventName: 'attendance_marked',
    onUpdate: handleAttendanceMarked,
    enabled: enabled && !!courseClassId,
  });

  useRealtimeUpdates({
    eventName: 'attendance_updated',
    onUpdate: handleAttendanceUpdated,
    enabled: enabled && !!courseClassId,
  });

  return {
    isConnected: true, // Will be updated by the hook
  };
};