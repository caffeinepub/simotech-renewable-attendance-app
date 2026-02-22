import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { addToOfflineQueue } from '../utils/offlineQueue';

export function useCheckOut() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.checkOut();
      } catch (error) {
        // If offline or error, queue for later
        addToOfflineQueue({
          type: 'checkOut',
          data: {},
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

