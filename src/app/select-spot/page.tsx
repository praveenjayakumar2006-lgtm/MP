
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Hourglass, Info } from 'lucide-react';

function SelectSpotContent() {
    const searchParams = useSearchParams();
    const vehiclePlate = searchParams.get('vehiclePlate');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const duration = searchParams.get('duration');

    const bookingDetails = vehiclePlate && date && startTime && duration ? { vehiclePlate, date, startTime, duration } : undefined;

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
                        Select an available green slot from the map below to make a reservation
                    </p>
                </div>

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
