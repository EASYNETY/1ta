// components/users/UsersPageHeader.tsx
import Link from 'next/link';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Use your button
import { Plus } from 'lucide-react';

export function UsersPageHeader() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">Users Management</h1>
            <DyraneButton asChild>
                <Link href="/users/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Link>
            </DyraneButton>
        </div>
    );
}