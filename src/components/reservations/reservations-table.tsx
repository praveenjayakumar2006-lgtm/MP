
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
import { useState, useContext, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ReservationsContext } from '@/context/reservations-context';

type Status = 'Active' | 'Completed' | 'Upcoming';

export function ReservationsTable() {
  const { reservations, isLoading } = useContext(ReservationsContext)!;
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [displayReservations, setDisplayReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const now = new Date();
    const updatedReservations = reservations.map(res => {
      const startTime = new Date(res.startTime);
      const endTime = new Date(res.endTime);
      let status: Status = 'Upcoming';
      if (now >= startTime && now <= endTime) {
        status = 'Active';
      } else if (now > endTime) {
        status = 'Completed';
      }
      return { ...res, status };
    });
    setDisplayReservations(updatedReservations);
  }, [reservations]);


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

  const filteredReservations = displayReservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

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
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && filteredReservations?.map((reservation) => (
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
            {!isLoading && (!filteredReservations || filteredReservations.length === 0) && (
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
