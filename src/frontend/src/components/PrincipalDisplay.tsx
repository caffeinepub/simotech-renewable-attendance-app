import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, Key } from 'lucide-react';
import { useState } from 'react';

interface PrincipalDisplayProps {
  principal: string;
}

export default function PrincipalDisplay({ principal }: PrincipalDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="shadow-soft border-accent/30 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">Your Principal ID</CardTitle>
        </div>
        <CardDescription>
          This unique identifier is needed for admin setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-background border rounded-lg p-3 font-mono text-sm break-all">
          {principal}
        </div>
        <div className="flex items-start gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Share this principal ID with the system administrator at{' '}
            <strong className="text-foreground">contact.simotechrenewable@gmail.com</strong>{' '}
            to request admin access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
