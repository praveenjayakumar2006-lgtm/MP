
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function UploadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const slotNumber = searchParams.get('slotNumber');
  const violationType = searchParams.get('violationType') as 'overstaying' | 'unauthorized_parking' | null;
  
  const [status, setStatus] = useState<'loading' | 'analyzing' | 'complete'>('loading');

  useEffect(() => {
    const analyze = async () => {
      setStatus('analyzing');
      const imageDataUri = sessionStorage.getItem('violationImage');

      if (!imageDataUri || !slotNumber || !violationType) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Could not submit report. Please try again.' });
        router.replace('/violations');
        return;
      }

      try {
        const details = `An image has been uploaded for a vehicle in slot ${slotNumber} regarding a potential ${violationType.replace(
          '_',
          ' '
        )} violation.`;

        const [, vehicleResult] = await Promise.all([
          analyzeViolationText({
            slotNumber: slotNumber,
            violationType: violationType,
            details: details,
            timestamp: new Date().toISOString(),
          }),
          analyzeVehicleImage({ imageDataUri }),
        ]);

        sessionStorage.removeItem('violationImage');

        if (vehicleResult.licensePlate === 'NO_LICENSE_PLATE_DETECTED') {
          const params = new URLSearchParams();
          if (slotNumber) params.set('slotNumber', slotNumber);
          if (violationType) params.set('violationType', violationType);
          router.push(`/violations/capture-failed?${params.toString()}`);
          return;
        }

        setStatus('complete');
        const queryParams = new URLSearchParams({
          licensePlate: vehicleResult.licensePlate,
        });

        setTimeout(() => {
          router.replace(`/violations/result?${queryParams.toString()}`);
        }, 1500);

      } catch (error) {
        console.error('Error analyzing violation:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'There was an error processing your request. Please try again.',
        });
        sessionStorage.removeItem('violationImage');
        router.replace('/violations');
      }
    };

    analyze();
  }, [router, searchParams, toast, slotNumber, violationType]);


  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">

        <div className="flex flex-col items-center gap-4">
            {status === 'analyzing' && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-xl">Analyzing Image...</p>
                </>
            )}
            {status === 'complete' && (
                <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle2 className="h-16 w-16 text-green-400" />
                    </motion.div>
                    <p className="text-xl">Analysis Complete!</p>
                </>
            )}
             {status === 'loading' && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-xl">Loading...</p>
                </>
            )}
        </div>
    </div>
  );
}


export default function UploadingPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xl mt-4">Loading...</p>
            </div>
        }>
            <UploadingPageContent />
        </Suspense>
    )
}
