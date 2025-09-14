import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socketService, useSocket } from '@/services/socketService';
import { fetchSchedule } from '@/features/schedule/store/schedule-slice';

export const useScheduleSocket = () => {
  const dispatch = useDispatch();
  const { joinRoom } from useSocket();

  useEffect(() => {
    // Join timetable updates room
    joinRoom('timetable_updates');

    // Listen for schedule events
    const handleScheduleUpdate = (data) => {
      console.log('Schedule update received:', data);
      // Refetch schedule
      dispatch(fetchSchedule({
        role: 'teacher', // or get from auth
        userId: 'current-user-id', // or get from auth
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }));
    };

    socketService.getIO()?.on('schedule_event_updated', handleScheduleUpdate);
    socketService.getIO()?.on('schedule_event_created', handleScheduleUpdate);
    socketService.getIO()?.on('schedule_event_deleted', handleScheduleUpdate);

    return () => {
      socketService.getIO()?.off('schedule_event_updated', handleScheduleUpdate);
      socketService.getIO()?.off('schedule_event_created', handleScheduleUpdate);
      socketService.getIO()?.off('schedule_event_deleted', handleScheduleUpdate);
    };
  }, []);
};