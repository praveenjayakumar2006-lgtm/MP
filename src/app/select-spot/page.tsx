
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';

export default function SelectSpotPage() {
    return (
        <div
            className="flex flex-col items-center justify-center flex-1 bg-muted p-4"
        >
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl">Select Your Spot</h3>
                    <p className="max-w-2xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-2">
                        Select an available green slot from the map below to make an instant reservation.
                    </p>
                </div>
                <div className="w-full flex justify-center">
                    <ParkingMap />
                </div>
            </div>
        </div>
    )
}
