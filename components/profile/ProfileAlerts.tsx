// components/profile/ProfileAlerts.tsx
import { AlertCircle, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileAlertsProps {
    isOnboarding: boolean;
    hasItemsInCart: boolean;
    cartItemCount: number;
}

export function ProfileAlerts({ isOnboarding, hasItemsInCart, cartItemCount }: ProfileAlertsProps) {
    return (
        <>
            {isOnboarding && (
                <Alert className="mb-6 bg-secondary/30 border-secondary/40">
                    <AlertCircle className="h-4 w-4 !text-secondary-foreground" />
                    <AlertTitle className="text-secondary-foreground">Profile Completion Required</AlertTitle>
                    <AlertDescription className="text-secondary-foreground/90">
                        Please complete your profile to access all features.
                    </AlertDescription>
                </Alert>
            )}
            {hasItemsInCart && (
                <Alert className="mb-6 bg-primary/10 border-primary/20">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <AlertTitle>Course(s) in Cart</AlertTitle>
                    <AlertDescription>
                        You have {cartItemCount} course{cartItemCount > 1 ? "s" : ""} selected.{" "}
                        <Link
                            href="/checkout" // Or "/cart" depending on your flow
                            className="font-medium text-primary underline underline-offset-4 hover:opacity-90"
                        >
                            Proceed to checkout
                        </Link>{" "}
                        to enroll.
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}