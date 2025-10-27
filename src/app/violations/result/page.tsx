
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


function ViolationResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const licensePlate = searchParams.get('licensePlate');
  const [isRejected, setIsRejected] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Formats license plates like 'HR26DQ05551' to 'HR 26 DQ 05551'
  const formatLicensePlate = (plate: string | null) => {
    if (!plate || plate === 'NO_LICENSE_PLATE_DETECTED') return null;
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    const match = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
    if (match) {
        const [_, state, district, series, number] = match;
        return `${state} ${district} ${series} ${number}`;
    }
    return plate;
  }

  const formattedLicensePlate = formatLicensePlate(licensePlate);
  const selectionMade = isRejected || isConfirmed;

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-sm w-full text-center p-0">
        <CardHeader className="p-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="mt-4 text-xl">Report Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-muted-foreground text-sm mb-6">
            Your violation report has been submitted successfully. We appreciate you taking the time to help us improve safety.
          </p>
          {formattedLicensePlate && (
             <div className="mb-6 flex flex-col items-center gap-4">
                <p className="text-sm text-foreground">
                    Reported License Plate: <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">{formattedLicensePlate}</span>
                </p>
                <AnimatePresence>
                  {!selectionMade && (
                    <motion.div
                      className="flex items-center gap-4"
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button 
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => setIsConfirmed(true)}
                      >
                          <Check className="mr-2 h-4 w-4" />
                          Confirm
                      </Button>
                      <Button
                          variant="destructive"
                          className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
                          onClick={() => setIsRejected(true)}
                      >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          )}
          <div className="flex justify-center gap-4">
            {selectionMade ? (
              <>
                <Link href="/home">
                  <Button size="sm">Home</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => router.replace('/violations')}>Report Another Violation</Button>
              </>
            ) : (
              <Link href="/home">
                <Button size="sm">Home</Button>
              </Link>
            )}
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
