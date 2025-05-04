// app/(authenticated)/users/page.tsx
"use client";

import { useState, useMemo } from "react";
// Remove useAppSelector if guard handles auth, fetch users via thunk later
// import { useAppSelector } from "@/store/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import TabsContent

// Import modular components
import { UsersPageHeader } from "@/components/users/UsersPageHeader";
import { UserTable } from "@/components/users/UserTable";
import { UserData } from "@/components/users/UserTableRow"; // Import shared type
import { toast } from "sonner"; // For delete feedback
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard";
import { UserFilters } from "@/components/users/UserFilters";

// --- Mock Data (Remove later when fetching from API/store) ---
const mockUsers: UserData[] = [ // Use UserData type
    { id: "user-1", name: "John Smith", email: "john.smith@example.com", role: "student", status: "active", joinDate: "2023-10-15" },
    { id: "user-2", name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "teacher", status: "active", joinDate: "2023-09-05" },
    { id: "user-3", name: "Michael Chen", email: "michael.chen@example.com", role: "teacher", status: "active", joinDate: "2023-08-20" },
    { id: "user-4", name: "Emily Williams", email: "emily.williams@example.com", role: "student", status: "inactive", joinDate: "2023-11-10" },
    { id: "user-5", name: "David Brown", email: "david.brown@example.com", role: "student", status: "active", joinDate: "2023-10-25" },
    { id: "user-6", name: "Jennifer Moore", email: "jennifer.moore@example.com", role: "admin", status: "active", joinDate: "2023-07-15" },
];
// --- End Mock Data ---

export default function UsersPage() {
    // TODO: Replace mockUsers with state fetched via Redux Thunk
    const [users, setUsers] = useState<UserData[]>(mockUsers); // Manage users in local state for now
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | "all">("all");
    const [statusFilter, setStatusFilter] = useState<string | "all">("all");
    const [activeTab, setActiveTab] = useState("all-users");

    // Filter users based on search query and filters
    const filteredUsers = useMemo(() => {
        return users.filter((user) => { // Filter the local 'users' state
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]); // Depend on local 'users' state

    // Filter users based on active tab
    const getTabUsers = useMemo(() => {
        switch (activeTab) {
            case "students":
                return filteredUsers.filter((user) => user.role === "student");
            case "teachers":
                return filteredUsers.filter((user) => user.role === "teacher");
            case "admins":
                return filteredUsers.filter((user) => user.role === "admin");
            default: // "all-users"
                return filteredUsers;
        }
    }, [activeTab, filteredUsers]);


    const handleDeleteUser = async (userId: string, userName: string) => { // Mark as async
        // NOTE: No confirmation needed here anymore, the dialog handles it.
        try {
            // TODO: Replace with actual API call / Redux dispatch for DELETE user
            console.log(`PERFORMING DELETE for user ${userId}`);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            // const result = await dispatch(deleteUser(userId)).unwrap(); // Example Redux

            // Update local state (or rely on Redux store update)
            setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
            toast.success(`User "${userName}" deleted successfully.`);
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            toast.error(`Failed to delete user: ${error?.message || 'Unknown error'}`);
            // Handle error appropriately
        }
    };

    return (
        // Wrap with Authorization Guard
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="space-y-6 p-4 md:p-6"> {/* Add padding */}
                <UsersPageHeader />

                <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-4"> {/* Improved TabsList layout */}
                        <TabsTrigger value="all-users">All Users</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="teachers">Teachers</TabsTrigger>
                        <TabsTrigger value="admins">Administrators</TabsTrigger>
                    </TabsList>

                    <UserFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        roleFilter={roleFilter}
                        onRoleChange={setRoleFilter}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    {/* Render table within TabsContent if needed, or directly if filters apply to all tabs */}
                    {/* Assuming filters apply globally and tabs just filter the result */}
                    <UserTable users={getTabUsers} onDeleteUser={handleDeleteUser} />

                </Tabs>
            </div>
        </AuthorizationGuard>
    );
}