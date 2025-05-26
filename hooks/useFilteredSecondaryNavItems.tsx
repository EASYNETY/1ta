import { NavItem } from '@/components/layout/auth/app-sidebar';
import { isStudent, User as UserType } from '@/types/user.types';
import { BarChart3, CircleHelp, Settings } from 'lucide-react';
import { Lifebuoy, ShoppingCart, User } from 'phosphor-react';
import { useMemo } from 'react';

export const useFilteredSecondaryNavItems = (user: UserType | null): NavItem[] => {
    const isCorporateStudent = user && isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager;

    return useMemo(() => {
        // Default secondary nav items
        const defaultSecondaryNavItems: NavItem[] = [
            { title: "Profile", href: "/profile", icon: User, roles: ["super_admin", "admin", "accounting", "customer_care", "teacher", "student"] },
            { title: "Settings", href: "/settings", icon: Settings, roles: ["super_admin", "admin", "accounting", "customer_care", "teacher", "student"] },
            { title: "Help", href: "/help", icon: CircleHelp, roles: ["super_admin", "admin", "accounting", "customer_care", "teacher", "student"] },
            { title: "Support", href: "/support", icon: Lifebuoy, roles: ["super_admin", "admin", "accounting", "customer_care", "teacher", "student"] },
        ];

        // Add student-specific items, unless it's a corporate student
        const studentNavItems: NavItem[] = isCorporateStudent ? [] : [
            { title: "Checkout", href: "/checkout", icon: ShoppingCart, roles: ["student"] },
            { title: "Payment History", href: "/payments", icon: BarChart3, roles: ["student"] },
        ];

        // Combine and return the final nav items
        return [...defaultSecondaryNavItems, ...studentNavItems];
    }, [user]);
};
