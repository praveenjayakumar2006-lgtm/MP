'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeedback } from "@/app/feedback/actions";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";


type Feedback = {
  id: string;
  name: string;
  email: string;
  rating: number;
  feedback: string;
  createdAt: string;
};

function FeedbackList() {
    const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            setIsLoading(true);
            try {
                const data = await getFeedback();
                setFeedbackData(data);
            } catch (err) {
                console.error(err);
                setError('Could not load feedback data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex-row items-start gap-4 space-y-0">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-3 w-40" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-destructive">
                        {error}
                    </p>
                </CardContent>
            </Card>
        )
    }
    
    if (!feedbackData || feedbackData.length === 0) {
        return (
            <div className="w-full rounded-lg border bg-card text-card-foreground p-6 text-center text-muted-foreground">
                No feedback has been submitted yet.
            </div>
        )
    }

    const sortedFeedback = [...feedbackData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="space-y-4">
            {sortedFeedback.map((feedback) => (
                <Card key={feedback.id}>
                    <CardHeader className="flex-row items-start gap-4 space-y-0">
                        <Avatar className="h-12 w-12 border">
                            <AvatarFallback>{feedback.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
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
                            <p className="text-sm text-muted-foreground">{feedback.email}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground whitespace-pre-wrap">{feedback.feedback}</p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">
                            Submitted on {feedback.createdAt ? format(new Date(feedback.createdAt), 'PPP p') : 'N/A'}
                        </p>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


export default function OwnerFeedbackPage() {
    return (
        <div className="w-full max-w-md mx-auto py-8 flex flex-col h-full">
            <div className="mb-8 text-center flex-shrink-0">
                <div className="inline-flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">User Feedback</h1>
                </div>
                <p className="text-muted-foreground mt-2">All feedback submitted by users.</p>
            </div>
            <ScrollArea className="flex-1 pr-4">
                <FeedbackList />
            </ScrollArea>
        </div>
    );
}
