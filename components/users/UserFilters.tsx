// components/users/UserFilters.tsx
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface UserFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    roleFilter: string | "all";
    onRoleChange: (value: string | "all") => void;
    statusFilter: string | "all";
    onStatusChange: (value: string | "all") => void;
}

export function UserFilters({
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleChange,
    statusFilter,
    onStatusChange,
}: UserFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users by name or email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={onRoleChange}>
                    <SelectTrigger className="w-full md:w-[150px]">
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

                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-[150px]">
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
    );
}