
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, ShieldX, Car, User, Phone, Home, ArrowLeft } from 'lucide-react';
import type { DetectParkingViolationOutput } from '@/ai/flows/detect-parking-violations';
import type { ExtractVehicleInfoOutput } from '@/ai/flows/extract-vehicle-info';
import { Skeleton } from '@/components/ui/skeleton';

function ViolationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const violationResultStr = searchParams.get('violationResult');
  const vehicleResultStr = searchParams.get('vehicleResult');
  const imagePreview = searchParams.get('imagePreview');

  let violationResult: DetectParkingViolationOutput | null = null;
  let vehicleResult: ExtractVehicleInfoOutput | null = null;

  try {
    if (violationResultStr) {
      violationResult = JSON.parse(violationResultStr);
    }
    if (vehicleResultStr) {
      vehicleResult = JSON.parse(vehicleResultStr);
    }
  } catch (error) {
    console.error('Failed to parse results from URL:', error);
  }
  
  if (!violationResult && !vehicleResult) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        <CardTitle>Analysis Failed</CardTitle>
        <CardDescription>Could not retrieve analysis results. Please try again.</CardDescription>
         <Button onClick={() => router.push('/violations')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
     <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/violations')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Report Another Violation
            </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex items-center justify-center">
                {imagePreview ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                    <Image
                        src={imagePreview}
                        alt="Image of the violation"
                        fill
                        className="object-cover"
                    />
                    </div>
                ) : (
                    <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No image available</p>
                    </div>
                )}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Analysis Result</CardTitle>
                    <CardDescription>
                        The AI-powered analysis of the submitted image and details is complete.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {violationResult && (
                        <div className="flex flex-col items-center gap-3 text-center p-4 rounded-lg bg-muted">
                            {violationResult.isViolationDetected ? (
                                <ShieldCheck className="h-12 w-12 text-green-500" />
                            ) : (
                                <ShieldX className="h-12 w-12 text-red-500" />
                            )}
                            <div className='space-y-1'>
                                <h3 className="text-xl font-semibold">
                                    {violationResult.isViolationDetected ? 'Violation Detected' : 'No Violation Detected'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{violationResult.violationDetails}</p>
                            </div>
                        </div>
                    )}
                    <Separator />
                    {vehicleResult ? (
                        <div className="w-full space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-base mb-2">Vehicle Details</h3>
                                <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-center">
                                    <Car className="h-4 w-4 mr-2 text-primary" />
                                    <span><strong>License Plate:</strong> {vehicleResult.licensePlate}</span>
                                </div>
                                <div className="flex items-center">
                                    <Car className="h-4 w-4 mr-2 text-primary" />
                                    <span><strong>Make & Model:</strong> {vehicleResult.make} {vehicleResult.model}</span>
                                </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-base mb-2">Owner Details (Fictional)</h3>
                                <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-primary" />
                                    <span>{vehicleResult.owner.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <Home className="h-4 w-4 mr-2 text-primary" />
                                    <span>{vehicleResult.owner.address}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-primary" />
                                    <span>{vehicleResult.owner.phone}</span>
                                </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full text-sm text-center p-4 text-muted-foreground">
                            Could not extract vehicle information from the image.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
     </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center gap-3 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-6 w-1/2 mx-auto" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}


export default function ViolationResultPage() {
    return (
        <Suspense fallback={<ResultSkeleton />}>
            <ViolationResultContent />
        </Suspense>
    )
}
