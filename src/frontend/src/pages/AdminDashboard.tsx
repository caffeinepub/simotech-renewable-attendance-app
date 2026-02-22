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
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: employees, isLoading: employeesLoading } = useGetAllEmployees();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AdminDashboard] Component state:', {
      hasIdentity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      isAdminLoading,
    });

    if (!identity) {
      console.log('[AdminDashboard] No identity, redirecting to home');
      navigate({ to: '/' });
    }
  }, [identity, isAdmin, isAdminLoading, navigate]);

  if (!identity) {
    return null;
  }

  if (isAdminLoading) {
    console.log('[AdminDashboard] Admin status loading...');
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
    console.log('[AdminDashboard] Access denied - user is not admin');
    return <AccessDeniedScreen />;
  }

  console.log('[AdminDashboard] Rendering admin dashboard');
  const principalId = identity.getPrincipal().toString();

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
