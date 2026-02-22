import { useEffect, useState } from 'react';
import { useActor } from './useActor';
import { getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';
import { useQueryClient } from '@tanstack/react-query';

export function useOfflineSync() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const updatePendingCount = () => {
      const queue = getOfflineQueue();
      setPendingCount(queue.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const syncQueue = async () => {
      if (!isOnline || !actor || isSyncing) return;

      const queue = getOfflineQueue();
      if (queue.length === 0) return;

      setIsSyncing(true);

      try {
        for (const item of queue) {
          if (item.type === 'checkIn') {
            await actor.checkIn(item.data.latitude, item.data.longitude);
          } else if (item.type === 'checkOut') {
            await actor.checkOut();
          }
        }

        clearOfflineQueue();
        setPendingCount(0);
        setLastSyncTime(new Date());
        queryClient.invalidateQueries({ queryKey: ['currentAttendanceStatus'] });
        queryClient.invalidateQueries({ queryKey: ['callerAttendanceHistory'] });
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    if (isOnline && actor) {
      syncQueue();
    }
  }, [isOnline, actor, isSyncing, queryClient]);

  return { isOnline, isSyncing, pendingCount, lastSyncTime };
}

