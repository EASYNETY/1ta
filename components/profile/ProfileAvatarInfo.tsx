// components/profile/ProfileAvatarInfo.tsx
import { User as UserIcon } from "lucide-react";
import { User } from "@/types/user.types";
import clsx from "clsx";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { updateUserProfileThunk } from "@/features/auth/store/auth-thunks";
import { useToast } from "@/hooks/use-toast";

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

    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Handle avatar URL change
    const handleAvatarChange = async (url: string | null) => {
        if (!user) return;

        try {
            // Update the user profile with the new avatar URL
            await dispatch(updateUserProfileThunk({
                avatarUrl: url
            })).unwrap();

            toast({
                title: "Profile Updated",
                description: "Your profile picture has been updated successfully.",
                variant: "success",
            });
        } catch (error) {
            console.error("Failed to update avatar:", error);
            toast({
                title: "Update Failed",
                description: "There was a problem updating your profile picture. Please try again.",
                variant: "destructive",
            });
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
