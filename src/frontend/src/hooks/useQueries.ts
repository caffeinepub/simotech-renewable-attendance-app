import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { AttendanceRecord, Employee, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

// Get caller's user profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Save caller's user profile
export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      console.log('[useSaveCallerUserProfile] Profile saved, invalidating queries');
    },
  });
}

// Check if caller is admin (deprecated - use useIsAdmin hook instead)
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useIsCallerAdmin] Actor not available');
        return false;
      }
      console.log('[useIsCallerAdmin] Calling backend isAdmin()');
      const result = await actor.isAdmin();
      console.log('[useIsCallerAdmin] Backend returned:', result);
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

// Get all employees (admin only)
export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();

  return useQuery<Employee[]>({
    queryKey: ['allEmployees'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useGetAllEmployees] Fetching all employees');
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get monthly report
export function useGetMonthlyReport(employeeId: Principal | null, year: number, month: number) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['monthlyReport', employeeId?.toString(), year, month],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      return actor.getMonthlyReport(employeeId, BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Get caller's attendance history
export function useGetCallerAttendanceHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['callerAttendanceHistory'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      return actor.getMonthlyReport(principal, BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
