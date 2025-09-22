import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import {
  fetchMyPaymentHistory,
  fetchAllPaymentsAdmin,
  getPaymentById
} from '../store/payment-slice';

interface UsePaymentRealtimeOptions {
  userId?: string;
  paymentId?: string;
  enabled?: boolean;
  includeAdminView?: boolean;
}

export const usePaymentRealtime = ({
  userId,
  paymentId,
  enabled = true,
  includeAdminView = false
}: UsePaymentRealtimeOptions) => {
  const dispatch = useAppDispatch();

  const handlePaymentUpdate = useCallback((data: any) => {
    console.log('💳 Payment update received:', data);

    // Refetch user payment history if userId matches
    if (userId && data.userId === userId) {
      dispatch(fetchMyPaymentHistory({ userId }));
    }

    // Refetch admin payments if requested
    if (includeAdminView) {
      dispatch(fetchAllPaymentsAdmin({}));
    }

    // Refetch specific payment if paymentId matches
    if (paymentId && data.paymentId === paymentId) {
      dispatch(getPaymentById(paymentId));
    }
  }, [userId, paymentId, includeAdminView, dispatch]);

  const handlePaymentCreated = useCallback((data: any) => {
    console.log('💰 Payment created:', data);
    handlePaymentUpdate(data);
  }, [handlePaymentUpdate]);

  const handlePaymentUpdated = useCallback((data: any) => {
    console.log('🔄 Payment updated:', data);
    handlePaymentUpdate(data);
  }, [handlePaymentUpdate]);

  const handlePaymentStatusChanged = useCallback((data: any) => {
    console.log('📊 Payment status changed:', data);
    handlePaymentUpdate(data);
  }, [handlePaymentUpdate]);

  // Set up real-time listeners for payment events
  useRealtimeUpdates({
    eventName: 'payment_created',
    onUpdate: handlePaymentCreated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'payment_updated',
    onUpdate: handlePaymentUpdated,
    enabled: enabled && !!userId,
  });

  useRealtimeUpdates({
    eventName: 'payment_status_changed',
    onUpdate: handlePaymentStatusChanged,
    enabled: enabled && !!userId,
  });

  return {
    isConnected: true, // Will be updated by the hook
  };
};