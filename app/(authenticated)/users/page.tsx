// app/(authenticated)/users/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Import modular components
import { UsersPageHeader } from "@/components/users/UsersPageHeader"
import { UserTable } from "@/components/users/UserTable"
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls"
import { PAGINATION_CONFIG, isServerPaginationEnabled } from "@/config/pagination"
import { toast } from "sonner"
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard"
import { UserFilters } from "@/components/users/UserFilters"
import { fetchAllUsers, fetchUsersByRole, deleteUser } from "@/features/auth/store/user-thunks"
import { User } from "@/types/user.types"

export default function UsersPage() {
    const dispatch = useAppDispatch()
    const { users, usersLoading, usersError, totalUsers } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string | "all">("all")
    const [statusFilter, setStatusFilter] = useState<string | "all">("all")
    const [activeTab, setActiveTab] = useState("students")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)

    // Configuration for pagination - now using server-side pagination
    const serverPaginated = isServerPaginationEnabled('USERS_SERVER_PAGINATION')


    // Fetch users based on active tab with server-side pagination
    useEffect(() => {
        if (activeTab === "all-users") {
            dispatch(fetchAllUsers({
                search: searchQuery,
                page: currentPage,
                limit: itemsPerPage
            }))
        } else {
            const role = activeTab === "admins" ? "admin" : activeTab === "facilitators" ? "teacher" : "student"
            dispatch(fetchUsersByRole({
                role,
                search: searchQuery,
                page: currentPage,
                limit: itemsPerPage
            }))
        }
    }, [dispatch, activeTab, searchQuery, currentPage, itemsPerPage])

    // Filter users based on status filter (client-side filtering)
    // Note: With server-side pagination, we apply this filter to the current page only
    const filteredUsers = useMemo(() => {
        if (statusFilter === "all") return users
        // Convert string status filter to boolean isActive
        const isActiveFilter = statusFilter === "active"
        // Use safe filter to prevent errors
        return Array.isArray(users)
            ? users.filter((user: User) => user.isActive === isActiveFilter)
            : []
    }, [users, statusFilter])

    // Calculate pagination info from server response
    const totalPages = Math.ceil((totalUsers || 0) / itemsPerPage)

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1) // Reset to first page when changing tabs
    }

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

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
        <AuthorizationGuard allowedRoles={["admin", 'super_admin']}>
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

                    {/* Pagination Controls */}
                    {!usersLoading && !usersError && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 w-full border border-border/25 bg-card/5 backdrop-blur-sm p-2 rounded-md">
                            <PaginationInfo
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalUsers || 0}
                                itemsPerPage={itemsPerPage}
                            />
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                className="w-full flex-1 justify-end"
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </Tabs>
            </div>
        </AuthorizationGuard>
    )
}
