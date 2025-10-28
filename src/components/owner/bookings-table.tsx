
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useContext, useEffect } from 'react';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ReservationsContext } from '@/context/reservations-context';
import { useFirebase, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, query, orderBy, doc, getDoc, FirestoreError } from 'firebase/firestore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Activity, CalendarClock, CheckCircle2 } from 'lucide-react';

type Status = 'Active' | 'Completed' | 'Upcoming';

type EnrichedReservation = Reservation & {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

const StatusIcon = ({ status }: { status: Status }) => {
  const iconMap: Record<Status, React.ReactElement> = {
    Active: <Activity className="h-5 w-5 text-blue-500" />,
    Completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    Upcoming: <CalendarClock className="h-5 w-5 text-yellow-500" />,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{iconMap[status]}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


export function BookingsTable() {
  const context = useContext(ReservationsContext);
  const { firestore } = useFirebase();
  const [enrichedReservations, setEnrichedReservations] = useState<EnrichedReservation[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (context?.reservations && firestore) {
      const now = new Date();
      const allReservations: Reservation[] = context.reservations.map(res => {
        const startTime = new Date(res.startTime);
        const endTime = new Date(res.endTime);
        let status: Status;

        if (now > endTime) {
          status = 'Completed';
        } else if (now >= startTime && now < endTime) {
          status = 'Active';
        } else {
          status = 'Upcoming';
        }
        return { ...res, status };
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
                  // Stop further processing if a permission error occurs.
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
    }
  }, [context?.reservations, firestore, toast]);

  if (!context) {
    return null;
  }
  
  const { isLoading, isClient } = context;

  const filteredReservations = enrichedReservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());


  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      </TableRow>
    ));

  const getDateFormat = () => {
    return isMobile ? 'MMM d, h:mm a' : 'MMM d, yyyy, h:mm a';
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
        return 'All Bookings';
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
        return 'A comprehensive list of all user reservations.';
    }
  };


  return (
    <>
      <CardHeader>
          <CardTitle className="text-3xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
         <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <div className="flex items-center justify-center p-4">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!isClient || isLoading || isLoadingUsers) && renderSkeletons()}
                  {isClient && !isLoading && !isLoadingUsers && filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.slotId}</TableCell>
                      <TableCell>{reservation.vehiclePlate}</TableCell>
                      <TableCell>{format(new Date(reservation.startTime), getDateFormat())}</TableCell>
                      <TableCell>{format(new Date(reservation.endTime), getDateFormat())}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isClient && !isLoading && !isLoadingUsers && filteredReservations.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No {filter !== 'all' ? filter.toLowerCase() : ''} bookings found.
                </div>
              )}
            </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
