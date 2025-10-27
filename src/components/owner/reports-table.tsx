
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
                <CardHeader className="p-0">
                    {violation.imageUrl ? (
                        <Image 
                            src={violation.imageUrl} 
                            alt={`Violation at ${violation.slotNumber}`}
                            width={400}
                            height={300}
                            className="object-cover rounded-t-lg aspect-[4/3]"
                        />
                    ) : (
                        <div className="h-40 w-full bg-muted flex items-center justify-center rounded-t-lg">
                            <p className="text-muted-foreground text-sm">No Image</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    <CardTitle className="text-lg">Slot: {violation.slotNumber}</CardTitle>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Plate: <span className="font-mono bg-muted px-2 py-1 rounded-md">{violation.licensePlate}</span>
                        </p>
                    </div>
                     <div>
                        <Badge variant={violation.violationType === 'overstaying' ? 'destructive' : 'secondary'}>
                            {violation.violationType === 'overstaying' ? 'Overstaying' : 'Unauthorized'}
                        </Badge>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground">
                        {violation.createdAt ? format(violation.createdAt.toDate(), 'PPP p') : 'N/A'}
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
