// utils/auth-helpers.ts

import type { User } from "@/types/user.types";

export function hasAdminAccess(user?: User): boolean {
    if (!user) return false;
    return ["super_admin", "admin"].includes(user.role);
}

export function isCustomerCare(user?: User): boolean {
    if (!user) return false;
    return user.role === "customer_care";
}
