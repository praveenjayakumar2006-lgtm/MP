
'use client';

import { UsersTable } from '@/components/owner/users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import React from 'react';

export default function UsersPage() {
  return (
    <div className="flex-1 p-4 md:p-6">
       <div className="w-full max-w-7xl mx-auto">
        <Card>
            <CardHeader className="text-center">
                <div className="inline-flex items-center gap-2 justify-center">
                    <Users className="h-8 w-8 text-primary" />
                    <CardTitle className="text-3xl">Manage Users</CardTitle>
                </div>
                <CardDescription>
                    View and manage all registered users in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UsersTable />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
