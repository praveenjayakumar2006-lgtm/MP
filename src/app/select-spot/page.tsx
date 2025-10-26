
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, addHours } from 'date-fns';
import { Calendar, Clock, Hourglass, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

    const getEndTime = () => {
        if (!date || !startTime || !duration) return 'N/A';
        const startDate = parseISO(date);
        const [hour, minute] = startTime.split(':').map(Number);
        startDate.setHours(hour, minute);
        const endDate = addHours(startDate, parseInt(duration, 10));
        return format(endDate, 'h:mm a');
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

                {bookingDetails && (
                    <Card className="w-full mb-6">
                        <CardHeader className="p-4">
                            <h4 className="text-lg font-semibold">Your Booking Details</h4>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Number Plate</p>
                                        <p className="text-muted-foreground">{vehiclePlate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Date</p>
                                        <p className="text-muted-foreground">{formattedDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Time</p>
                                        <p className="text-muted-foreground">{formattedTime(startTime)} - {getEndTime()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hourglass className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Duration</p>
                                        <p className="text-muted-foreground">{duration} hour{Number(duration) > 1 ? 's' : ''}</p>
                                    </div>
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
