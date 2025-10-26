
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaptureFailedPage() {
    const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-sm w-full text-center p-4">
        <CardHeader>
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-xl">Capture Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-6">
            The license plate was not detected properly. Please ensure the plate is clear, well-lit, and centered in the frame.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="sm" onClick={() => router.push('/violations')}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
