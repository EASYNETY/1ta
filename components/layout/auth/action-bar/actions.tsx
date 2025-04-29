"use client";

import { usePathname } from "next/navigation";
import { PlusCircle, GraduationCap, Student, BookOpen } from "phosphor-react";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ActionsProps {
    isCollapsed: boolean;
}

export function Actions({ isCollapsed }: ActionsProps) {
    const pathname = usePathname();

    const action = getActionForPath(pathname);

    if (!action) return null;

    const button = (
        <DyraneButton
            variant="default"
            size="sm"
            className="w-full"
            asChild
        >
            <a href={action.href}>
                {action.icon}
                {!isCollapsed && <span className="ml-2">{action.label}</span>}
            </a>
        </DyraneButton>
    );

    return isCollapsed ? (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
                {action.label}
            </TooltipContent>
        </Tooltip>
    ) : (
        button
    );
}

function getActionForPath(path: string) {
    if (path.startsWith("/courses")) {
        return {
            label: "Create Course",
            href: "/courses/create",
            icon: <BookOpen size={20} weight="bold" />
        };
    }
    if (path.startsWith("/students")) {
        return {
            label: "Add Student",
            href: "/students/create",
            icon: <Student size={20} weight="bold" />
        };
    }
    if (path.startsWith("/cart")) {
        return {
            label: "Checkout",
            href: "/cart/checkout",
            icon: <GraduationCap size={20} weight="bold" />
        };
    }
    if (path.startsWith("/assignments")) {
        return {
            label: "Create Assignment",
            href: "/assignments/create",
            icon: <PlusCircle size={20} weight="bold" />
        };
    }
    return null;
}
