import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { addToOfflineQueue } from '../utils/offlineQueue';

export function useCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.checkIn(latitude, longitude);
      } catch (error) {
        // If offline or error, queue for later
        addToOfflineQueue({
          type: 'checkIn',
          data: { latitude, longitude },
          timestamp: Date.now(),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAttendanceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['callerAttendanceHistory'] });
    },
  });
}

