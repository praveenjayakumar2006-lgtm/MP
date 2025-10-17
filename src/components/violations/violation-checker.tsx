
'use client';

import { useState } from 'react';
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
import { Loader2, Car, User, Phone, Home, ShieldCheck, ShieldX, Upload } from 'lucide-react';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import type { DetectParkingViolationOutput } from '@/ai/flows/detect-parking-violations';
import type { ExtractVehicleInfoOutput } from '@/ai/flows/extract-vehicle-info';
import Image from 'next/image';
import { Separator } from '../ui/separator';

const violationSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']),
  image: z.any().refine(
    (files) => files instanceof FileList && files.length > 0,
    'An image is required.'
  ),
});
type ViolationFormValues = z.infer<typeof violationSchema>;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ViolationChecker() {
  const [violationResult, setViolationResult] = useState<DetectParkingViolationOutput | null>(null);
  const [vehicleResult, setVehicleResult] = useState<ExtractVehicleInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisDone, setAnalysisDone] = useState(false);

  const violationForm = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      slotNumber: '',
      violationType: 'overstaying',
    },
  });

  const { register, watch } = violationForm;

  const imageFiles = watch('image');
  
  useState(() => {
    if (imageFiles && imageFiles[0]) {
      const url = URL.createObjectURL(imageFiles[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles]);


  async function onViolationSubmit(values: ViolationFormValues) {
    setIsLoading(true);
    setViolationResult(null);
    setVehicleResult(null);
    setAnalysisDone(false);
    
    const file = values.image[0];
    if (!file) {
        setIsLoading(false);
        return;
    };

    try {
      // For the text-based analysis, we'll create a descriptive string.
      const details = `An image has been uploaded for a vehicle in slot ${values.slotNumber} regarding a potential ${values.violationType.replace('_', ' ')} violation.`;

      // Run both analyses in parallel
      const imageDataUri = await fileToDataUrl(file);
      const [violationRes, vehicleRes] = await Promise.all([
        analyzeViolationText({
            slotNumber: values.slotNumber,
            violationType: values.violationType,
            details: details,
            timestamp: new Date().toISOString(),
        }),
        analyzeVehicleImage({ imageDataUri })
      ]);
      
      setViolationResult(violationRes);
      setVehicleResult(vehicleRes);

    } catch (error) {
      console.error('Error analyzing violation:', error);
    } finally {
      setIsLoading(false);
      setAnalysisDone(true);
    }
  }


  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!analysisDone) {
      return null;
    }
    
    if (!violationResult && !vehicleResult) {
       return (
        <div className="w-full space-y-4 text-sm text-center p-8">
            <p className="text-muted-foreground">Analysis could not be completed. Please try again.</p>
        </div>
       )
    }

    return (
        <div className="w-full space-y-4 text-sm">
            <Separator className='my-4' />
             <h3 className="text-lg font-semibold text-center">Analysis Result</h3>

            {violationResult && (
                <div className="flex flex-col items-center gap-2 text-center border-b pb-4">
                    {violationResult.isViolationDetected ? (
                        <ShieldCheck className="h-10 w-10 text-green-500" />
                    ) : (
                        <ShieldX className="h-10 w-10 text-red-500" />
                    )}
                    <div className='space-y-1'>
                        <h3 className="text-lg font-semibold">
                            {violationResult.isViolationDetected ? 'Violation Detected' : 'No Violation Detected'}
                        </h3>
                        <p className="text-xs text-muted-foreground">{violationResult.violationDetails}</p>
                    </div>
                </div>
            )}

            {vehicleResult ? (
                 <div className="w-full space-y-4">
                    <div>
                        <h3 className="font-semibold text-base">Vehicle Details</h3>
                        <div className="mt-2 space-y-1 text-muted-foreground">
                        <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" />
                            <span><strong>License Plate:</strong> {vehicleResult.licensePlate}</span>
                        </div>
                        <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" />
                            <span><strong>Make & Model:</strong> {vehicleResult.make} {vehicleResult.model}</span>
                        </div>
                        <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" />
                            <span><strong>Color:</strong> {vehicleResult.color}</span>
                        </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">Owner Details (Fictional)</h3>
                        <div className="mt-2 space-y-1 text-muted-foreground">
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>{vehicleResult.owner.name}</span>
                        </div>
                        <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            <span>{vehicleResult.owner.address}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{vehicleResult.owner.phone}</span>
                        </div>
                        </div>
                    </div>
                 </div>
            ) : (
                 <div className="w-full space-y-4 text-sm text-center p-8">
                    <p className="text-muted-foreground">Could not extract vehicle information from the image.</p>
                </div>
            )}
        </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-semibold">Report a Violation</h1>
        <p className="text-muted-foreground">Fill in the details to check for a parking violation.</p>
      </div>
      <Card className="w-full max-w-md">
          <Form {...violationForm}>
              <form onSubmit={violationForm.handleSubmit(onViolationSubmit)}>
                  <CardContent className="space-y-3 pt-6">
                      <FormField
                          control={violationForm.control}
                          name="slotNumber"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Slot Number</FormLabel>
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
                              <FormLabel>Violation Type</FormLabel>
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
                     <FormField
                        control={violationForm.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Upload Your Image</FormLabel>
                            <FormControl>
                                <Input
                                type="file"
                                accept="image/*"
                                {...register('image')}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {preview && (
                        <div className="mt-4 relative aspect-video w-full">
                            <Image
                            src={preview}
                            alt="Image preview"
                            fill
                            className="rounded-md object-cover"
                            />
                        </div>
                    )}
                        <div className="pt-4">
                          <Button type="submit" disabled={isLoading} className='w-full'>
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Analyze Violation'}
                          </Button>
                      </div>
                      {renderResult()}
                  </CardContent>
              </form>
          </Form>
      </Card>
    </>
  );
}
