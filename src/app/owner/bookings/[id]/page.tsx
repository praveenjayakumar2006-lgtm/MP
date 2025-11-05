
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Car, Clock, Hash, Mail, User as UserIcon, Info, Badge as BadgeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Reservation } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getReservations } from '@/app/actions/reservations';
import { getUsers } from '@/app/actions/users';
import { Badge } from '@/components/ui/badge';


type User = {
    id: string;
    username: string;
    email: string;
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="font-medium text-sm">{value}</div>
            </div>
        </div>
    )
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchBookingDetails = useCallback(async () => {
    if (typeof id !== 'string') return;
    setIsLoading(true);
    try {
      const allReservations = await getReservations();
      const currentReservation = allReservations.find(res => res.id === id);

      if (currentReservation) {
        setReservation(currentReservation as any);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Booking not found.' });
        router.replace('/owner?view=bookings');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch booking details.' });
    } finally {
      setIsLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const getStatusBadgeVariant = (status: Reservation['status']) => {
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


  if (isLoading || !reservation) {
    return (
        <div className="w-full max-w-lg mx-auto mt-6">
            <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Skeleton className="h-px w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  const startTime = new Date(reservation.startTime);
  const endTime = new Date(reservation.endTime);


  return (
    <div className="w-full max-w-lg mx-auto mt-6">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Booking Details</CardTitle>
                <CardDescription>
                    {reservation.userName ? `${reservation.userName} (${reservation.email})` : 'User details not found'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pt-2">
                   <DetailItem icon={Hash} label="Slot ID" value={reservation.slotId} />
                   <DetailItem icon={Car} label="Vehicle Plate" value={reservation.vehiclePlate} />
                   <DetailItem icon={Calendar} label="Start Time" value={format(startTime, 'PPp')} />
                   <DetailItem icon={Clock} label="End Time" value={format(endTime, 'PPp')} />
                   <DetailItem
                        icon={BadgeIcon}
                        label="Status"
                        value={
                            <Badge variant={getStatusBadgeVariant(reservation.status)}>
                                {reservation.status}
                            </Badge>
                        }
                    />
                   <DetailItem icon={Info} label="Booked On" value={format(new Date(reservation.createdAt), 'PPp')} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
