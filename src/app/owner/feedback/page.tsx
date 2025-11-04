
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getFeedback } from "@/app/feedback/actions";
import { format } from "date-fns";

type Feedback = {
  name: string;
  email: string;
  rating: number;
  feedback: string;
  createdAt: string;
};

async function FeedbackList() {
    const result = await getFeedback();

    if (!result.success || !result.data) {
        return (
             <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-destructive">
                        Could not load feedback data.
                    </p>
                </CardContent>
            </Card>
        )
    }
    
    const feedbackData: Feedback[] = result.data;

    if (feedbackData.length === 0) {
        return (
            <div className="w-full rounded-lg border bg-card text-card-foreground p-6 text-center text-muted-foreground">
                No feedback has been submitted yet.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {feedbackData.map((feedback, index) => (
                <Card key={index}>
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
                            Submitted on {format(new Date(feedback.createdAt), 'PPP p')}
                        </p>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


export default function OwnerFeedbackPage() {
    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">User Feedback</h1>
                </div>
                <p className="text-muted-foreground mt-2">All feedback submitted by users.</p>
            </div>
            <FeedbackList />
        </div>
    );
}
