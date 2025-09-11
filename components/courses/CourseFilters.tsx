// components/courses/CourseFilters.tsx
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Search, Filter, GraduationCap } from "lucide-react";

interface CourseFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string | "all";
    onCategoryChange: (value: string | "all") => void;
    levelFilter: string | "all";
    onLevelChange: (value: string | "all") => void;
    categories: string[];
}

export function CourseFilters({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    levelFilter,
    onLevelChange,
    categories,
}: CourseFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Category</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={onLevelChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Level</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
