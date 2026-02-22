import { useCheckIn } from '../hooks/useCheckIn';
import { useCheckOut } from '../hooks/useCheckOut';
import { useCurrentAttendanceStatus } from '../hooks/useCurrentAttendanceStatus';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';

export default function AttendanceActions() {
  const { data: status, isLoading: statusLoading } = useCurrentAttendanceStatus();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const { getCurrentPosition, isLoading: geoLoading, error: geoError } = useGeolocation();
  const [actionError, setActionError] = useState<string | null>(null);

  const isCheckedIn = status?.isCheckedIn || false;

  const handleCheckIn = async () => {
    setActionError(null);
    try {
      const position = await getCurrentPosition();
      await checkIn.mutateAsync(position);
    } catch (error: any) {
      setActionError(error.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    setActionError(null);
    try {
      await checkOut.mutateAsync();
    } catch (error: any) {
      setActionError(error.message || 'Failed to check out');
    }
  };

  const isLoading = checkIn.isPending || checkOut.isPending || geoLoading || statusLoading;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Attendance
        </CardTitle>
        <CardDescription>
          {isCheckedIn ? 'You are currently checked in' : 'Check in to start tracking your time'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(actionError || geoError) && (
          <Alert variant="destructive">
            <AlertDescription>{actionError || geoError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {!isCheckedIn ? (
            <Button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="flex-1 h-20 text-lg font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src="/assets/generated/icon-checkin.dim_64x64.png" 
                    alt="Check In" 
                    className="h-8 w-8"
                  />
                  <span>Check In</span>
                </div>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCheckOut}
              disabled={isLoading}
              variant="secondary"
              className="flex-1 h-20 text-lg font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src="/assets/generated/icon-checkout.dim_64x64.png" 
                    alt="Check Out" 
                    className="h-8 w-8"
                  />
                  <span>Check Out</span>
                </div>
              )}
            </Button>
          )}
        </div>

        {status?.lastRecord && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            <p>
              Last check-in: {new Date(Number(status.lastRecord.checkInTime / BigInt(1_000_000))).toLocaleString()}
            </p>
            {status.lastRecord.checkOutTime && (
              <p>
                Last check-out: {new Date(Number(status.lastRecord.checkOutTime / BigInt(1_000_000))).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

