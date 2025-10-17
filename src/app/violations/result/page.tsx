
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ViolationResultPage() {
    const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-md w-full text-center p-6">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="mt-4 text-2xl">Report Submitted!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Your violation report has been submitted successfully. We appreciate you taking the time to help us improve safety.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/home">
              <Button>Return to Home</Button>
            </Link>
            <Button variant="outline" onClick={() => router.push('/violations')}>Report Another Violation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
