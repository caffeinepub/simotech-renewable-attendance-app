import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useIsAdmin] Actor not available');
        return false;
      }
      console.log('[useIsAdmin] Calling backend isAdmin()');
      const result = await actor.isAdmin();
      console.log('[useIsAdmin] Backend returned:', result);
      return result;
    },
    enabled: !!actor && !isFetching,
  });

  console.log('[useIsAdmin] Hook state:', {
    actorAvailable: !!actor,
    actorFetching: isFetching,
    queryEnabled: !!actor && !isFetching,
    isLoading: query.isLoading,
    data: query.data,
    error: query.error,
  });

  return query;
}
