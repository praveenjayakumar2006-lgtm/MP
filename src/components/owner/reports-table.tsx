'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';

type Violation = {
    id: string;
    slotNumber: string;
    violationType: 'overstaying' | 'unauthorized_parking';
    licensePlate: string;
    createdAt: { toDate: () => Date };
};

export function ReportsTable() {
    const { firestore } = useFirebase();
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
      // Role is checked on the client after mount
      if (localStorage.getItem('role') === 'owner') {
        setIsOwner(true);
      }
    }, []);

    const violationsQuery = useMemoFirebase(() => {
        // Only create the query if the user is an owner and firestore is available
        if (!firestore || !isOwner) return null;
        return query(collection(firestore, 'violations'), orderBy('createdAt', 'desc'));
    }, [firestore, isOwner]);

    const { data: violations, isLoading } = useCollection<Violation>(violationsQuery);
    
    const renderSkeletons = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
      </TableRow>
    ))
  );

  if (!isOwner) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading data...
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slot Number</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Violation Type</TableHead>
          <TableHead>Reported At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && renderSkeletons()}
        {!isLoading && violations?.map((violation) => (
          <TableRow key={violation.id}>
            <TableCell className="font-medium">{violation.slotNumber}</TableCell>
            <TableCell>{violation.licensePlate}</TableCell>
            <TableCell>
              <Badge variant={violation.violationType === 'overstaying' ? 'destructive' : 'secondary'}>
                {violation.violationType === 'overstaying' ? 'Overstaying' : 'Unauthorized'}
              </Badge>
            </TableCell>
            <TableCell>
              {violation.createdAt ? format(violation.createdAt.toDate(), 'PPP p') : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
         {!isLoading && (!violations || violations.length === 0) && (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No violation reports found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
