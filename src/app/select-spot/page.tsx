
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Hourglass } from 'lucide-react';

function SelectSpotContent() {
    const searchParams = useSearchParams();
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const duration = searchParams.get('duration');

    const bookingDetails = date && startTime && duration ? { date, startTime, duration } : undefined;

    const formattedDate = date ? format(parseISO(date), 'PPP') : 'N/A';
    
    const formattedTime = (time: string | null) => {
        if (!time) return 'N/A';
        const [hour, minute] = time.split(':').map(Number);
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    return (
        <div
            className="flex flex-col items-center justify-center flex-1 bg-muted p-4 md:p-6"
        >
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl">Select Your Spot</h3>
                    <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-2">
                        Select an available green slot from the map below to make a reservation for your chosen time.
                    </p>
                </div>

                {bookingDetails && (
                    <Card className="w-full mb-6 bg-background shadow-lg">
                        <CardContent className="p-4">
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted">
                                    <Calendar className="h-5 w-5 mb-1 text-primary" />
                                    <p className="font-semibold text-sm text-foreground">{formattedDate}</p>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted">
                                    <Clock className="h-5 w-5 mb-1 text-primary" />
                                    <p className="font-semibold text-sm text-foreground">{formattedTime(startTime)}</p>
                                    <p className="text-xs text-muted-foreground">Start Time</p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted">
                                    <Hourglass className="h-5 w-5 mb-1 text-primary" />
                                    <p className="font-semibold text-sm text-foreground">{duration} hour{duration && parseInt(duration) > 1 ? 's' : ''}</p>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="w-full flex justify-center">
                    <ParkingMap bookingDetails={bookingDetails} />
                </div>
            </div>
        </div>
    );
}

export default function SelectSpotPage() {
    return (
        <Suspense fallback={<div className="p-4 w-full flex flex-col gap-4 items-center">
            <Skeleton className="h-16 w-1/2" />
            <Skeleton className="h-24 w-full max-w-4xl" />
            <Skeleton className="h-96 w-full max-w-4xl" />
        </div>}>
            <SelectSpotContent />
        </Suspense>
    )
}
