'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  mobileNumber: z.string().min(10, 'Please enter a valid mobile number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    if (!auth || !firestore) {
       toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Authentication or Firestore service is not available.',
      });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const [firstName, ...lastName] = values.fullName.split(' ');
        
        setDocumentNonBlocking(userDocRef, {
          id: user.uid,
          firstName: firstName,
          lastName: lastName.join(' '),
          email: values.email,
          signUpDate: serverTimestamp(),
        }, { merge: true });
      }

      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up.",
        duration: 2000,
      });
      
    } catch (error: any) {
       let description = 'There was a problem with your request.';
       if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Please try another one.';
       }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: description,
      });
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Max Robinson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
