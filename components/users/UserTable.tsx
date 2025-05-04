// components/users/UserTable.tsx
import { UserTableRow, UserData } from './UserTableRow'; // Import UserData type

interface UserTableProps {
    users: UserData[];
    onDeleteUser: (userId: string, userName: string) => void;
}

export function UserTable({ users, onDeleteUser }: UserTableProps) {
    return (
        <div className="overflow-x-auto relative w-full border rounded-md bg-background/5 backdrop-blur-sm">
            {/* Consider table-fixed if columns widths are set */}
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b bg-muted text-sm">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Join Date</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <UserTableRow key={user.id} user={user} onDelete={onDeleteUser} />
                        ))
                    ) : (
                        <tr>
                            {/* Adjust colspan based on the final number of columns */}
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                No users found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}