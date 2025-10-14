
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';

export default function SelectSpotPage() {
    return (
        <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl">Select Your Spot</h3>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Select an available green slot from the map below to make an instant reservation.
                        </p>
                    </div>
                </div>
                <div className="flex justify-center w-full">
                    <ParkingMap />
                </div>
            </div>
        </section>
    )
}
