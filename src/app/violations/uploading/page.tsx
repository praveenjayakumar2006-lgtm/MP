
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function UploadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const slotNumber = searchParams.get('slotNumber');
  const violationType = searchParams.get('violationType') as 'overstaying' | 'unauthorized_parking' | null;
  const licensePlate = searchParams.get('licensePlate');

  const [status, setStatus] = useState<'submitting' | 'complete'>('submitting');

  useEffect(() => {
    const submitReport = async () => {
      setStatus('submitting');
      const imageDataUri = sessionStorage.getItem('violationImage');

      if (!imageDataUri || !slotNumber || !violationType || !licensePlate) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Could not submit report. Please try again.' });
        router.replace('/violations');
        return;
      }

      // TODO: Actually save the violation report data (slot, type, plate, image)
      console.log('Violation Report:', {
        slotNumber,
        violationType,
        licensePlate,
        image: imageDataUri.substring(0, 30) + '...', // log truncated image data
      });

      sessionStorage.removeItem('violationImage');

      setStatus('complete');
      const queryParams = new URLSearchParams({
        licensePlate: licensePlate,
      });

      setTimeout(() => {
        router.replace(`/violations/result?${queryParams.toString()}`);
      }, 1500);
    };

    submitReport();
  }, [router, searchParams, toast, slotNumber, violationType, licensePlate]);


  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">

        <div className="flex flex-col items-center gap-4">
            {status === 'submitting' && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-xl">Submitting Report...</p>
                </>
            )}
            {status === 'complete' && (
                <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle2 className="h-16 w-16 text-green-400" />
                    </motion.div>
                    <p className="text-xl">Report Submitted!</p>
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
