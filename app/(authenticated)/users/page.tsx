// app/(authenticated)/users/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, UserPlus, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "teacher" | "student"
    status: "active" | "inactive"
    joinedDate: string
}

export default function UsersPage() {
    const router = useRouter()
    const { user } = useAppSelector((state) => state.auth)
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== "admin") {
            router.push("/dashboard")
        }
    }, [user, router])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true)
                // In a real implementation, this would be an API call
                // const data = await get("/users")

                // Mock data for demonstration
                const mockUsers: User[] = [
                    {
                        id: "1",
                        name: "John Doe",
                        email: "john.doe@example.com",
                        role: "admin",
                        status: "active",
                        joinedDate: "2023-01-15",
                    },
                    {
                        id: "2",
                        name: "Jane Smith",
                        email: "jane.smith@example.com",
                        role: "teacher",
                        status: "active",
                        joinedDate: "2023-02-20",
                    },
                    {
                        id: "3",
                        name: "Robert Johnson",
                        email: "robert.johnson@example.com",
                        role: "teacher",
                        status: "active",
                        joinedDate: "2023-03-10",
                    },
                    {
                        id: "4",
                        name: "Emily Davis",
                        email: "emily.davis@example.com",
                        role: "student",
                        status: "active",
                        joinedDate: "2023-04-05",
                    },
                    {
                        id: "5",
                        name: "Michael Wilson",
                        email: "michael.wilson@example.com",
                        role: "student",
                        status: "inactive",
                        joinedDate: "2023-05-12",
                    },
                    {
                        id: "6",
                        name: "Sarah Brown",
                        email: "sarah.brown@example.com",
                        role: "student",
                        status: "active",
                        joinedDate: "2023-06-18",
                    },
                ]

                setUsers(mockUsers)
            } catch (error) {
                console.error("Failed to fetch users:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user?.role === "admin") {
            fetchUsers()
        }
    }, [user])

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (user?.role !== "admin") {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">User Management</h1>

                <DyraneButton>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </DyraneButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <DyraneButton variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </DyraneButton>
            </div>

            <DyraneCard>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">Loading users...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                        : user.role === "teacher"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                }
                                            >
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.status === "active"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                }
                                            >
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <DyraneButton variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </DyraneButton>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit user</DropdownMenuItem>
                                                    <DropdownMenuItem>Change role</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        {user.status === "active" ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </DyraneCard>
        </div>
    )
}
