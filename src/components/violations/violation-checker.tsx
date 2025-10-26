
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Camera } from 'lucide-react';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const violationSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']),
  image: z.any().refine(
    (file) => file,
    'An image is required.'
  ),
});
type ViolationFormValues = z.infer<typeof violationSchema>;

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


function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ViolationChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const violationForm = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      slotNumber: '',
      violationType: 'overstaying',
      image: null,
    },
  });

  const { setValue, trigger } = violationForm;

  useEffect(() => {
    async function setupCamera() {
      if (imageSource === 'camera') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
    setupCamera();
  }, [imageSource, toast]);


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
        const capturedFile = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
        setValue('image', capturedFile);
        trigger('image'); // Manually trigger validation
      }
    }
  };

  async function onViolationSubmit(values: ViolationFormValues) {
    setIsLoading(true);
    
    const file = values.image;
    if (!file) {
        setIsLoading(false);
        return;
    };

    try {
      const details = `An image has been uploaded for a vehicle in slot ${values.slotNumber} regarding a potential ${values.violationType.replace('_', ' ')} violation.`;

      const imageDataUri = await fileToDataUrl(file);
      const [violationResult, vehicleResult] = await Promise.all([
        analyzeViolationText({
            slotNumber: values.slotNumber,
            violationType: values.violationType,
            details: details,
            timestamp: new Date().toISOString(),
        }),
        analyzeVehicleImage({ imageDataUri })
      ]);
      
      const queryParams = new URLSearchParams({
        licensePlate: vehicleResult.licensePlate,
      });

      router.push(`/violations/result?${queryParams.toString()}`);

    } catch (error) {
      console.error('Error analyzing violation:', error);
       toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'There was an error processing your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto flex-1">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-semibold">Report a Violation</h1>
        <p className="text-base text-muted-foreground mt-2">
          Fill in the details to check for a parking violation using our AI-powered system.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Violation Details</CardTitle>
        </CardHeader>
        <Form {...violationForm}>
          <form onSubmit={violationForm.handleSubmit(onViolationSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={violationForm.control}
                name="slotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., C5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={violationForm.control}
                name="violationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Violation Type <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a violation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="overstaying">Overstaying</SelectItem>
                        <SelectItem value="unauthorized_parking">Unauthorized Parking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Image Source <span className="text-destructive">*</span></FormLabel>
                <RadioGroup
                  defaultValue="upload"
                  onValueChange={(value: 'upload' | 'camera') => {
                    setImageSource(value);
                    setValue('image', null);
                  }}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <FormLabel htmlFor="upload" className="font-normal">Upload Image</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="camera" id="camera" />
                    <FormLabel htmlFor="camera" className="font-normal">Take Photo</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>

              <FormField
                control={violationForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {imageSource === 'upload' ? (
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              field.onChange(e.target.files[0]);
                            }
                          }}
                        />
                      ) : (
                        <div className="space-y-4">
                           <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                           </div>
                           {hasCameraPermission === false && (
                              <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                  Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                              </Alert>
                           )}
                           <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Image
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <canvas ref={canvasRef} style={{ display: 'none' }} />

              <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Analyze Violation'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
