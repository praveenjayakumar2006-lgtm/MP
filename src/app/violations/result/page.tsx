
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


function ViolationResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const licensePlate = searchParams.get('licensePlate');

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
          {licensePlate && (
            <p className="text-sm text-foreground mb-6">
              Detected License Plate: <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">{licensePlate}</span>
            </p>
          )}
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


export default function ViolationResultPage() {
    return (
        <Suspense fallback={<div className="flex flex-1 items-center justify-center">
             <Card className="max-w-md w-full p-6">
                 <CardHeader className="items-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-8 w-48 mt-4" />
                </CardHeader>
                <CardContent className="items-center flex flex-col gap-4">
                    <Skeleton className="h-6 w-full" />
                     <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                     <div className="flex justify-center gap-4 w-full">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        </div>}>
            <ViolationResultContent />
        </Suspense>
    );
}
