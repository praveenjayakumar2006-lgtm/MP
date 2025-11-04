
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useTransition } from "react";
import { ReportsTable } from "@/components/owner/reports-table";
import { BookingsTable } from "@/components/owner/bookings-table";
import { Loader2, FileText, MessageSquare, LayoutDashboard, CalendarCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { setUserClaims } from "@/ai/flows/user-claims";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";

function OwnerDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOwner, setIsOwner] = useState(false);
    const { user, auth } = useUser();
    const { toast } = useToast();
    const [isTransitioning, startTransition] = useTransition();

    const view = searchParams.get('view') || 'home';

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'owner') {
            router.replace('/login');
        } else {
            setIsOwner(true);
        }
    }, [router]);

    const handleSetOwnerClaim = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'You must be logged in to perform this action.',
            });
            return;
        }

        startTransition(async () => {
            const result = await setUserClaims({ uid: user.uid, role: 'owner' });
            if (result.success) {
                toast({
                    title: 'Permissions Updated',
                    description: 'You have been granted owner privileges. Please sign out and sign back in to see the changes.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to Update Permissions',
                    description: result.message,
                });
            }
        });
    };

    const handleSignOut = async () => {
        if (!auth) return;
        await signOut(auth);
        localStorage.removeItem('role');
        router.replace('/login');
    }

    const renderHome = () => (
        <Card>
            <CardHeader className="flex-row items-center gap-4">
                <LayoutDashboard className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle className="text-2xl">Welcome, Owner!</CardTitle>
                    <CardDescription>
                        This is your central dashboard for managing ParkEasy.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                     <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="pb-4">
                           <div className="flex items-center gap-4">
                             <CalendarCheck className="h-8 w-8 text-green-500" />
                             <CardTitle className="text-xl">User Bookings</CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                View all reservations made by users.
                            </p>
                             <Link href="/owner?view=bookings">
                                <Button variant="outline" size="sm">View Bookings</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="pb-4">
                           <div className="flex items-center gap-4">
                             <FileText className="h-8 w-8 text-destructive" />
                             <CardTitle className="text-xl">Violation Reports</CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Review user-submitted parking violation reports.
                            </p>
                             <Link href="/owner?view=reports">
                                <Button variant="outline" size="sm">View Reports</Button>
                            </Link>
                        </CardContent>
                    </Card>
                     <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <MessageSquare className="h-8 w-8 text-blue-500" />
                                <CardTitle className="text-xl">User Feedback</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground mb-4">
                                Read valuable feedback to improve your service.
                            </p>
                             <Link href="/owner/feedback">
                                <Button variant="outline" size="sm">View Feedback</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="h-8 w-8 text-blue-500" />
                                <CardTitle className="text-xl">Set Permissions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground mb-4">
                                Grant yourself owner permissions to view all app data. You will need to sign out and back in.
                            </p>
                            <Button variant="default" size="sm" onClick={handleSetOwnerClaim} disabled={isTransitioning}>
                                {isTransitioning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Applying...</> : 'Apply Permissions'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4">
                                After applying, please <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleSignOut}>sign out and sign back in</Button> as owner.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );

    const renderReports = () => (
         <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Violation Reports</CardTitle>
                <CardDescription>
                    All violation reports submitted by users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReportsTable />
            </CardContent>
        </Card>
    );

     const renderBookings = () => (
        <BookingsTable />
    );
    
    const renderContent = () => {
        if (!isOwner) {
            return (
                 <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            );
        }
        
        switch (view) {
            case 'bookings':
                return renderBookings();
            case 'reports':
                return renderReports();
            case 'home':
            default:
                return renderHome();
        }
    }


    return (
        <div className="flex flex-1 flex-col bg-background p-4 md:p-6">
            <div className="w-full max-w-7xl mx-auto">
                {renderContent()}
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
