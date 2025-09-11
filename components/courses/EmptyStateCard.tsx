// components/courses/EmptyStateCard.tsx
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateCardProps {
    Icon: LucideIcon;
    title: string;
    message: string;
    action?: ReactNode; // Can pass a button or link here
}

export function EmptyStateCard({ Icon, title, message, action }: EmptyStateCardProps) {
    return (
        <DyraneCard>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">{title}</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    {message}
                </p>
                {action}
            </CardContent>
        </DyraneCard>
    );
}
