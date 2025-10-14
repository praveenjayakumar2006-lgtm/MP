
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Loader2, Car, User, Phone, Home } from 'lucide-react';
import type { ExtractVehicleInfoOutput } from '@/ai/flows/extract-vehicle-info';
import { analyzeVehicleImage } from '@/app/violations/actions';
import Image from 'next/image';

const formSchema = z.object({
  image: z.any().refine(
    (file) => file instanceof FileList && file.length > 0,
    'An image is required.'
  ),
});

type ViolationFormValues = z.infer<typeof formSchema>;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ViolationChecker() {
  const [result, setResult] = useState<ExtractVehicleInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { register, handleSubmit, formState, watch } = form;

  const imageFile = watch('image');
  
  useState(() => {
    if (imageFile && imageFile[0]) {
      const url = URL.createObjectURL(imageFile[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [imageFile]);


  async function onSubmit(values: ViolationFormValues) {
    setIsLoading(true);
    setResult(null);

    const file = values.image[0];
    if (!file) return;

    try {
      const imageDataUri = await fileToDataUrl(file);
      const analysisResult = await analyzeVehicleImage({ imageDataUri });
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing vehicle image:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="p-4">
                <CardTitle>Analyze Vehicle Image</CardTitle>
                <CardDescription>
                    Upload an image of a vehicle to extract details using AI.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Image</FormLabel>
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
            <CardFooter className="p-4 pt-0">
              <Button type="submit" disabled={isLoading || !formState.isValid}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze Image
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card className="flex flex-col">
        <CardHeader className="p-4">
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            The AI-powered analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center rounded-lg border-dashed border-2 m-4 mt-0 p-4">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {!isLoading && !result && (
            <p className="text-muted-foreground text-xs">
              Upload an image to see the analysis.
            </p>
          )}
          {result && (
             <div className="w-full space-y-4">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
