// components/users/UserTableRow.tsx
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Use Shadcn Button
import { BarcodeDialog } from "@/components/tools/BarcodeDialog";
import { User, Mail, Calendar, MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import { AdminGuard, DeleteGuard } from "@/components/auth/PermissionGuard";
import { UserRole } from "@/types/user.types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from '../ui/confirmation-dialog';

// Define a User type based on your mock data (or import from a central types file)
// Ideally, this comes from your User slice/types definition later
export interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    barcodeId?: string; // Optional, only if applicable
    referralCode?: string | null; // Optional referral code, can be null
    createdAt: string;
    // Add other fields if needed by the row
}

interface UserTableRowProps {
    user: UserData;
    onDelete: (userId: string, userName: string) => Promise<void> | void;
}

// Helper to format date (could be moved to a utils file)
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        return "Invalid Date";
    }
};

export function UserTableRow({ user, onDelete }: UserTableRowProps) {
    const router = useRouter();

    // Prepare the description for the confirmation dialog
    const deleteDescription = (
        <>
            This action cannot be undone. This will permanently delete the user{' '}
            <strong>{user.name}</strong> and all associated data.
        </>
    );
    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "admin":
            case "super_admin":
                return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700 dark:hover:bg-purple-800";
            case "teacher":
                return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 dark:hover:bg-blue-800";
            case "student":
                return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:border-green-700 dark:hover:bg-green-800";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800";
        }
    };

    // Convert boolean isActive to a status string for display
    const getStatusString = (isActive: boolean): string => {
        return isActive ? 'active' : 'inactive';
    };

    const getStatusBadgeClass = (isActive: boolean) => {
        const status = getStatusString(isActive);
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:border-green-700 dark:hover:bg-green-800";
            case "inactive":
                return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100 dark:bg-red-900 dark:text-red-100 dark:border-red-700 dark:hover:bg-red-800";
            default:
                return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-800";
        }
    };


    return (
        <tr className="border-b hover:bg-muted/50">
            {/* User Cell */}
            <td className="py-3 px-4 align-top">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {/* Placeholder Avatar - Replace with actual image if available */}
                        <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">ID: {user.id}</div>
                    </div>
                </div>
            </td>
            {/* Email Cell */}
            <td className="py-3 px-4 align-top text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                </div>
            </td>
            {/* Role Cell */}
            <td className="py-3 px-4 align-top">
                <Badge variant="outline" className={`whitespace-nowrap ${getRoleBadgeClass(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
            </td>
            {/* Status Cell - Updated to use isActive */}
            <td className="py-3 px-4 align-top">
                <Badge variant="outline" className={`whitespace-nowrap ${getStatusBadgeClass(user.isActive)}`}>
                    {getStatusString(user.isActive).charAt(0).toUpperCase() + getStatusString(user.isActive).slice(1)}
                </Badge>
            </td>
            {/* Referral Code Cell */}

            
            <td className="py-3 px-4 align-top text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    {user.referralCode && user.referralCode.trim() !== '' ? (
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {user.referralCode}
                        </span>
                    ) : (
                        <span className="text-muted-foreground italic">No referral</span>
                    )}
                </div>
            </td>
            {/* Join Date Cell */}
            <td className="py-3 px-4 align-top text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDate(user.createdAt)}</span>
                </div>
            </td>
            {/* Actions Cell */}
            <td className="py-3 px-4 align-top text-right">
                <div className="flex items-center justify-end gap-1">
                    {/* Barcode Dialog (conditionally render for students?) */}
                    {user.role === 'student' && user.barcodeId && <BarcodeDialog barcodeId={user.barcodeId} userId={user.id} triggerLabel="Barcode" />}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                            </DropdownMenuItem>
                            <AdminGuard>
                                <DropdownMenuItem onClick={() => router.push(`/users/${user.id}/edit`)} className="cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit User</span>
                                </DropdownMenuItem>
                            </AdminGuard>
                            <DropdownMenuSeparator />
                            {/* --- Integrate ConfirmationDialog for Delete --- */}
                            <DeleteGuard>
                                <ConfirmationDialog
                                    title="Delete User?"
                                    description={deleteDescription}
                                    confirmText="Delete"
                                    variant="destructive"
                                    onConfirm={() => onDelete(user.id, user.name)}
                                    trigger={
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete User</span>
                                        </DropdownMenuItem>
                                    }
                                />
                            </DeleteGuard>
                            {/* --- End Integration --- */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </td>
        </tr>
    );
}