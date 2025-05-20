// components/profile/ProfileAvatarInfo.tsx
import { User as UserIcon } from "lucide-react";
import { User } from "@/types/user.types";
import clsx from "clsx";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarInfoProps {
    user: User | null;
    /** Callback when the avatar URL changes */
    onAvatarChange?: (url: string | null) => void;
}

export function ProfileAvatarInfo({ user, onAvatarChange }: ProfileAvatarInfoProps) {
    if (!user) return null;

    const { toast } = useToast();

    /**
     * Label the user role based on account type and manager status.
     * - Corporate manager: "Corporate Manager"
     * - Corporate student: "Corporate Student"
     * - Regular student: "Student"
     * - Others: Capitalize native role
     */
    const getRoleLabel = () => {
        // Check if the user is a student and adjust based on account type and corporate manager status
        if (user.role === "student") {
            if (user.accountType === "corporate") {
                return user.isCorporateManager ? "Corporate Manager" : "Corporate Student";
            }
            return "Student";
        }

        // For other roles like admin or teacher
        return user.role.charAt(0).toUpperCase() + user.role.slice(1); // Capitalizes "admin" => "Admin"
    };

    // Badge styling logic
    const badgeStyle = clsx(
        "mt-1 px-3 py-1 rounded-full text-sm capitalize font-medium",
        {
            "bg-primary/10 text-primary": user.role !== "student", // Default non-student styling
            "bg-yellow-100 text-yellow-800": user.role === "student" && user.accountType === "corporate" && user.isCorporateManager,
            "bg-blue-100 text-blue-800": user.role === "student" && user.accountType === "corporate" && !user.isCorporateManager,
            "bg-green-100 text-green-800": user.role === "student" && user.accountType !== "corporate",
        }
    );

    // Handle avatar URL change - simply pass it up to the parent component
    const handleAvatarChange = (url: string | null) => {
        // Call the parent callback if provided
        if (onAvatarChange) {
            onAvatarChange(url);
        }
    };

    return (
        <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
                <AvatarUpload
                    initialUrl={user.avatarUrl || null}
                    name={user.name || "User"}
                    size="xl"
                    onUrlChange={handleAvatarChange}
                    uploadOptions={{
                        folder: "avatars",
                        onUploadError: (error) => {
                            toast({
                                title: "Upload Failed",
                                description: error.message || "There was a problem uploading your image. Please try again.",
                                variant: "destructive",
                            });
                        },
                    }}
                />
            </div>

            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>

            {/* Role Badge */}
            <div className={badgeStyle}>{getRoleLabel()}</div>
        </div>
    );
}
