
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

    return (
        <div className="space-y-4">
            {feedbackData.length === 0 ? (
                 <Card className="w-full">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            No feedback has been submitted yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                feedbackData.map((feedback, index) => (
                    <Card key={index} className="w-full">
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
                                <p className="text-sm text-muted-foreground">{feedback.email}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Separator className="my-4" />
                            <p className="text-lg text-foreground whitespace-pre-wrap">{feedback.feedback}</p>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground">
                                Submitted on {format(new Date(feedback.createdAt), 'PPP p')}
                            </p>
                        </CardFooter>
                    </Card>
                ))
            )}
        </div>
    );
}


export default function OwnerFeedbackPage() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">User Feedback</h1>
                <p className="text-muted-foreground mt-2">All feedback submitted by users.</p>
            </div>
            <FeedbackList />
        </div>
    );
}
