
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const violationSchemaBase = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking'], {
    required_error: 'You need to select a violation type.',
  }),
});

const violationSchemaUpload = violationSchemaBase.extend({
  imageSource: z.literal('upload'),
  image: z.any().refine(
    (file) => file instanceof File,
    'An image is required.'
  ),
});

const violationSchemaCamera = violationSchemaBase.extend({
  imageSource: z.literal('camera'),
  image: z.any().optional(),
});

const violationSchema = z.discriminatedUnion('imageSource', [
  violationSchemaUpload,
  violationSchemaCamera,
]);

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const violationForm = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      slotNumber: '',
      violationType: undefined,
      imageSource: 'upload',
      image: null,
    },
  });

  const imageSource = violationForm.watch('imageSource');

  const handleProceedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    violationForm.trigger(['slotNumber', 'violationType']).then((isValid) => {
        if (!isValid) {
            return;
        }

        const currentValues = violationForm.getValues();

        if (currentValues.imageSource === 'camera') {
            const params = new URLSearchParams({
                slotNumber: currentValues.slotNumber,
                violationType: currentValues.violationType!,
            });
            router.push(`/violations/camera?${params.toString()}`);
        } else if (currentValues.imageSource === 'upload') {
            fileInputRef.current?.click();
        }
    });
  };

  async function onViolationSubmit(values: ViolationFormValues) {
    if (values.imageSource === 'camera') return;
    
    setIsLoading(true);
    
    const file = values.image;
    if (!file) {
      setIsLoading(false);
      return;
    }

    try {
      const details = `An image has been uploaded for a vehicle in slot ${values.slotNumber} regarding a potential ${values.violationType.replace(
        '_',
        ' '
      )} violation.`;

      const imageDataUri = await fileToDataUrl(file);
      const [violationResult, vehicleResult] = await Promise.all([
        analyzeViolationText({
          slotNumber: values.slotNumber,
          violationType: values.violationType,
          details: details,
          timestamp: new Date().toISOString(),
        }),
        analyzeVehicleImage({ imageDataUri }),
      ]);
      
      if (!vehicleResult.licensePlate) {
        toast({
            variant: 'destructive',
            title: 'Number Plate Not Detected',
            description: 'Please retake the photo, ensuring the plate is clear.',
        });
        setIsLoading(false);
        return;
      }

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
          Report a parking violation using our AI system.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <Form {...violationForm}>
          <form onSubmit={violationForm.handleSubmit(onViolationSubmit)}>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={violationForm.control}
                name="slotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., C5" 
                        {...field} 
                        onChange={(e) => {
                            field.onChange(e);
                            if (violationForm.formState.errors.slotNumber) {
                                violationForm.clearErrors('slotNumber');
                            }
                        }}
                      />
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
                    <Select 
                        onValueChange={(value) => {
                            field.onChange(value);
                            if (violationForm.formState.errors.violationType) {
                                violationForm.clearErrors('violationType');
                            }
                        }}
                        defaultValue={field.value}
                    >
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
                name="imageSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence <span className="text-destructive">*</span></FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4 pt-2"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <FormLabel htmlFor="upload" className="font-normal cursor-pointer">Upload Image</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <RadioGroupItem value="camera" id="camera" />
                        <FormLabel htmlFor="camera" className="font-normal cursor-pointer">Take Photo</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    violationForm.setValue('image', file, { shouldValidate: true });
                    // Automatically submit the form once a file is chosen
                    violationForm.handleSubmit(onViolationSubmit)();
                  }
                }}
              />
              
              <div className="pt-2">
                <Button 
                  onClick={handleProceedClick} 
                  disabled={isLoading} 
                  className="w-full"
                  type="button" 
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : imageSource === 'camera' ? (
                    'Proceed to Camera'
                  ) : (
                    'Proceed to Gallery'
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
