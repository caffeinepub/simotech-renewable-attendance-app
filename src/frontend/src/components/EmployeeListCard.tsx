import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail } from 'lucide-react';
import type { Employee } from '../backend';

interface EmployeeListCardProps {
  employee: Employee;
  isCheckedIn?: boolean;
}

export default function EmployeeListCard({ employee, isCheckedIn }: EmployeeListCardProps) {
  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {employee.name}
          </CardTitle>
          {isCheckedIn !== undefined && (
            <Badge variant={isCheckedIn ? 'default' : 'secondary'}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {employee.email}
        </div>
        {employee.isAdmin && (
          <Badge variant="outline" className="mt-3">
            Administrator
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

