
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, Clock, Hash, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

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
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { toast } = useToast();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!isUserLoading && role === 'owner') {
      setIsReady(true);
    }
  }, [isUserLoading, user]);

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore || !isReady) return null;
    return query(collection(firestore, 'reservations'), orderBy('createdAt', 'desc'));
  }, [firestore, isReady]);

  const { data: reservationsData, isLoading, error: collectionError } = useCollection<Reservation>(reservationsQuery);

  useEffect(() => {
    if (collectionError) {
      console.error("Error fetching bookings:", collectionError);
      toast({
        variant: "destructive",
        title: "Error fetching bookings",
        description: "Could not fetch user bookings. Please try again later.",
      });
    }
    if (reservationsData) {
      const now = new Date();
      const allReservations: Reservation[] = reservationsData.map(res => {
        const startTime = (res.startTime as any).toDate();
        const endTime = (res.endTime as any).toDate();
        let status: Status;

        if (now > endTime) {
          status = 'Completed';
        } else if (now >= startTime && now < endTime) {
          status = 'Active';
        } else {
          status = 'Upcoming';
        }
        return { ...res, status, startTime, endTime };
      });
      setReservations(allReservations);
    } else if (!isLoading && isReady) {
        setReservations([]);
    }
  }, [reservationsData, isLoading, isReady, collectionError, toast]);


  const isDataLoading = isLoading || !isReady;


  const filteredReservations = reservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());


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

  const getStatusBadgeVariant = (status: Status) => {
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
    <div>
        <div className="mb-8 mt-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
            <p className="text-muted-foreground mt-2">{getDescription()}</p>
        </div>
         <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <div className="flex items-center justify-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Active">Active</TabsTrigger>
                <TabsTrigger value="Upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={filter} className="mt-8">
              {isDataLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderSkeletons()}</div>}
              {!isDataLoading && (
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
                                  <div className="flex items-center gap-2 text-xs pt-1.5 text-muted-foreground">
                                      <UserIcon className="h-3.5 w-3.5" />
                                      <span className="truncate">User ID: {reservation.userId}</span>
                                  </div>
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
              {!isDataLoading && (!filteredReservations || filteredReservations.length === 0) && (
                <Card className="mt-6">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No {filter !== 'all' ? filter.toLowerCase() : ''} bookings found.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
        </Tabs>
      </div>
  );
}
