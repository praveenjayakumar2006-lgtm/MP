
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
import { format } from 'date-fns';
import { useState, useContext, useEffect } from 'react';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ReservationsContext } from '@/context/reservations-context';
import { useFirebase, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, query, orderBy, doc, getDoc, FirestoreError } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

type Status = 'Active' | 'Completed' | 'Upcoming';

type EnrichedReservation = Reservation & {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export function BookingsTable() {
  const context = useContext(ReservationsContext);
  const { firestore } = useFirebase();
  const [enrichedReservations, setEnrichedReservations] = useState<EnrichedReservation[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();

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
          setEnrichedReservations(enriched.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
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

  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      </TableRow>
    ));

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Slot ID</TableHead>
              <TableHead>Vehicle Plate</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!isClient || isLoading || isLoadingUsers) && renderSkeletons()}
            {isClient && !isLoading && !isLoadingUsers && enrichedReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {reservation.user?.firstName?.[0]}
                        {reservation.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {reservation.user?.firstName} {reservation.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.user?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{reservation.slotId}</TableCell>
                <TableCell>{reservation.vehiclePlate}</TableCell>
                <TableCell>{format(new Date(reservation.startTime), 'MMM d, yyyy, h:mm a')}</TableCell>
                <TableCell>{format(new Date(reservation.endTime), 'MMM d, yyyy, h:mm a')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isClient && !isLoading && !isLoadingUsers && enrichedReservations.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No bookings found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
