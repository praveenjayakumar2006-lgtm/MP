
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
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

type Status = 'Active' | 'Completed' | 'Upcoming';

const mockReservations: Reservation[] = [
    {
        id: '1',
        slotId: 'C2',
        userId: 'user-123',
        vehiclePlate: 'USER-195',
        startTime: new Date('2025-10-17T21:00:00'),
        endTime: new Date('2025-10-17T22:00:00'),
        status: 'Upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        slotId: 'B3',
        userId: 'user-123',
        vehiclePlate: 'USER-163',
        startTime: new Date('2025-10-17T21:00:00'),
        endTime: new Date('2025-10-17T22:00:00'),
        status: 'Upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];


export function ReservationsTable() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState(mockReservations);


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
