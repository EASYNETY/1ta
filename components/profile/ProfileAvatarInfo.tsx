// components/profile/ProfileAvatarInfo.tsx
import { User as UserIcon } from "lucide-react";
import { User } from "@/types/user.types";
import clsx from "clsx";

interface ProfileAvatarInfoProps {
    user: User | null;
}

export function ProfileAvatarInfo({ user }: ProfileAvatarInfoProps) {
    if (!user) return null;

    /**
     * Label the user role based on account type and manager status.
     * - Corporate manager: "Corporate Manager"
     * - Corporate student: "Corporate Student"
     * - Regular student: "Student"
     * - Others: Capitalize native role
     */
    const getRoleLabel = () => {
        if (user.role === "student") {
            if (user.accountType === "corporate") {
                return user.isCorporateManager ? "Corporate Manager" : "Corporate Student";
            }
            return "Student";
        }
        return user.role.charAt(0).toUpperCase() + user.role.slice(1); // e.g., "admin" => "Admin"
    };

    /**
     * Style badge differently for corporate roles
     */
    const badgeStyle = clsx(
        "mt-1 px-3 py-1 rounded-full text-sm capitalize font-medium",
        {
            "bg-primary/10 text-primary": user.role !== "student",
            "bg-yellow-100 text-yellow-800": user.role === "student" && user.accountType === "corporate" && user.isCorporateManager,
            "bg-blue-100 text-blue-800": user.role === "student" && user.accountType === "corporate" && !user.isCorporateManager,
            "bg-green-100 text-green-800": user.role === "student" && user.accountType !== "corporate",
        }
    );

    return (
        <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                {/* TODO: Replace with actual avatar image when available */}
                <UserIcon className="h-12 w-12 text-primary" />
            </div>

            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>

            {/* Role Badge */}
            <div className={badgeStyle}>{getRoleLabel()}</div>
        </div>
    );
}
