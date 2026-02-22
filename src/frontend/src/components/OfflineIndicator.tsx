import { useOfflineSync } from '../hooks/useOfflineSync';
import { Alert, AlertDescription } from './ui/alert';
import { WifiOff, Wifi, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, lastSyncTime } = useOfflineSync();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    if (lastSyncTime && pendingCount === 0) {
      setShowSyncSuccess(true);
      const timer = setTimeout(() => setShowSyncSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncTime, pendingCount]);

  if (isOnline && !isSyncing && pendingCount === 0 && !showSyncSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-fade-in">
      {!isOnline && (
        <Alert variant="destructive" className="shadow-medium">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are offline. Changes will be synced when you reconnect.
            {pendingCount > 0 && ` (${pendingCount} pending)`}
          </AlertDescription>
        </Alert>
      )}

      {isOnline && isSyncing && (
        <Alert className="shadow-medium bg-accent text-accent-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Syncing {pendingCount} pending record{pendingCount !== 1 ? 's' : ''}...
          </AlertDescription>
        </Alert>
      )}

      {showSyncSuccess && (
        <Alert className="shadow-medium bg-primary text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            All records synced successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

