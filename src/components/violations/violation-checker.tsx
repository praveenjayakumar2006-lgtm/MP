
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import type { DetectParkingViolationOutput } from '@/ai/flows/detect-parking-violations';
import { analyzeViolation } from '@/app/violations/actions';

const formSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required.'),
  violationType: z.enum(['overstaying', 'unauthorized_parking']),
  details: z.string().min(10, 'Please provide more details.'),
});

type ViolationFormValues = z.infer<typeof formSchema>;

export function ViolationChecker() {
  const [result, setResult] = useState<DetectParkingViolationOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slotNumber: '',
      violationType: 'overstaying',
      details: '',
    },
  });

  async function onSubmit(values: ViolationFormValues) {
    setIsLoading(true);
    setResult(null);

    const input = {
      ...values,
      timestamp: new Date().toISOString(),
    };

    try {
      const analysisResult = await analyzeViolation(input);
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing violation:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Report a Violation</CardTitle>
                <CardDescription>
                    Fill in the details to check for a parking violation using our AI
                    tool.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="slotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A14" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a violation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="overstaying">Overstaying</SelectItem>
                        <SelectItem value="unauthorized_parking">
                          Unauthorized Parking
                        </SelectItem>
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
                        placeholder="Describe the situation, e.g., 'Vehicle has been parked for 3 hours over the limit.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze Violation
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            The AI-powered analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center rounded-lg border-dashed border-2">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {!isLoading && !result && (
            <p className="text-muted-foreground">
              Submit a report to see the analysis.
            </p>
          )}
          {result && (
            <div className="flex flex-col items-center gap-4 text-center">
              {result.isViolationDetected ? (
                <ShieldCheck className="h-16 w-16 text-destructive" />
              ) : (
                <ShieldX className="h-16 w-16 text-green-600" />
              )}
              <h3 className="text-xl font-semibold">
                {result.isViolationDetected
                  ? 'Violation Detected'
                  : 'No Violation Detected'}
              </h3>
              <p className="text-muted-foreground">
                {result.violationDetails ||
                  'The AI analysis concluded that no violation occurred based on the provided data.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
