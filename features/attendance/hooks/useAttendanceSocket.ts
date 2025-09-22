import { useAppSelector } from '@/store/hooks';
import { useAttendanceRealtime } from './useAttendanceRealtime';
import { selectCourseClass } from '@/features/classes/store/classSessionSlice';

export const useAttendanceSocket = () => {
  const selectedClass = useAppSelector(selectCourseClass);

  // Use the new real-time hook with course class context
  useAttendanceRealtime({
    courseClassId: selectedClass?.id,
    enabled: !!selectedClass?.id,
    includeAnalytics: true,
  });

  return {
    isConnected: true, // Will be updated by the real-time hook
  };
};