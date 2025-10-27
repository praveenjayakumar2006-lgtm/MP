'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OwnerPage() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'owner') {
            router.replace('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('role');
        router.replace('/login');
    };

    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Owner Dashboard</CardTitle>
                    <CardDescription>Welcome, Owner.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-muted-foreground mb-6">This is the owner's private dashboard.</p>
                    <Button onClick={handleLogout}>Log Out</Button>
                </CardContent>
            </Card>
        </div>
    );
}
