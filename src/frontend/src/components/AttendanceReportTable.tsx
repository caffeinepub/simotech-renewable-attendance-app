import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import LocationDisplay from './LocationDisplay';
import type { AttendanceRecord } from '../backend';
import { Calendar } from 'lucide-react';

interface AttendanceReportTableProps {
  records: AttendanceRecord[];
  employeeName?: string;
}

export default function AttendanceReportTable({ records, employeeName }: AttendanceReportTableProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
          <CardDescription>No attendance records found for the selected period</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total hours
  const totalHours = records.reduce((sum, record) => {
    if (record.checkOutTime) {
      const hours = (Number(record.checkOutTime - record.checkInTime) / (1_000_000_000 * 60 * 60));
      return sum + hours;
    }
    return sum;
  }, 0);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Attendance Report
          {employeeName && <span className="text-muted-foreground">- {employeeName}</span>}
        </CardTitle>
        <CardDescription>
          Total Hours: <span className="font-semibold text-primary">{totalHours.toFixed(2)}h</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => {
                const checkInDate = new Date(Number(record.checkInTime / BigInt(1_000_000)));
                const checkOutDate = record.checkOutTime 
                  ? new Date(Number(record.checkOutTime / BigInt(1_000_000)))
                  : null;

                const hoursWorked = checkOutDate
                  ? ((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(2)
                  : '-';

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {checkInDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {checkInDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      {checkOutDate 
                        ? checkOutDate.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {hoursWorked !== '-' ? `${hoursWorked}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <LocationDisplay 
                        latitude={record.location.latitude}
                        longitude={record.location.longitude}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

