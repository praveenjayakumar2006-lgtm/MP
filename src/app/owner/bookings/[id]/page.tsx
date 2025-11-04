
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Car, Clock, Hash, Mail, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Reservation } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getReservationsFromFile } from '@/app/reservations/actions';
import { useToast } from '@/hooks/use-toast';

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-sm">{value}</p>
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

  const fetchReservationDetails = useCallback(async () => {
    if (typeof id !== 'string') return;
    setIsLoading(true);
    const result = await getReservationsFromFile();

    if (result.success && result.data) {
        const found = result.data.find(res => res.id === id);
        if (found) {
            setReservation(found);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Booking not found.' });
            router.replace('/owner?view=bookings');
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch booking details.' });
    }
    setIsLoading(false);
  }, [id, router, toast]);

  useEffect(() => {
    fetchReservationDetails();
  }, [fetchReservationDetails]);


  if (isLoading || !reservation) {
    return (
        <div className="w-full max-w-sm mx-auto mt-6">
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
                    </div>
                     <Skeleton className="h-px w-full" />
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-28" />
                             <Skeleton className="h-4 w-40" />
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  // Since we don't have user profiles in files, we can't display user details like name/email.
  // We will just show the user ID.

  return (
    <div className="w-full max-w-sm mx-auto mt-6">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Booking Details</CardTitle>
                <CardDescription>
                    ID: <span className="font-mono text-primary bg-primary/10 text-xs px-1 rounded-sm">{reservation.id}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pt-2">
                   <DetailItem icon={Hash} label="Slot ID" value={reservation.slotId} />
                   <DetailItem icon={Car} label="Vehicle Plate" value={reservation.vehiclePlate} />
                   <DetailItem icon={Calendar} label="Start Time" value={format(new Date(reservation.startTime), 'PPp')} />
                   <DetailItem icon={Clock} label="End Time" value={format(new Date(reservation.endTime), 'PPp')} />
                </div>
                <Separator />
                <div>
                    <h3 className="text-base font-semibold mb-3">User Information</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">User ID</p>
                            <p className="text-xs text-muted-foreground">{reservation.userId}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
