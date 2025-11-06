
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { format } from 'date-fns';
import { useState, useEffect, useCallback, useContext } from 'react';
import type { Reservation, User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, Clock, Hash, User as UserIcon, Loader2, CalendarCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ReservationsContext } from '@/context/reservations-context';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';


type Status = 'Active' | 'Completed' | 'Upcoming';


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

export function BookingsTable() {
  const context = useContext(ReservationsContext);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const router = useRouter();

  if (!context) {
    return <div className="flex flex-1 items-center justify-center p-8">Error: Component must be used within a ReservationsProvider.</div>;
  }
  const { reservations, isLoading } = context;

  const filteredReservations = reservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => {
    const statusOrder: Record<Status, number> = { 'Active': 1, 'Upcoming': 2, 'Completed': 3 };
    const statusA = statusOrder[a.status];
    const statusB = statusOrder[b.status];

    if (filter === 'all' && statusA !== statusB) {
        return statusA - statusB;
    }
    
    // For 'Active' and 'Upcoming', sort chronologically
    if (a.status !== 'Completed') {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }

    // For 'Completed', sort reverse chronologically (most recent first)
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });


  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <Card key={`skel-${i}`} className="text-sm p-3">
          <CardHeader className="p-1">
              <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-2 p-1 pt-2">
               <Separator />
               <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 text-xs">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
               </div>
          </CardContent>
           <CardFooter className="p-1 pt-2">
              <Skeleton className="h-5 w-20" />
          </CardFooter>
      </Card>
    ));

  const getStatusBadgeVariant = (status: Status): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status) {
      case 'Active':
        return 'active';
      case 'Completed':
        return 'completed';
      case 'Upcoming':
        return 'upcoming';
      default:
        return 'default';
    }
  };

  const getTitle = () => {
    switch (filter) {
      case 'Active':
        return 'Active Bookings';
      case 'Upcoming':
        return 'Upcoming Bookings';
      case 'Completed':
        return 'Completed Bookings';
      default:
        return 'All User Bookings';
    }
  };

  const getDescription = () => {
    switch (filter) {
      case 'Active':
        return 'Reservations that are currently in progress.';
      case 'Upcoming':
        return 'Reservations that are scheduled for the future.';
      case 'Completed':
        return 'Reservations that have already ended.';
      default:
        return 'A comprehensive list of all reservations made by users.';
    }
  };


  return (
    <>
      <CardHeader className="text-center">
        <div className="inline-flex items-center gap-2 justify-center">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">{getTitle()}</CardTitle>
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <div className="flex items-center justify-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Active">Active</TabsTrigger>
                <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={filter} className="mt-4">
              {isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderSkeletons()}</div>}
              {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReservations && filteredReservations.map((reservation) => {
                      return (
                          <Card key={reservation.id} className="flex flex-col text-sm p-3">
                            <CardHeader className="p-1 flex-row justify-between items-center space-y-0">
                                  <div className="flex items-center gap-2">
                                      <Hash className="h-3.5 w-3.5 text-muted-foreground"/>
                                      <span className="font-medium">{formatSlotId(reservation.slotId)}</span>
                                  </div>
                                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{formatLicensePlate(reservation.vehiclePlate)}</span>
                              </CardHeader>
                              <CardContent className="space-y-2 p-1 pt-2 flex-1 flex flex-col">
                                  <div className="flex items-center gap-2 text-base">
                                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{reservation.userName}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between items-center flex-1 py-0.5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-base">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground"/>
                                            <span>{format(new Date(reservation.startTime), 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-base">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
                                            <span>{`${format(new Date(reservation.startTime), 'p')} - ${format(new Date(reservation.endTime), 'p')}`}</span>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(reservation.status)}>{reservation.status}</Badge>
                                  </div>
                                  <Separator />
                              </CardContent>
                              <CardFooter className="p-1 pt-2 justify-between items-center">
                                <Button size="sm" variant="outline" onClick={() => router.push(`/owner/bookings/${reservation.id}`)}>
                                    View Details
                                </Button>
                              </CardFooter>
                          </Card>
                      )
                  })}
                </div>
              )}
              {!isLoading && (!filteredReservations || filteredReservations.length === 0) && (
                <div className="mt-6 border rounded-lg p-8 text-center text-muted-foreground">
                    No {filter !== 'all' ? filter.toLowerCase() : ''} bookings found.
                </div>
              )}
            </TabsContent>
        </Tabs>
      </CardContent>
      </>
  );
}
