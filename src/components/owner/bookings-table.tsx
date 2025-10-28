
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useFirebase, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, query, orderBy, doc, getDoc, FirestoreError } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { User, Car, Calendar, Clock, Hash, CheckCircle, Hourglass, ArrowRight, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

type Status = 'Active' | 'Completed' | 'Upcoming';

type EnrichedReservation = Reservation & {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export function BookingsTable() {
  const { firestore, user: ownerUser, isUserLoading: isOwnerLoading } = useFirebase();
  const [enrichedReservations, setEnrichedReservations] = useState<EnrichedReservation[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const router = useRouter();

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For the owner, we fetch all reservations.
    return query(collection(firestore, 'reservations'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: reservations, isLoading, error: collectionError } = useCollection<Reservation>(reservationsQuery);

  useEffect(() => {
    if (reservations && firestore) {
      const now = new Date();
      const allReservations: Reservation[] = reservations.map(res => {
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

      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const enriched = await Promise.all(
            allReservations.map(async res => {
              if (!res.userId) return res;
              try {
                const userDocRef = doc(firestore, 'users', res.userId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    ...res,
                    user: {
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      email: userData.email,
                    },
                  };
                }
              } catch (e) {
                if (e instanceof FirestoreError && e.code === 'permission-denied') {
                  const contextualError = new FirestorePermissionError({
                    path: `users/${res.userId}`,
                    operation: 'get',
                  });
                  errorEmitter.emit('permission-error', contextualError);
                  throw contextualError;
                }
              }
              return res;
            })
          );
          setEnrichedReservations(enriched);
        } catch (error) {
            if (!(error instanceof FirestorePermissionError)) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching user data',
                    description: 'Could not load all booking details.',
                });
            }
        } finally {
            setIsLoadingUsers(false);
        }
      };
      
      fetchUsers();
    } else if (!isLoading && !reservations) {
        setIsLoadingUsers(false);
        setEnrichedReservations([]);
    }
  }, [reservations, firestore, toast, isLoading]);


  const isDataLoading = isLoading || isLoadingUsers || isOwnerLoading;
  const isClient = typeof window !== 'undefined';


  const filteredReservations = enrichedReservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());


  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <Card key={`skel-${i}`}>
          <CardHeader className="flex-row items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
              </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
               <Skeleton className="h-px w-full" />
               <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
               </div>
          </CardContent>
           <CardFooter>
              <Skeleton className="h-9 w-32" />
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
        <div className="mb-8 mt-8">
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
            <TabsContent value={filter}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(!isClient || isDataLoading) && renderSkeletons()}
                {isClient && !isDataLoading && filteredReservations.map((reservation) => {
                    const userFullName = reservation.user ? `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}`.trim() : 'N/A';
                    return (
                        <Card key={reservation.id} className="flex flex-col">
                           <CardHeader className="flex-row items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                        {userFullName !== 'N/A' ? userFullName.charAt(0).toUpperCase() : <UserCircle />}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{userFullName}</p>
                                    <p className="text-xs text-muted-foreground">{reservation.user?.email || 'No email'}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0 flex-1">
                                <Separator />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm pt-2">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">{reservation.slotId}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{reservation.vehiclePlate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                                        <span>{format(new Date(reservation.startTime), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Clock className="h-4 w-4 text-muted-foreground"/>
                                        <span>{`${format(new Date(reservation.startTime), 'p')} - ${format(new Date(reservation.endTime), 'p')}`}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="justify-between items-center">
                                <Badge variant={getStatusBadgeVariant(reservation.status)}>{reservation.status}</Badge>
                            </CardFooter>
                        </Card>
                    )
                })}
              </div>
              {isClient && !isDataLoading && filteredReservations.length === 0 && (
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
