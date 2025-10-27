
'use client';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type Feedback = {
    id: string;
    name: string;
    email: string;
    rating: number;
    feedback: string;
    createdAt: { toDate: () => Date };
};

export function FeedbackTable() {
    const { firestore } = useFirebase();

    const feedbackQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'feedback'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: feedbackData, isLoading } = useCollection<Feedback>(feedbackQuery);

    const renderSkeletons = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
        <Card key={`skel-${i}`}>
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </CardHeader>
            <CardContent>
                 <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
             <CardFooter>
                 <Skeleton className="h-4 w-40" />
            </CardFooter>
        </Card>
        ))}
    </div>
  );

  return (
    <div className="space-y-4">
        {isLoading && renderSkeletons()}
        {!isLoading && feedbackData?.map((feedback) => (
            <Card key={feedback.id} className="w-full">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{feedback.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <p className="font-semibold">{feedback.name}</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                        key={star}
                                        className={cn(
                                            'h-4 w-4',
                                            feedback.rating >= star
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Separator className="my-4" />
                    <p className="text-[25px] text-foreground whitespace-pre-wrap">{feedback.feedback}</p>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Submitted on {feedback.createdAt ? format(feedback.createdAt.toDate(), 'PPP p') : 'N/A'}
                    </p>
                </CardFooter>
            </Card>
        ))}
         {!isLoading && (!feedbackData || feedbackData.length === 0) && (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        No feedback found.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
  );
}
