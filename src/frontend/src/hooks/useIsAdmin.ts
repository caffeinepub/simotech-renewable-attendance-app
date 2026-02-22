import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  console.log('[useIsAdmin] ===== HOOK INVOKED =====', {
    timestamp: new Date().toISOString(),
    actorAvailable: !!actor,
    actorFetching: isFetching,
    willEnableQuery: !!actor && !isFetching,
  });

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      console.log('[useIsAdmin] ===== QUERY FUNCTION EXECUTING =====');
      console.log('[useIsAdmin] Timestamp:', new Date().toISOString());
      console.log('[useIsAdmin] Actor state check:', {
        actorExists: !!actor,
        actorType: typeof actor,
        actorKeys: actor ? Object.keys(actor).slice(0, 5) : [],
      });
      
      if (!actor) {
        console.error('[useIsAdmin] ❌ Actor not available - returning false');
        console.error('[useIsAdmin] This should not happen if query is properly enabled');
        return false;
      }
      
      console.log('[useIsAdmin] ✓ Actor available, calling backend isAdmin()');
      console.log('[useIsAdmin] Actor methods available:', {
        hasIsAdmin: typeof actor.isAdmin === 'function',
        hasIsCallerAdmin: typeof actor.isCallerAdmin === 'function',
      });
      
      try {
        console.log('[useIsAdmin] 🔄 Calling actor.isAdmin()...');
        const startTime = Date.now();
        const result = await actor.isAdmin();
        const endTime = Date.now();
        
        console.log('[useIsAdmin] ✓ Backend isAdmin() call completed');
        console.log('[useIsAdmin] Call duration:', endTime - startTime, 'ms');
        console.log('[useIsAdmin] Raw result:', result);
        console.log('[useIsAdmin] Result type:', typeof result);
        console.log('[useIsAdmin] Result value (strict):', result === true ? 'TRUE' : result === false ? 'FALSE' : 'OTHER');
        console.log('[useIsAdmin] Result as boolean:', Boolean(result));
        
        return result;
      } catch (error) {
        console.error('[useIsAdmin] ❌ ERROR calling backend isAdmin()');
        console.error('[useIsAdmin] Error object:', error);
        console.error('[useIsAdmin] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined,
          errorType: typeof error,
          errorConstructor: error?.constructor?.name,
        });
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 0, // Always refetch to ensure fresh data
  });

  console.log('[useIsAdmin] ===== QUERY STATE =====', {
    timestamp: new Date().toISOString(),
    status: query.status,
    fetchStatus: query.fetchStatus,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    isFetched: query.isFetched,
    isFetchedAfterMount: query.isFetchedAfterMount,
    data: query.data,
    dataType: typeof query.data,
    dataValue: query.data === true ? 'TRUE' : query.data === false ? 'FALSE' : 'UNDEFINED/NULL',
    error: query.error ? {
      message: query.error instanceof Error ? query.error.message : String(query.error),
      name: query.error instanceof Error ? query.error.name : 'Unknown',
    } : null,
    enabled: !!actor && !isFetching,
  });

  console.log('[useIsAdmin] ===== ACTOR STATE =====', {
    timestamp: new Date().toISOString(),
    actorAvailable: !!actor,
    actorFetching: isFetching,
    queryEnabled: !!actor && !isFetching,
  });

  return query;
}
