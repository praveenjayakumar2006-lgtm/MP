
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead>Submitted At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && renderSkeletons()}
        {!isLoading && feedbackData?.map((feedback) => (
          <TableRow key={feedback.id}>
            <TableCell>
                <div className="font-medium">{feedback.name}</div>
                <div className="text-sm text-muted-foreground">{feedback.email}</div>
            </TableCell>
            <TableCell>
                 <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                        key={star}
                        className={cn(
                            'h-5 w-5',
                            feedback.rating >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        )}
                        />
                    ))}
                </div>
            </TableCell>
            <TableCell className="max-w-sm whitespace-pre-wrap">{feedback.feedback}</TableCell>
            <TableCell>
              {feedback.createdAt ? format(feedback.createdAt.toDate(), 'PPP p') : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
         {!isLoading && (!feedbackData || feedbackData.length === 0) && (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No feedback found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
