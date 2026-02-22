import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useCurrentAttendanceStatus } from '../hooks/useCurrentAttendanceStatus';
import AttendanceActions from '../components/AttendanceActions';
import RecentAttendanceList from '../components/RecentAttendanceList';
import PrincipalDisplay from '../components/PrincipalDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { User, Clock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function EmployeeDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: status, isLoading: statusLoading } = useCurrentAttendanceStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const principalId = identity.getPrincipal().toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Card */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Welcome, {userProfile?.name || 'Employee'}
                </CardTitle>
                <CardDescription className="mt-2">
                  {userProfile?.email}
                </CardDescription>
              </div>
              {!statusLoading && (
                <Badge 
                  variant={status?.isCheckedIn ? 'default' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {status?.isCheckedIn ? 'Checked In' : 'Checked Out'}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Principal ID Display */}
        <PrincipalDisplay principal={principalId} />

        {/* Attendance Actions */}
        <AttendanceActions />

        {/* Recent Attendance */}
        <RecentAttendanceList />
      </div>
    </div>
  );
}
