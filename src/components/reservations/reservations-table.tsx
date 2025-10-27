
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
import { format, isSameDay } from 'date-fns';
import { useState, useContext, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Reservation } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { ReservationsContext } from '@/context/reservations-context';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Activity, CalendarClock, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/firebase';

type Status = 'Active' | 'Completed' | 'Upcoming';

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


export function ReservationsTable() {
  const context = useContext(ReservationsContext);
  const { user } = useUser();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [displayReservations, setDisplayReservations] = useState<Reservation[]>([]);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (context?.reservations && user) {
      const now = new Date();
      const userReservations = context.reservations
        .filter(res => res.userId === user.uid)
        .map(res => {
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
      setDisplayReservations(userReservations);
    }
  }, [context?.reservations, user]);

  if (!context) {
    return null; 
  }
  
  const { removeReservation, isLoading, isClient } = context;


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

  const handleCancelReservation = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation();
    if (reservation.status === 'Completed') {
      toast({
        variant: 'destructive',
        title: 'Cannot Cancel',
        description: 'Completed reservations cannot be cancelled.',
        duration: 3000,
      });
      return;
    }
     if (reservation.status === 'Active') {
      toast({
        variant: 'destructive',
        title: 'Cannot Cancel',
        description: 'Active reservations cannot be cancelled.',
        duration: 3000,
      });
      return;
    }
    setReservationToCancel(reservation);
  };
  
  const confirmCancelReservation = () => {
    if (!reservationToCancel) return;
    removeReservation(reservationToCancel.id);
    toast({
      title: 'Reservation Cancelled',
      description: `Your booking for slot ${reservationToCancel.slotId} has been cancelled.`,
      duration: 2000,
    });
    setReservationToCancel(null);
  };

  const handleRowClick = (reservation: Reservation) => {
    if (reservation.status === 'Completed') {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: 'This reservation is already completed and cannot be modified.',
        duration: 3000,
      });
      return;
    }

    if (reservation.status === 'Active') {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: 'This reservation is already active and cannot be modified.',
        duration: 3000,
      });
      return;
    }
    
    // Only 'Upcoming' reservations can be modified
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    const durationInMs = endTime.getTime() - startTime.getTime();
    const durationInHours = Math.round(durationInMs / (1000 * 60 * 60));

    const params = new URLSearchParams({
      vehiclePlate: reservation.vehiclePlate,
      date: startTime.toISOString(),
      startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
      duration: String(durationInHours),
    });
    router.push(`/select-spot?${params.toString()}`);
  }

  const getDateFormat = () => {
    return isMobile ? 'MMM d, h:mm a' : 'MMM d, yyyy, h:mm a';
  };

  const formatLicensePlate = (plate: string | null) => {
    if (!plate) return null;
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    // Indian license plate format
    const match = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{1,4})$/);
    if (match) {
        const [_, state, district, series, number] = match;
        return `${state} ${district} ${series} ${number}`;
    }
    return plate;
  }

  const filteredReservations = displayReservations?.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <Card>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!isClient || isLoading) && renderSkeletons()}
                  {isClient && !isLoading && filteredReservations?.map((reservation) => (
                    <TableRow 
                      key={reservation.id}
                      onClick={() => handleRowClick(reservation)}
                      className={cn({
                        'cursor-pointer hover:bg-muted/50': reservation.status === 'Upcoming',
                        'cursor-not-allowed': reservation.status === 'Active' || reservation.status === 'Completed'
                      })}
                    >
                      <TableCell className="font-medium">
                        {reservation.slotId}
                      </TableCell>
                      <TableCell>{formatLicensePlate(reservation.vehiclePlate)}</TableCell>
                      <TableCell>
                        {format(new Date(reservation.startTime), getDateFormat())}
                      </TableCell>
                      <TableCell>
                        {format(new Date(reservation.endTime), getDateFormat())}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-2">
                           <StatusIcon status={reservation.status} />
                           {reservation.status === 'Upcoming' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => handleCancelReservation(e, reservation)}
                              className="h-auto px-2 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isClient && !isLoading && (!filteredReservations || filteredReservations.length === 0) && (
                <div className="text-center p-8 text-muted-foreground">
                  No {filter !== 'all' ? filter.toLowerCase() : ''} reservations found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <AlertDialog open={!!reservationToCancel} onOpenChange={(open) => !open && setReservationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel your reservation for slot{' '}
              <span className="font-bold">{reservationToCancel?.slotId}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelReservation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
