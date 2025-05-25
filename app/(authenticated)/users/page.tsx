// app/(authenticated)/users/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Import modular components
import { UsersPageHeader } from "@/components/users/UsersPageHeader"
import { UserTable } from "@/components/users/UserTable"
import { toast } from "sonner"
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard"
import { UserFilters } from "@/components/users/UserFilters"
import { fetchAllUsers, fetchUsersByRole, deleteUser } from "@/features/auth/store/user-thunks"
import { User } from "@/types/user.types"

export default function UsersPage() {
    const dispatch = useAppDispatch()
    const { users, usersLoading, usersError } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string | "all">("all")
    const [statusFilter, setStatusFilter] = useState<string | "all">("all")
    const [activeTab, setActiveTab] = useState("students")

    // Fetch users based on active tab
    useEffect(() => {
        if (activeTab === "all-users") {
            dispatch(fetchAllUsers({ search: searchQuery }))
        } else {
            const role = activeTab === "admins" ? "admin" : activeTab === "facilitators" ? "teacher" : "student"
            dispatch(fetchUsersByRole({ role, search: searchQuery }))
        }
    }, [dispatch, activeTab, searchQuery])

    // Filter users based on status filter (client-side filtering)
    const filteredUsers = useMemo(() => {
        if (statusFilter === "all") return users
        // Convert string status filter to boolean isActive
        const isActiveFilter = statusFilter === "active"
        // Use safe filter to prevent errors
        return Array.isArray(users)
            ? users.filter((user: User) => user.isActive === isActiveFilter)
            : []
    }, [users, statusFilter])

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    // Handle delete user
    const handleDeleteUser = async (userId: string, userName: string) => {
        try {
            const result = await dispatch(deleteUser(userId)).unwrap()
            if (result.success) {
                toast.success(`User "${userName}" deleted successfully.`)
            }
        } catch (error: any) {
            console.error("Failed to delete user:", error)
            toast.error(`Failed to delete user: ${error?.message || "Unknown error"}`)
        }
    }

    return (
        <AuthorizationGuard allowedRoles={["admin"]}>
            <div className="space-y-6">
                <UsersPageHeader />

                <Tabs defaultValue="students" value={activeTab} onValueChange={handleTabChange}>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-4">
                            <TabsTrigger value="all-users">All Users</TabsTrigger>
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="facilitators">Facilitators</TabsTrigger>
                            <TabsTrigger value="admins">Administrators</TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    <UserFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        roleFilter={roleFilter}
                        onRoleChange={setRoleFilter}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    <UserTable
                        users={filteredUsers as any}
                        onDeleteUser={handleDeleteUser}
                        isLoading={usersLoading}
                        error={usersError}
                    />
                </Tabs>
            </div>
        </AuthorizationGuard>
    )
}
