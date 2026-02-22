import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Info, LogIn, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function AdminLoginInfo() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="shadow-soft border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Admin Access Information</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        <CardDescription>
          How to request admin privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">How to get admin access:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Log in with <strong>Internet Identity</strong> using the Login button</li>
                <li>Copy your <strong>Principal ID</strong> displayed on the dashboard above</li>
                <li>Email your Principal ID to <strong className="text-primary">contact.simotechrenewable@gmail.com</strong></li>
                <li>Wait for the system administrator to grant you admin privileges</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <LogIn className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Internet Identity uses <strong>principal IDs</strong> (not email addresses) to identify users. 
            This cryptographic identifier ensures your privacy while providing secure authentication.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
