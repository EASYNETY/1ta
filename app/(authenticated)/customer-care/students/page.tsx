// app/(authenticated)/customer-care/students/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { PageHeader } from "@/components/layout/auth/page-header" // Re-added PageHeader
import { UserTable } from "@/components/users/UserTable" // Reusable
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls"
import { PAGINATION_CONFIG, isServerPaginationEnabled } from "@/config/pagination"
// import { toast } from "sonner" // Not used directly for delete here
import { CustomerCareGuard } from "@/components/auth/PermissionGuard" // Use correct guard
import { UserFilters } from "@/components/users/UserFilters" // Reusable
import { fetchUsersByRole } from "@/features/auth/store/user-thunks" // Use specific thunk
import type { StudentUser, User } from "@/types/user.types" // Import User type
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { UserData } from "@/components/users/UserTableRow"

export default function CustomerCareStudentsPage() {
    const dispatch = useAppDispatch()
    const { users, usersLoading, usersError, totalUsers } = useAppSelector((state) => state.auth)
    const loggedInUser = useAppSelector((state) => state.auth.user);


    const [searchQuery, setSearchQuery] = useState("")
    // const [roleFilter, setRoleFilter] = useState<string | "all">("student") // Fixed to student
    const [statusFilter, setStatusFilter] = useState<string | "all">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)

    const serverPaginated = isServerPaginationEnabled('USERS_SERVER_PAGINATION'); // Can use a different config key

    useEffect(() => {
        if (loggedInUser && ["admin", "super_admin", "customer_care"].includes(loggedInUser.role)) {
            dispatch(fetchUsersByRole({
                role: "student", // Always fetch students
                search: searchQuery,
                page: currentPage,
                limit: itemsPerPage,
                // You can add more specific filters if needed for customer care view
            }));
        }
    }, [dispatch, searchQuery, currentPage, itemsPerPage, loggedInUser]);

    // Client-side status filter (if server doesn't support it for this specific role view)
    const filteredStudents = useMemo(() => {
        if (!users) return [];
        let studentsToFilter = users.filter(user => user.role === 'student'); // Ensure we only deal with students

        if (statusFilter === "all") return studentsToFilter;
        const isActiveFilter = statusFilter === "active";
        return studentsToFilter.filter((user: User) => user.isActive === isActiveFilter);
    }, [users, statusFilter]);

    // Total students for pagination (if server doesn't give total for just students)
    // If server gives totalUsers for the 'student' role query, use that directly.
    // Otherwise, we might need a different approach or accept totalUsers as an estimate.
    const totalStudentsForPagination = serverPaginated ? (totalUsers || 0) : filteredStudents.length;
    const totalPages = Math.ceil(totalStudentsForPagination / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search query changes
    }, [searchQuery]);

    const handleDeleteUser = async () => {
        console.log('for admin only')
        return
    }


    return (
        <CustomerCareGuard>
            <div className="space-y-6 p-4 md:p-6">
                <PageHeader
                    heading="Student Directory"
                    subheading="View and search student information."
                />

                <UserFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    roleFilter={"student"} // Role filter is fixed to 'student'
                    onRoleChange={() => { }} // No role change needed for this view
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                />

                {usersLoading && filteredStudents.length === 0 && (
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-12 w-full" />
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                )}

                {!usersLoading && usersError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Students</AlertTitle>
                        <AlertDescription>{usersError}</AlertDescription>
                    </Alert>
                )}

                {!usersLoading && !usersError && (
                    <UserTable
                        users={filteredStudents as UserData[]} // Pass only students
                        // For customer care, onDeleteUser might not be applicable or should have different permissions
                        onDeleteUser={handleDeleteUser}
                        isLoading={false} // Loading is handled above
                        error={null}      // Error is handled above
                    />
                )}

                {!usersLoading && !usersError && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 w-full border border-border/25 bg-card/5 backdrop-blur-sm p-2 rounded-md">
                        <PaginationInfo
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalStudentsForPagination}
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
            </div>
        </CustomerCareGuard>
    );
}