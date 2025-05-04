// components/profile/ProfileAlerts.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, ShoppingCart } from "lucide-react"

interface ProfileAlertsProps {
    isOnboarding: boolean
    hasItemsInCart: boolean
    cartItemCount: number
    isCorporateStudent?: boolean
    isCorporateManager?: boolean
}

export function ProfileAlerts({
    isOnboarding,
    hasItemsInCart,
    cartItemCount,
    isCorporateStudent = false,
    isCorporateManager = false,
}: ProfileAlertsProps) {
    return (
        <>
            {/* Onboarding Alert */}
            {isOnboarding && !isCorporateStudent && (
                <Alert variant="default" className="bg-primary/10 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle>Complete Your Profile</AlertTitle>
                    <AlertDescription>
                        {isCorporateManager
                            ? "Please provide your organization details to set up corporate student accounts."
                            : "Please complete your profile information to continue to the dashboard."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Corporate Student Alert */}
            {isCorporateStudent && (
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Corporate Student Account</AlertTitle>
                    <AlertDescription>
                        Your account was created by your organization administrator. Some fields are pre-assigned and cannot be
                        changed.
                    </AlertDescription>
                </Alert>
            )}

            {/* Cart Items Alert */}
            {hasItemsInCart && (
                <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Items in Cart</AlertTitle>
                    <AlertDescription>
                        You have {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart.
                        {isOnboarding
                            ? " Complete your profile to proceed to checkout."
                            : " You can proceed to checkout after saving your profile changes."}
                    </AlertDescription>
                </Alert>
            )}
        </>
    )
}
