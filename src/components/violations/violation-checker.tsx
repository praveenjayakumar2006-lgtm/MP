
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Car, User, Phone, Home, ShieldCheck, ShieldX } from 'lucide-react';
import type { CombinedAnalysisResult } from '@/app/violations/actions';
import { analyzeCombinedViolation } from '@/app/violations/actions';
import Image from 'next/image';

const violationSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']),
  details: z.string().min(10, 'Details must be at least 10 characters.'),
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
  const [analysisResult, setAnalysisResult] = useState<CombinedAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      slotNumber: '',
      violationType: 'overstaying',
      details: '',
    },
  });

  const { register, watch } = form;
  
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


  async function onSubmit(values: ViolationFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);

    const file = values.image[0];
    if (!file) return;

    try {
      const imageDataUri = await fileToDataUrl(file);
      const result = await analyzeCombinedViolation(
        {
          slotNumber: values.slotNumber,
          violationType: values.violationType,
          details: values.details,
          timestamp: new Date().toISOString(),
        },
        { imageDataUri }
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing violation:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderResult = () => {
    if (!analysisResult) {
        return null;
    }
    
    const {violationResult, vehicleResult} = analysisResult;

    return (
        <div className="w-full space-y-6 text-sm">
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
        </div>
    );
  }

  return (
    <div className="w-full grid md:grid-cols-2 gap-8 items-start">
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Report a Violation</CardTitle>
                        <CardDescription>Fill in the details and upload an image to check for a parking violation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
                            name="details"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Details</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Provide more details about the violation..."
                                    {...field}
                                    rows={3}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Upload Image</FormLabel>
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
                    </CardContent>
                        <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Analyze Violation
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
        <Card className="flex flex-col min-h-[550px]">
            <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>
                    The AI-powered analysis will be displayed here.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center rounded-lg border-dashed border-2 m-6 mt-0 p-4">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : renderResult()}
            </CardContent>
        </Card>
    </div>
  );
}
