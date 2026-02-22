import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { AttendanceRecord } from '../backend';

export function useCurrentAttendanceStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<{ isCheckedIn: boolean; lastRecord: AttendanceRecord | null }>({
    queryKey: ['currentAttendanceStatus'],
    queryFn: async () => {
      if (!actor || !identity) {
        return { isCheckedIn: false, lastRecord: null };
      }

      const principal = identity.getPrincipal();
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const records = await actor.getMonthlyReport(principal, BigInt(year), BigInt(month));
      
      if (records.length === 0) {
        return { isCheckedIn: false, lastRecord: null };
      }

      // Get today's records
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = BigInt(today.getTime() * 1_000_000);

      const todayRecords = records.filter(record => {
        const recordDate = new Date(Number(record.checkInTime / BigInt(1_000_000)));
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });

      if (todayRecords.length === 0) {
        return { isCheckedIn: false, lastRecord: null };
      }

      // Get the most recent record
      const lastRecord = todayRecords[todayRecords.length - 1];
      const isCheckedIn = !lastRecord.checkOutTime;

      return { isCheckedIn, lastRecord };
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

