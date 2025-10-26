
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import { Loader2, Camera, VideoOff, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Could not find MIME type in data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function CameraPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const slotNumber = searchParams.get('slotNumber');
  const violationType = searchParams.get('violationType') as 'overstaying' | 'unauthorized_parking' | null;

  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      // Only run setup if we don't have a captured image
      if (capturedImage) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    }

    setupCamera();

    // Cleanup function to stop the stream when the component unmounts or image is captured
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage, toast]);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleConfirm = async () => {
    if (!capturedImage || !slotNumber || !violationType) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Could not submit report.' });
        return;
    }
    
    setIsLoading(true);

    try {
        const details = `An image was captured for a vehicle in slot ${slotNumber} regarding a potential ${violationType.replace('_', ' ')} violation.`;
        const [, vehicleResult] = await Promise.all([
             analyzeViolationText({
                slotNumber: slotNumber,
                violationType: violationType,
                details: details,
                timestamp: new Date().toISOString(),
            }),
            analyzeVehicleImage({ imageDataUri: capturedImage })
        ]);

        if (vehicleResult.licensePlate === 'NO_LICENSE_PLATE_DETECTED') {
            const params = new URLSearchParams();
            if (slotNumber) params.set('slotNumber', slotNumber);
            if (violationType) params.set('violationType', violationType);
            router.push(`/violations/capture-failed?${params.toString()}`);
            return;
        }

        setShowConfirmation(true);
        
        const queryParams = new URLSearchParams({
            licensePlate: vehicleResult.licensePlate,
        });
        
        setTimeout(() => {
             router.push(`/violations/result?${queryParams.toString()}`);
        }, 1500);

    } catch (error) {
        console.error('Error analyzing violation:', error);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'There was an error processing your request. Please try again.',
        });
        setIsLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        {!isLoading && !capturedImage && (
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-20 flex items-center p-4">
                <Button onClick={() => router.push('/violations')} variant="secondary" className="bg-gray-700/70 border-none text-white hover:bg-gray-600/70 h-auto p-2 gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                </Button>
            </div>
        )}

        <AnimatePresence>
            {isLoading ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-30 flex flex-col items-center gap-4"
                >
                {showConfirmation ? (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                            <CheckCircle2 className="h-16 w-16 text-green-400" />
                        </motion.div>
                        <p className="text-xl">Analysis Complete!</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-xl">Analyzing Image...</p>
                    </>
                )}
                </motion.div>
            ) : capturedImage ? (
                 <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full flex flex-col"
                >
                    <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-around z-20">
                        <Button onClick={handleRetake} variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white/20 border-white/20">Retake</Button>
                        <Button onClick={handleConfirm} size="lg">Confirm & Analyze</Button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                >
                    <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" autoPlay muted playsInline />
                    
                    {hasCameraPermission === false && (
                        <div className="absolute z-10 p-4">
                            <Alert variant="destructive" className="bg-destructive/80 border-destructive-foreground text-destructive-foreground">
                                <VideoOff className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center z-20">
                        <Button onClick={handleCapture} disabled={hasCameraPermission !== true} size="lg" className="rounded-full w-20 h-20 border-4 border-white bg-white/30 hover:bg-white/40">
                             <Camera className="h-8 w-8 text-white" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default function CameraPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xl mt-4">Loading Camera...</p>
            </div>
        }>
            <CameraPageContent />
        </Suspense>
    )
}

    

    
