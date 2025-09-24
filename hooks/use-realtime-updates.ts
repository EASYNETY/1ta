import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { socketService, useSocket } from '@/services/socketService';

interface UseRealtimeUpdatesOptions {
  roomId?: string;
  eventName: string;
  onUpdate: (data: any) => void;
  enabled?: boolean;
  debounceMs?: number;
}

export const useRealtimeUpdates = ({
  roomId,
  eventName,
  onUpdate,
  enabled = true,
  debounceMs = 0
}: UseRealtimeUpdatesOptions) => {
  const dispatch = useAppDispatch();
  const { joinRoom } = useSocket();

  const debouncedOnUpdate = useCallback(
    debounce((data: any) => onUpdate(data), debounceMs),
    [onUpdate, debounceMs]
  );

  useEffect(() => {
    if (!enabled) return;

    // Join room if specified
    if (roomId) {
      joinRoom(roomId);
    }

    // Set up event listener
    const handleUpdate = (data: any) => {
      console.log(`📡 Realtime update received for ${eventName}:`, data);
      debouncedOnUpdate(data);
    };

    // Get the socket instance and set up event listener
    const socket = socketService.getIO();
    if (socket) {
      socket.on(eventName, handleUpdate);
    }

    return () => {
      const cleanupSocket = socketService.getIO();
      if (cleanupSocket) {
        cleanupSocket.off(eventName, handleUpdate);
      }
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId, eventName, enabled, debouncedOnUpdate]);

  return {
    isConnected: socketService.isConnected(),
    connectionStatus: socketService.getConnectionStatus(),
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}