
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
import { reservations } from '@/lib/data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type Status = 'Active' | 'Completed' | 'Upcoming';

export function ReservationsTable() {
  const [filter, setFilter] = useState<Status | 'all'>('all');

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

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

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
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.slotId}
                    </TableCell>
                    <TableCell>{reservation.vehiclePlate}</TableCell>
                    <TableCell>
                      {format(reservation.startTime, 'MMM d, yyyy, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {format(reservation.endTime, 'MMM d, yyyy, h:mm a')}
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
             {filteredReservations.length === 0 && (
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
