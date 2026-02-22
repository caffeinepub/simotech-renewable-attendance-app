import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useGetAllEmployees, useGetMonthlyReport } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import MonthYearSelector from '../components/MonthYearSelector';
import AttendanceReportTable from '../components/AttendanceReportTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { useNavigate } from '@tanstack/react-router';

export default function MonthlyReportPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: employees, isLoading: employeesLoading } = useGetAllEmployees();
  const navigate = useNavigate();

  const currentDate = new Date();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<Principal | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const { data: reportData, isLoading: reportLoading } = useGetMonthlyReport(
    selectedEmployeeId,
    selectedYear,
    selectedMonth
  );

  useEffect(() => {
    console.log('[MonthlyReportPage] Component state:', {
      hasIdentity: !!identity,
      principal: identity?.getPrincipal().toString(),
      isAdmin,
      isAdminLoading,
    });

    if (!identity) {
      console.log('[MonthlyReportPage] No identity, redirecting to home');
      navigate({ to: '/' });
    }
  }, [identity, isAdmin, isAdminLoading, navigate]);

  useEffect(() => {
    if (employees && employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].principal);
    }
  }, [employees, selectedEmployeeId]);

  if (!identity) {
    return null;
  }

  if (isAdminLoading) {
    console.log('[MonthlyReportPage] Admin status loading...');
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    console.log('[MonthlyReportPage] Access denied - user is not admin');
    return <AccessDeniedScreen />;
  }

  console.log('[MonthlyReportPage] Rendering monthly report page');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Monthly Attendance Report
            </CardTitle>
            <CardDescription>
              View detailed attendance records for employees
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Employee Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                {employeesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedEmployeeId?.toString() || ''}
                    onValueChange={(value) => setSelectedEmployeeId(Principal.fromText(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem 
                          key={employee.principal.toString()} 
                          value={employee.principal.toString()}
                        >
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Month and Year Selectors */}
              <MonthYearSelector
                month={selectedMonth}
                year={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {reportData?.length || 0} record{reportData?.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <AttendanceReportTable records={reportData || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
