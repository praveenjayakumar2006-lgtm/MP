'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

type Violation = {
    id: string;
    slotNumber: string;
    violationType: 'overstaying' | 'unauthorized_parking';
    licensePlate: string;
    createdAt: { toDate: () => Date };
    imageUrl?: string;
};

// Formats license plates like 'TN72FB9999' to 'TN 72 FB 9999'
const formatLicensePlate = (plate: string | null) => {
    if (!plate) return null;
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    const match = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
    if (match) {
        const [_, state, district, series, number] = match;
        return `${state} ${district} ${series} ${number}`;
    }
    return plate;
}

const formatSlotId = (slotId: string | null) => {
    if (!slotId) return null;
    const match = slotId.match(/^([A-Z])(\d+)$/);
    if (match) {
        return `${match[1]} ${match[2]}`;
    }
    return slotId;
}


export function ReportsTable() {
    const { firestore } = useFirebase();

    const violationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'violations'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: violations, isLoading } = useCollection<Violation>(violationsQuery);
    
    const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
        <Card key={`skel-${i}`}>
            <CardHeader>
                <Skeleton className="h-40 w-full" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-4 w-40" />
            </CardFooter>
        </Card>
        ))}
    </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && renderSkeletons()}
        {!isLoading && violations?.map((violation) => (
             <Card key={violation.id}>
                {violation.imageUrl && (
                    <CardHeader>
                        <Image
                            src={violation.imageUrl}
                            alt={`Violation at ${violation.slotNumber}`}
                            width={400}
                            height={225}
                            className="rounded-t-lg object-cover aspect-video"
                        />
                    </CardHeader>
                )}
                <CardContent className="space-y-2 pt-4">
                    <Badge variant={violation.violationType === 'overstaying' ? 'destructive' : 'secondary'}>
                        {violation.violationType.replace('_', ' ')}
                    </Badge>
                    <CardTitle className="text-xl">{formatLicensePlate(violation.licensePlate)}</CardTitle>
                    <p className="text-muted-foreground">
                        Slot: <span className="font-semibold text-foreground">{formatSlotId(violation.slotNumber)}</span>
                    </p>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">
                       Reported on {violation.createdAt ? format(violation.createdAt.toDate(), 'PPP p') : 'N/A'}
                    </p>
                </CardFooter>
            </Card>
        ))}
         {!isLoading && (!violations || violations.length === 0) && (
            <div className="col-span-full text-center p-8 text-muted-foreground bg-card rounded-lg">
                No violation reports found.
            </div>
        )}
    </div>
  );
}
