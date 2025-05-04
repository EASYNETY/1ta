// components/profile/ProfileAvatarInfo.tsx
import { User as UserIcon } from "lucide-react";
import { User as UserType } from "@/types/user.types"; // Import your actual User type

interface ProfileAvatarInfoProps {
    user: UserType | null; // Accept User type
}

export function ProfileAvatarInfo({ user }: ProfileAvatarInfoProps) {
    if (!user) return null; // Or a loading state

    return (
        <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                {/* TODO: Replace with actual user avatar if available */}
                <UserIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                {user.role}
            </div>
        </div>
    );
}