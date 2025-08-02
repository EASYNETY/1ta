// utils/auth-helpers.ts

import type { User } from "@/types/user.types";

// export function hasAdminAccess(user?: User): boolean {
//     if (!user) return false;
//     return ["super_admin", "admin", "customer_care"].includes(user.role);
// }

export const hasAdminAccess = (user: User | null | undefined): boolean => {
  return user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'customer_care';
};

export function isCustomerCare(user?: User): boolean {
    if (!user) return false;
    return user.role === "customer_care";
}
