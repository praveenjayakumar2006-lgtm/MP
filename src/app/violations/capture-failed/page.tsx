
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GenericErrorPage() {
    const router = useRouter();

    return (
        <div className="flex flex-1 items-center justify-center">
            <Card className="max-w-md w-full text-center p-4">
                <CardHeader>
                <div className="flex justify-center">
                    <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="mt-4 text-xl">Submission Failed</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground text-sm mb-6">
                    Something went wrong while submitting your report. Please try again.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href="/home" className="w-full">
                        <Button variant="outline" size="sm" className="w-full">Home</Button>
                    </Link>
                    <Button size="sm" onClick={() => router.push('/violations')} className="w-full">
                        Try Again
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    )
}
