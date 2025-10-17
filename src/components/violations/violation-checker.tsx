
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
  CardDescription,
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
import { Loader2 } from 'lucide-react';
import { analyzeVehicleImage, analyzeViolationText } from '@/app/violations/actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
      await Promise.all([
        analyzeViolationText({
            slotNumber: values.slotNumber,
            violationType: values.violationType,
            details: details,
            timestamp: new Date().toISOString(),
        }),
        analyzeVehicleImage({ imageDataUri })
      ]);
      
      router.push(`/violations/result`);

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
    <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto flex-1">
      <div>
        <h1 className="text-3xl font-semibold">Report a Violation</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to check for a parking violation using our AI-powered system.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Violation Details</CardTitle>
          <CardDescription>
            Submit the slot number, violation type, and an image for analysis.
          </CardDescription>
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
              <FormField
                control={violationForm.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Upload Your Image <span className="text-destructive">*</span></FormLabel>
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
