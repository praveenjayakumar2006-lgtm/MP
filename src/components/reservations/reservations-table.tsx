
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Reservation } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

type Status = 'Active' | 'Completed' | 'Upcoming';

// A placeholder user ID. In a real app, this would come from an auth system.
const USER_ID = 'user-123';

export function ReservationsTable() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const firestore = useFirestore();

  const reservationsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'reservations'), 
        where('userId', '==', USER_ID)
    );
  }, [firestore]);

  const { data: reservations, loading } = useCollection<Reservation>(reservationsQuery, {
      map: (r) => ({
          ...r,
          startTime: (r.startTime as unknown as FirestoreTimestamp).toDate(),
          endTime: (r.endTime as unknown as FirestoreTimestamp).toDate(),
      })
  });

  const getStatusVariant = (status: Status) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'Upcoming':
        return 'outline';
      default:
        return 'default';
    }
  };

  const filteredReservations = reservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
          <div className="flex items-center p-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Active">Active</TabsTrigger>
              <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="Completed">Completed</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={filter}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot ID</TableHead>
                  <TableHead>Vehicle Plate</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                ))}
                {!loading && filteredReservations?.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.slotId}
                    </TableCell>
                    <TableCell>{reservation.vehiclePlate}</TableCell>
                    <TableCell>
                      {format(new Date(reservation.startTime), 'MMM d, yyyy, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(reservation.endTime), 'MMM d, yyyy, h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && (!filteredReservations || filteredReservations.length === 0) && (
              <div className="text-center p-8 text-muted-foreground">
                No {filter !== 'all' ? filter.toLowerCase() : ''} reservations found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
