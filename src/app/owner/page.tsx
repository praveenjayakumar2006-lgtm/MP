
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsTable } from "@/components/owner/reports-table";
import { FeedbackTable } from "@/components/owner/feedback-table";

export default function OwnerPage() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'owner') {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-background p-4 md:p-6">
            <div className="w-full max-w-6xl">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Owner Dashboard</CardTitle>
                        <CardDescription>Review user-submitted reports and feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="reports" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="reports">Violation Reports</TabsTrigger>
                                <TabsTrigger value="feedback">User Feedback</TabsTrigger>
                            </TabsList>
                            <TabsContent value="reports">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Violation Reports</CardTitle>
                                        <CardDescription>
                                            All violation reports submitted by users.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ReportsTable />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="feedback">
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>User Feedback</CardTitle>
                                        <CardDescription>
                                            All feedback submitted by users.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FeedbackTable />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
