
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Car, Clock, Hash, Mail, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Reservation } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

type EnrichedReservation = Reservation & {
  user?: UserProfile;
};

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-base">{value}</p>
            </div>
        </div>
    )
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { firestore } = useFirebase();
  const [reservation, setReservation] = useState<EnrichedReservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reservationRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'reservations', id);
  }, [firestore, id]);

  const { data: reservationData, isLoading: isReservationLoading } = useDoc<Reservation>(reservationRef);
  
  useEffect(() => {
    const fetchFullDetails = async () => {
        if (reservationData && firestore) {
            let enrichedData: EnrichedReservation = {
                ...reservationData,
                startTime: (reservationData.startTime as any).toDate(),
                endTime: (reservationData.endTime as any).toDate(),
            };

            if (reservationData.userId) {
                try {
                    const userDocRef = doc(firestore, 'users', reservationData.userId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        enrichedData.user = userDoc.data() as UserProfile;
                    }
                } catch (error) {
                    console.error("Failed to fetch user details:", error);
                }
            }
            setReservation(enrichedData);
            setIsLoading(false);
        } else if (!isReservationLoading && !reservationData) {
            // Data is not found, but we want to wait to show anything until we are sure.
            // Let's ensure loading is false only after a final check.
            setIsLoading(false);
        }
    }

    fetchFullDetails();
  }, [reservationData, isReservationLoading, firestore])


  if (isLoading || isReservationLoading || !reservation) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <Skeleton className="h-10 w-40 mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <Skeleton className="h-px w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                     <Skeleton className="h-px w-full" />
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-32" />
                             <Skeleton className="h-4 w-48" />
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  const userFullName = reservation.user ? `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}`.trim() : 'Unknown User';

  return (
    <div className="w-full max-w-2xl mx-auto">
        <Button onClick={() => router.push('/owner?view=bookings')} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
        </Button>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Booking Details</CardTitle>
                <CardDescription>
                    Complete information for reservation <span className="font-mono text-primary bg-primary/10 px-1 rounded-sm">{reservation.id.slice(0, 6)}...</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                   <DetailItem icon={Hash} label="Slot ID" value={reservation.slotId} />
                   <DetailItem icon={Car} label="Vehicle Plate" value={reservation.vehiclePlate} />
                   <DetailItem icon={Calendar} label="Start Time" value={format(new Date(reservation.startTime), 'PPP p')} />
                   <DetailItem icon={Clock} label="End Time" value={format(new Date(reservation.endTime), 'PPP p')} />
                </div>
                {reservation.user && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-4">User Information</h3>
                             <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{userFullName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{userFullName}</p>
                                    <p className="text-sm text-muted-foreground">{reservation.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
