
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, getDoc, FirestoreError } from 'firebase/firestore';
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
  const { firestore } = useFirebase();
  const [reservation, setReservation] = useState<EnrichedReservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reservationRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'reservations', id);
  }, [firestore, id]);

  const { data: reservationData, isLoading: isReservationLoading, error } = useDoc<Reservation>(reservationRef);
  
  useEffect(() => {
    if (error) {
        console.error("Error fetching booking details:", error);
    }
    const fetchFullDetails = async () => {
        if (reservationData && firestore) {
            let enrichedData: EnrichedReservation = {
                ...reservationData,
                startTime: (reservationData.startTime as any).toDate(),
                endTime: (reservationData.endTime as any).toDate(),
            };

            if (reservationData.userId) {
                const userDocRef = doc(firestore, 'users', reservationData.userId);
                try {
                  const userDoc = await getDoc(userDocRef);
                  if (userDoc.exists()) {
                      enrichedData.user = userDoc.data() as UserProfile;
                  }
                } catch (userError) {
                    console.error("Could not fetch user profile for booking:", userError)
                } finally {
                  setReservation(enrichedData);
                }
            } else {
                setReservation(enrichedData);
            }
        }
        setIsLoading(isReservationLoading);
    }

    fetchFullDetails();
  }, [reservationData, isReservationLoading, firestore, error])


  if (isLoading || !reservation) {
    return (
        <div className="w-full max-w-md mx-auto">
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

  const userFullName = reservation.user ? `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}`.trim() : 'Unknown User';

  return (
    <div className="w-full max-w-md mx-auto">
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
                {reservation.user && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-base font-semibold mb-3">User Information</h3>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{userFullName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{userFullName}</p>
                                    <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
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
