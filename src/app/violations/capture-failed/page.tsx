
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CaptureFailedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slotNumber = searchParams.get('slotNumber');
    const violationType = searchParams.get('violationType');

    const handleRetake = () => {
        const params = new URLSearchParams();
        if (slotNumber) params.set('slotNumber', slotNumber);
        if (violationType) params.set('violationType', violationType);
        router.push(`/violations/camera?${params.toString()}`);
    }

    return (
        <div className="flex flex-1 items-center justify-center">
        <Card className="max-w-md w-full text-center p-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link href="/home" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">Home</Button>
                </Link>
                <Button size="sm" onClick={() => router.push('/violations')} className="w-full" variant="secondary">
                    Report Another
                </Button>
                <Button size="sm" onClick={handleRetake} className="w-full">
                    Try Again
                </Button>
            </div>
            </CardContent>
        </Card>
        </div>
    )
}

export default function CaptureFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <CaptureFailedContent />
    </Suspense>
  );
}
