
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

  // Formats license plates like 'HR26DQ05551' to 'HR 26 DQ 05551'
  const formatLicensePlate = (plate: string | null) => {
    if (!plate) return null;
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    const match = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{1,4})$/);
    if (match) {
        const [_, state, district, series, number] = match;
        return `${state} ${district} ${series} ${number}`;
    }
    return plate;
  }

  const formattedLicensePlate = formatLicensePlate(licensePlate);

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-sm w-full text-center p-4">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="mt-4 text-xl">Report Submitted!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-6">
            Your violation report has been submitted successfully. We appreciate you taking the time to help us improve safety.
          </p>
          {formattedLicensePlate && (
            <p className="text-sm text-foreground mb-6">
              Detected License Plate: <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">{formattedLicensePlate}</span>
            </p>
          )}
          <div className="flex justify-center gap-4">
            <Link href="/home">
              <Button size="sm" className="h-8 px-2 text-xs">Return to Home</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => router.push('/violations')} className="h-8 px-2 text-xs">Report Another Violation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ViolationResultPage() {
    return (
        <Suspense fallback={<div className="flex flex-1 items-center justify-center">
             <Card className="max-w-sm w-full p-4">
                 <CardHeader className="items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-7 w-40 mt-4" />
                </CardHeader>
                <CardContent className="items-center flex flex-col gap-4">
                    <Skeleton className="h-5 w-full" />
                     <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                     <div className="flex justify-center gap-4 w-full">
                        <Skeleton className="h-9 w-1/2" />
                        <Skeleton className="h-9 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        </div>}>
            <ViolationResultContent />
        </Suspense>
    );
}
