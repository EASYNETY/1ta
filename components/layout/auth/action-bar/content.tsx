"use client";

import { usePathname } from "next/navigation";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { motion } from "framer-motion";

interface ContentProps {
    isCollapsed: boolean;
}

export function Content({ isCollapsed }: ContentProps) {
    const pathname = usePathname();

    if (isCollapsed) return null; // no need to show full content in collapsed

    const pageContent = getContentForPath(pathname);

    if (!pageContent) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {pageContent.map((item, idx) => (
                <DyraneCard key={idx} className="p-4 text-sm text-muted-foreground">
                    {item}
                </DyraneCard>
            ))}
        </motion.div>
    );
}

function getContentForPath(path: string) {
    if (path.startsWith("/courses")) {
        return [
            "You have 3 active courses.",
            "2 new enrollments today."
        ];
    }
    if (path.startsWith("/students")) {
        return [
            "Total Students: 140",
            "Pending approvals: 4"
        ];
    }
    if (path.startsWith("/cart")) {
        return [
            "3 items ready for checkout.",
            "Total: $210.00"
        ];
    }
    if (path.startsWith("/assignments")) {
        return [
            "5 assignments due this week."
        ];
    }
    return null;
}
