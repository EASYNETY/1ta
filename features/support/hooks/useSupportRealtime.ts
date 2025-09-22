import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import {
  fetchAllTickets,
  fetchTicketById,
  fetchMyTickets
} from '../store/supportSlice';

interface UseSupportRealtimeOptions {
  userId?: string;
  ticketId?: string;
  enabled?: boolean;
  includeAdminView?: boolean;
}

export const useSupportRealtime = ({
  userId,
  ticketId,
  enabled = true,
  includeAdminView = false
}: UseSupportRealtimeOptions) => {
  const dispatch = useAppDispatch();

  const handleTicketUpdate = useCallback((data: any) => {
    console.log('🎫 Support ticket update received:', data);

    // Refetch user tickets if userId matches
    if (userId && data.userId === userId) {
      dispatch(fetchMyTickets({ userId }));
    }

    // Refetch admin tickets if requested
    if (includeAdminView) {
      dispatch(fetchAllTickets({}));
    }

    // Refetch specific ticket if ticketId matches
    if (ticketId && data.ticketId === ticketId) {
      dispatch(fetchTicketById({ ticketId, userId: userId || '', role: 'user' }));
    }
  }, [userId, ticketId, includeAdminView, dispatch]);

  const handleTicketCreated = useCallback((data: any) => {
    console.log('🆕 Support ticket created:', data);
    handleTicketUpdate(data);
  }, [handleTicketUpdate]);

  const handleTicketUpdated = useCallback((data: any) => {
    console.log('🔄 Support ticket updated:', data);
    handleTicketUpdate(data);
  }, [handleTicketUpdate]);

  const handleTicketStatusChanged = useCallback((data: any) => {
    console.log('📊 Support ticket status changed:', data);
    handleTicketUpdate(data);
  }, [handleTicketUpdate]);

  const handleTicketResponseAdded = useCallback((data: any) => {
    console.log('💬 Support ticket response added:', data);
    handleTicketUpdate(data);
  }, [handleTicketUpdate]);

  // Set up real-time listeners for support events
  useRealtimeUpdates({
    eventName: 'ticket_created',
    onUpdate: handleTicketCreated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'ticket_updated',
    onUpdate: handleTicketUpdated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'ticket_status_changed',
    onUpdate: handleTicketStatusChanged,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'ticket_response_added',
    onUpdate: handleTicketResponseAdded,
    enabled: enabled && !!userId,
  });

  return {
    isConnected: true, // Will be updated by the hook
  };
};