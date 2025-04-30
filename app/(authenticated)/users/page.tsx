// app/(authenticated)/users/page.tsx

"use client"

import { useState } from "react"
import { useAppSelector } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarcodeDialog } from "@/components/tools/BarcodeDialog"
import { Search, Plus, Filter, MoreHorizontal, User, Mail, Calendar } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock users data
const mockUsers = [
    {
        id: "user-1",
        name: "John Smith",
        email: "john.smith@example.com",
        role: "student",
        status: "active",
        joinDate: "2023-10-15",
        lastActive: "2023-12-20",
        enrolledCourses: 3,
        phoneNumber: "+234 123 456 7890",
    },
    {
        id: "user-2",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        role: "teacher",
        status: "active",
        joinDate: "2023-09-05",
        lastActive: "2023-12-21",
        courses: 2,
        students: 45,
        phoneNumber: "+234 123 456 7891",
    },
    {
        id: "user-3",
        name: "Michael Chen",
        email: "michael.chen@example.com",
        role: "teacher",
        status: "active",
        joinDate: "2023-08-20",
        lastActive: "2023-12-19",
        courses: 1,
        students: 32,
        phoneNumber: "+234 123 456 7892",
    },
    {
        id: "user-4",
        name: "Emily Williams",
        email: "emily.williams@example.com",
        role: "student",
        status: "inactive",
        joinDate: "2023-11-10",
        lastActive: "2023-12-01",
        enrolledCourses: 1,
        phoneNumber: "+234 123 456 7893",
    },
    {
        id: "user-5",
        name: "David Brown",
        email: "david.brown@example.com",
        role: "student",
        status: "active",
        joinDate: "2023-10-25",
        lastActive: "2023-12-18",
        enrolledCourses: 2,
        phoneNumber: "+234 123 456 7894",
    },
    {
        id: "user-6",
        name: "Jennifer Moore",
        email: "jennifer.moore@example.com",
        role: "admin",
        status: "active",
        joinDate: "2023-07-15",
        lastActive: "2023-12-21",
        phoneNumber: "+234 123 456 7895",
    },
]

export default function UsersPage() {
    const { user } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string | "all">("all")
    const [statusFilter, setStatusFilter] = useState<string | "all">("all")
    const [activeTab, setActiveTab] = useState("all-users")

    if (!user || user.role !== "admin") {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Access Denied</h2>
                    <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    // Filter users based on search query and filters
    const filteredUsers = mockUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter

        return matchesSearch && matchesRole && matchesStatus
    })

    // Filter users based on active tab
    const getTabUsers = () => {
        switch (activeTab) {
            case "students":
                return filteredUsers.filter((user) => user.role === "student")
            case "teachers":
                return filteredUsers.filter((user) => user.role === "teacher")
            case "admins":
                return filteredUsers.filter((user) => user.role === "admin")
            default:
                return filteredUsers
        }
    }

    const tabUsers = getTabUsers()

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Users Management</h1>
                <DyraneButton asChild>
                    <Link href="/users/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Link>
                </DyraneButton>
            </div>

            <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 overflow-x-auto">
                    <TabsTrigger value="all-users">All Users</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="admins">Administrators</TabsTrigger>
                </TabsList>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <span>Role</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <span>Status</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DyraneCard>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">User</th>
                                        <th className="text-left py-3 px-4">Email</th>
                                        <th className="text-left py-3 px-4">Role</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Join Date</th>
                                        <th className="text-left py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tabUsers.length > 0 ? (
                                        tabUsers.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            user.role === "admin"
                                                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                                                : user.role === "teacher"
                                                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                                                    : "bg-green-100 text-green-800 border-green-300"
                                                        }
                                                    >
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            user.status === "active"
                                                                ? "bg-green-100 text-green-800 border-green-300"
                                                                : "bg-red-100 text-red-800 border-red-300"
                                                        }
                                                    >
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatDate(user.joinDate)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <BarcodeDialog userId={user.id} triggerLabel="View Barcode" />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <DyraneButton variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </DyraneButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                                                                    View Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(`/users/${user.id}/edit`)}>
                                                                    Edit User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => {
                                                                        // Handle delete user
                                                                        alert(`Delete user: ${user.name}`)
                                                                    }}
                                                                >
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No users found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </DyraneCard>
            </Tabs>
        </div>
    )
}
