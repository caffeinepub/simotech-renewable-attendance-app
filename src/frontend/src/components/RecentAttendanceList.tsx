import { useGetCallerAttendanceHistory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import LocationDisplay from './LocationDisplay';
import { Clock } from 'lucide-react';

export default function RecentAttendanceList() {
  const { data: records, isLoading } = useGetCallerAttendanceHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>No attendance records found for this month</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort by most recent first
  const sortedRecords = [...records].sort((a, b) => 
    Number(b.checkInTime - a.checkInTime)
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Attendance
        </CardTitle>
        <CardDescription>Your attendance history for this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRecords.slice(0, 10).map((record, index) => {
            const checkInDate = new Date(Number(record.checkInTime / BigInt(1_000_000)));
            const checkOutDate = record.checkOutTime 
              ? new Date(Number(record.checkOutTime / BigInt(1_000_000)))
              : null;

            const hoursWorked = checkOutDate
              ? ((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(2)
              : null;

            return (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {checkInDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In: {checkInDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    {checkOutDate && (
                      <p className="text-sm text-muted-foreground">
                        Out: {checkOutDate.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                  {hoursWorked && (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{hoursWorked}h</p>
                      <p className="text-xs text-muted-foreground">worked</p>
                    </div>
                  )}
                </div>
                <LocationDisplay 
                  latitude={record.location.latitude}
                  longitude={record.location.longitude}
                  className="text-muted-foreground"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

