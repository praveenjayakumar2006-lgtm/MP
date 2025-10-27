
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsTable } from "@/components/owner/reports-table";
import { FeedbackTable } from "@/components/owner/feedback-table";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

function OwnerDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isUserLoading } = useUser();
    const [isOwner, setIsOwner] = useState(false);

    const view = searchParams.get('view') || 'home';

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'owner') {
            router.replace('/login');
        } else {
            setIsOwner(true);
        }
    }, [router]);

    const showLoading = !isOwner || (isUserLoading && !user);
    
    const handleTabChange = (value: string) => {
        router.push(`/owner?view=${value}`);
    };

    const renderHome = () => (
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Owner!</CardTitle>
                <CardDescription>
                    This is the central dashboard for managing your parking application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>From here, you can review user-submitted violation reports and read valuable feedback to improve your service.</p>
                <p className="mt-4">Please use the navigation menu or the links in the header to view reports and feedback.</p>
            </CardContent>
        </Card>
    );

    const renderReports = () => (
         <Card>
            <CardHeader>
                <CardTitle>Violation Reports</CardTitle>
                <CardDescription>
                    All violation reports submitted by users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isOwner && user && <ReportsTable />}
            </CardContent>
        </Card>
    );

    const renderFeedback = () => (
        <Card>
            <CardHeader>
                <CardTitle>User Feedback</CardTitle>
                <CardDescription>
                    All feedback submitted by users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isOwner && user && <FeedbackTable />}
            </CardContent>
        </Card>
    );
    
    const renderContent = () => {
        switch (view) {
            case 'reports':
                return renderReports();
            case 'feedback':
                return renderFeedback();
            case 'home':
            default:
                return renderHome();
        }
    }


    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-background p-4 md:p-6">
            <div className="w-full max-w-6xl">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Owner Dashboard</CardTitle>
                        <CardDescription>Review user-submitted reports and feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {showLoading ? (
                             <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Authenticating owner...</span>
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OwnerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center flex-1"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <OwnerDashboard />
        </Suspense>
    )
}

    
