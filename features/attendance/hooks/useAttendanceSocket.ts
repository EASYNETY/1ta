import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService, useSocket } from '@/services/socketService';
import { fetchCourseAttendance } from '@/features/attendance/store/attendance-slice';
import { selectCourseClass } from '@/features/classes/store/classSessionSlice';

export const useAttendanceSocket = () => {
  const dispatch = useDispatch();
  const { joinRoom } = useSocket();
  const selectedClass = useSelector(selectCourseClass);

  useEffect(() => {
    // Join attendance updates room
    if (selectedClass?.id) {
      joinRoom(`attendance_updates`);
    }

    // Listen for attendance events
    const handleAttendanceUpdate = (data) => {
      console.log('Attendance update received:', data);
      // If it's for the selected class, refetch or update local state
      if (selectedClass?.id && data.classId === selectedClass.id) {
        dispatch(fetchCourseAttendance(selectedClass.id));
      }
    };

    socketService.getIO()?.on('attendance_marked', handleAttendanceUpdate);
    socketService.getIO()?.on('attendance_updated', handleAttendanceUpdate);

    return () => {
      socketService.getIO()?.off('attendance_marked', handleAttendanceUpdate);
      socketService.getIO()?.off('attendance_updated', handleAttendanceUpdate);
    };
  }, [selectedClass?.id]);
};