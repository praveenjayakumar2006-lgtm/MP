
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
import type { ExtractVehicleInfoOutput } from '@/ai/flows/extract-vehicle-info';
import type { DetectParkingViolationOutput } from '@/ai/flows/detect-parking-violations';
import { analyzeVehicleImage, analyzeViolation } from '@/app/violations/actions';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const violationSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']),
  details: z.string().min(10, 'Details must be at least 10 characters.'),
});
type ViolationFormValues = z.infer<typeof violationSchema>;

const imageSchema = z.object({
  image: z.any().refine(
    (files) => files instanceof FileList && files.length > 0,
    'An image is required.'
  ),
});
type ImageFormValues = z.infer<typeof imageSchema>;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ViolationChecker() {
  const [analysisResult, setAnalysisResult] = useState<ExtractVehicleInfoOutput | DetectParkingViolationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('report');

  const violationForm = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      slotNumber: '',
      violationType: 'overstaying',
      details: '',
    },
  });

  const imageForm = useForm<ImageFormValues>({
    resolver: zodResolver(imageSchema),
  });
  
  const { register: registerImage, watch: watchImage } = imageForm;
  
  const imageFiles = watchImage('image');
  
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
    setAnalysisResult(null);
    try {
      const result = await analyzeViolation(values);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing violation:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onImageSubmit(values: ImageFormValues) {
    setIsLoading(true);
    setAnalysisResult(null);

    const file = values.image[0];
    if (!file) return;

    try {
      const imageDataUri = await fileToDataUrl(file);
      const result = await analyzeVehicleImage({ imageDataUri });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing vehicle image:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderResult = () => {
    if (!analysisResult) {
        return <p className="text-sm text-muted-foreground">Submit a report to see the analysis.</p>;
    }
    
    // Type guard for DetectParkingViolationOutput
    if ('isViolationDetected' in analysisResult) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                {analysisResult.isViolationDetected ? (
                    <ShieldCheck className="h-16 w-16 text-green-500" />
                ) : (
                    <ShieldX className="h-16 w-16 text-red-500" />
                )}
                <div className='space-y-1'>
                    <h3 className="text-xl font-semibold">
                        {analysisResult.isViolationDetected ? 'Violation Detected' : 'No Violation Detected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{analysisResult.violationDetails}</p>
                </div>
            </div>
        );
    }

    // Type guard for ExtractVehicleInfoOutput
    if ('licensePlate' in analysisResult) {
        const result = analysisResult; // for type safety
        return (
             <div className="w-full space-y-6">
              <div>
                <h3 className="font-semibold text-lg">Vehicle Details</h3>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    <span><strong>License Plate:</strong> {result.licensePlate}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    <span><strong>Make & Model:</strong> {result.make} {result.model}</span>
                  </div>
                   <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    <span><strong>Color:</strong> {result.color}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Owner Details (Fictional)</h3>
                 <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{result.owner.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    <span>{result.owner.address}</span>
                  </div>
                   <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{result.owner.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          );
    }
    
    return <p className="text-sm text-muted-foreground">Analysis result is in an unknown format.</p>;
  }

  return (
    <div className="w-full grid md:grid-cols-2 gap-8 items-stretch">
      <div className="flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report">Report Violation</TabsTrigger>
                <TabsTrigger value="image">Analyze Vehicle Image</TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="flex-1">
                <Card className="flex flex-col h-full">
                    <Form {...violationForm}>
                        <form onSubmit={violationForm.handleSubmit(onViolationSubmit)} className="flex flex-col flex-1">
                            <CardContent className="p-6 space-y-4 flex-1">
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
                                    name="details"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Details</FormLabel>
                                        <FormControl>
                                        <Textarea
                                            placeholder="Provide more details about the violation..."
                                            {...field}
                                            rows={4}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                             <CardFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && activeTab === 'report' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Analyze Violation
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>
            <TabsContent value="image" className="flex-1">
                <Card className="flex flex-col h-full">
                    <Form {...imageForm}>
                        <form onSubmit={imageForm.handleSubmit(onImageSubmit)} className="flex flex-col flex-1">
                            <CardContent className="p-6 space-y-4 flex-1">
                               <FormField
                                control={imageForm.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vehicle Image</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        {...registerImage('image')}
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
                                <Button type="submit" disabled={isLoading || !imageForm.formState.isValid}>
                                    {isLoading && activeTab === 'image' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Analyze Image
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
              <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                  <CardDescription>
                      The AI-powered analysis will be displayed here.
                  </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center rounded-lg border-dashed border-2 m-6 mt-0 p-6">
                  {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : renderResult()}
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
