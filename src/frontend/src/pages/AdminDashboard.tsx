import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useGetAllEmployees } from '../hooks/useQueries';
import EmployeeListCard from '../components/EmployeeListCard';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import AdminLoginInfo from '../components/AdminLoginInfo';
import PrincipalDisplay from '../components/PrincipalDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Users, FileText } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function AdminDashboard() {
  console.log('[AdminDashboard] ===== COMPONENT FUNCTION CALLED =====', {
    timestamp: new Date().toISOString(),
  });

  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading, isSuccess, isFetched, status, fetchStatus } = useIsAdmin();
  const { data: employees, isLoading: employeesLoading } = useGetAllEmployees();
  const navigate = useNavigate();

  console.log('[AdminDashboard] ===== HOOKS CALLED =====', {
    timestamp: new Date().toISOString(),
    identityPresent: !!identity,
    principal: identity?.getPrincipal().toString(),
    isAdmin,
    isAdminType: typeof isAdmin,
    isAdminLoading,
    isSuccess,
    isFetched,
    status,
    fetchStatus,
  });

  useEffect(() => {
    console.log('[AdminDashboard] ===== useEffect TRIGGERED =====');
    console.log('[AdminDashboard] Timestamp:', new Date().toISOString());
    console.log('[AdminDashboard] Dependencies:', {
      identity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      isAdminType: typeof isAdmin,
      isAdminValue: isAdmin === true ? 'TRUE' : isAdmin === false ? 'FALSE' : 'UNDEFINED/NULL',
      isAdminLoading,
      isSuccess,
      isFetched,
    });

    console.log('[AdminDashboard] Render decision logic:', {
      hasIdentity: !!identity,
      isLoadingAdmin: isAdminLoading,
      isAdminTrue: isAdmin === true,
      isAdminFalse: isAdmin === false,
      willShowAdminContent: !!identity && !isAdminLoading && isAdmin === true,
      willShowAccessDenied: !!identity && !isAdminLoading && isAdmin === false,
      willShowLoading: !!identity && isAdminLoading,
      willRedirect: !identity,
    });

    if (!identity) {
      console.log('[AdminDashboard] ⚠️ No identity detected - will redirect to home');
      navigate({ to: '/' });
    } else {
      console.log('[AdminDashboard] ✓ Identity present - staying on admin page');
    }
  }, [identity, isAdmin, isAdminLoading, isSuccess, isFetched, navigate]);

  console.log('[AdminDashboard] ===== RENDER DECISION POINT =====', {
    timestamp: new Date().toISOString(),
    hasIdentity: !!identity,
    isAdminLoading,
    isAdmin,
    willRenderNull: !identity,
    willRenderLoading: !!identity && isAdminLoading,
    willRenderAccessDenied: !!identity && !isAdminLoading && !isAdmin,
    willRenderAdminContent: !!identity && !isAdminLoading && isAdmin,
  });

  if (!identity) {
    console.log('[AdminDashboard] 🔄 RENDERING: null (no identity - redirecting)');
    return null;
  }

  if (isAdminLoading) {
    console.log('[AdminDashboard] 🔄 RENDERING: Loading skeleton (admin status loading)');
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('[AdminDashboard] 🚫 RENDERING: Access Denied Screen');
    console.log('[AdminDashboard] ❌ User is NOT admin');
    console.log('[AdminDashboard] isAdmin value:', isAdmin);
    console.log('[AdminDashboard] isAdmin type:', typeof isAdmin);
    console.log('[AdminDashboard] isAdmin === false:', isAdmin === false);
    console.log('[AdminDashboard] isAdmin is truthy:', !!isAdmin);
    console.log('[AdminDashboard] Boolean(isAdmin):', Boolean(isAdmin));
    return <AccessDeniedScreen />;
  }

  console.log('[AdminDashboard] ✅ RENDERING: Full Admin Dashboard');
  console.log('[AdminDashboard] ✓ User IS admin - showing admin features');
  console.log('[AdminDashboard] isAdmin value:', isAdmin);
  console.log('[AdminDashboard] Employees count:', employees?.length || 0);
  
  const principalId = identity.getPrincipal().toString();
  console.log('[AdminDashboard] Principal ID for display:', principalId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Principal ID Display */}
        <PrincipalDisplay principal={principalId} />

        {/* Admin Login Info */}
        <AdminLoginInfo />

        {/* Header */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage employees and view attendance reports
                </CardDescription>
              </div>
              <Link to="/reports">
                <Button className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Employee List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>
              {employees?.length || 0} employee{employees?.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : employees && employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <EmployeeListCard 
                    key={employee.principal.toString()} 
                    employee={employee}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No employees found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
