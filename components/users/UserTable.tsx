import { type UserData, UserTableRow } from "./UserTableRow"
import { Skeleton } from "@/components/ui/skeleton"

interface UserTableProps {
    users: UserData[]
    onDeleteUser: (userId: string, userName: string) => Promise<void>
    isLoading?: boolean
    error?: string | null
}

export function UserTable({ users, onDeleteUser, isLoading = false, error = null }: UserTableProps) {
    return (
        <div className="rounded-md border">
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Join Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            // Loading state
                            Array(5)
                                .fill(0)
                                .map((_, index) => (
                                    <tr key={`skeleton-${index}`} className="border-b">
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-10 w-full" />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-6 w-full" />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-6 w-20" />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-6 w-20" />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-6 w-24" />
                                        </td>
                                        <td className="py-3 px-4">
                                            <Skeleton className="h-6 w-16 ml-auto" />
                                        </td>
                                    </tr>
                                ))
                        ) : error ? (
                            // Error state
                            <tr>
                                <td colSpan={6} className="py-4 px-4 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : users?.length === 0 ? (
                            // Empty state
                            <tr>
                                <td colSpan={6} className="py-4 px-4 text-center text-muted-foreground">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            // Data state
                            users?.map((user) => <UserTableRow key={user.id} user={user} onDelete={onDeleteUser} />)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
