
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useRef } from 'react';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function CaptureFailedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slotNumber = searchParams.get('slotNumber');
    const violationType = searchParams.get('violationType');
    const imageSource = searchParams.get('imageSource');
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const imageDataUrl = await fileToDataUrl(file);
            sessionStorage.setItem('violationImage', imageDataUrl);

            const params = new URLSearchParams();
            if (slotNumber) params.set('slotNumber', slotNumber);
            if (violationType) params.set('violationType', violationType);
            router.push(`/violations/uploading?${params.toString()}`);
        }
    }

    const handleTryAgain = () => {
        const params = new URLSearchParams();
        if (slotNumber) params.set('slotNumber', slotNumber);
        if (violationType) params.set('violationType', violationType);

        if (imageSource === 'camera') {
            router.push(`/violations/camera?${params.toString()}`);
        } else {
             fileInputRef.current?.click();
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
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
                    <Button size="sm" onClick={handleTryAgain} className="w-full">
                      {imageSource === 'upload' ? 'Select Another Photo' : 'Try Again'}
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
