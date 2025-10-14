
'use client';

import { ParkingMap } from '@/components/dashboard/parking-map';
import { motion } from 'framer-motion';

export default function SelectSpotPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted p-4"
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
        </motion.div>
    )
}
