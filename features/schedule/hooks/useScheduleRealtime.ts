import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import {
  fetchSchedule,
  fetchAllScheduleEvents,
  fetchScheduleEventById
} from '../store/schedule-slice';

interface UseScheduleRealtimeOptions {
  userId?: string;
  role?: string;
  eventId?: string;
  enabled?: boolean;
  includeAllEvents?: boolean;
}

export const useScheduleRealtime = ({
  userId,
  role,
  eventId,
  enabled = true,
  includeAllEvents = false
}: UseScheduleRealtimeOptions) => {
  const dispatch = useAppDispatch();

  const handleScheduleUpdate = useCallback((data: any) => {
    console.log('📅 Schedule update received:', data);

    // Refetch schedule if user/role matches
    if (userId && role && data.userId === userId) {
      dispatch(fetchSchedule({ role, userId }));
    }

    // Refetch all events if requested
    if (includeAllEvents) {
      dispatch(fetchAllScheduleEvents());
    }

    // Refetch specific event if eventId matches
    if (eventId && data.eventId === eventId) {
      dispatch(fetchScheduleEventById(eventId));
    }
  }, [userId, role, eventId, includeAllEvents, dispatch]);

  const handleEventCreated = useCallback((data: any) => {
    console.log('🆕 Schedule event created:', data);
    handleScheduleUpdate(data);
  }, [handleScheduleUpdate]);

  const handleEventUpdated = useCallback((data: any) => {
    console.log('🔄 Schedule event updated:', data);
    handleScheduleUpdate(data);
  }, [handleScheduleUpdate]);

  const handleEventDeleted = useCallback((data: any) => {
    console.log('🗑️ Schedule event deleted:', data);
    handleScheduleUpdate(data);
  }, [handleScheduleUpdate]);

  // Set up real-time listeners for schedule events
  useRealtimeUpdates({
    eventName: 'schedule_event_created',
    onUpdate: handleEventCreated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'schedule_event_updated',
    onUpdate: handleEventUpdated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'schedule_event_deleted',
    onUpdate: handleEventDeleted,
    enabled: enabled && !!userId,
  });

  return {
    isConnected: true, // Will be updated by the hook
  };
};