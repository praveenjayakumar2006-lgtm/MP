
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { deleteUser, getUsers } from '@/app/actions/users';


export function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load user data.',
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, [toast]);
    
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        const result = await deleteUser(userToDelete.id);
        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            toast({
                title: 'User Deleted',
                description: `${userToDelete.username}'s account has been deleted.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the user. Please try again.',
            });
        }
        setUserToDelete(null);
    };

    const sortedUsers = useMemo(() => 
        [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]);

    const renderSkeletons = () => (
        Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skel-${i}`}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-9 w-20" /></TableCell>
            </TableRow>
        ))
    );

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                renderSkeletons()
                             ) : sortedUsers.length > 0 ? (
                                sortedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteClick(user)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground p-8">
                                        No registered users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to permanently delete the account for{' '}
                    <span className="font-bold text-foreground">{userToDelete?.username}</span>? 
                    This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDelete}
                        asChild
                    >
                    <Button variant="destructive">Delete Account</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
