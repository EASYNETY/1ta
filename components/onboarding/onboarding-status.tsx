// components/onboarding/onboarding-status.tsx

"use client"

import Link from "next/link"
import { AlertCircle, GraduationCap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { skipOnboardingProcess } from "@/features/auth/store/auth-slice"
import { useToast } from "@/hooks/use-toast"

export function OnboardingStatusCard() {
    const cart = useAppSelector((state) => state.cart)
    const { user } = useAppSelector((state) => state.auth)
    const hasItemsInCart = cart.items.length > 0
    const dispatch = useAppDispatch()
    const { toast } = useToast()

    const handleSkipOnboarding = () => {
        dispatch(skipOnboardingProcess())
        toast({
            title: "Onboarding Skipped",
            description: "You can complete your profile later from your dashboard.",
            variant: "default",
        })
    }

      // Role-specific messages
  const getRoleSpecificMessage = () => {
    switch (user?.role) {
      case "admin":
        return "As an administrator, completing your profile helps with system management and user communication."
      case "teacher":
        return "As a facilitator, completing your profile helps students learn more about you and your teaching style."
      case "student":
      default:
        return (
          "We need a few more details to personalize your experience" +
          (hasItemsInCart ? " and process your course selection" : "") +
          "."
        )
    }
  }

    return (
        <Alert variant="default" className="mb-6 bg-primary/5 border-primary/20">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-medium">Profile Completion Required</AlertTitle>
            <AlertDescription className="">
                <p className="mb-2">
                Please complete your profile to access all features of the platform. {getRoleSpecificMessage()}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <DyraneButton asChild size="sm">
                        <Link href="/profile">Complete Your Profile</Link>
                    </DyraneButton>
                    <DyraneButton size="sm" variant="outline" onClick={handleSkipOnboarding}>
                        Skip for now
                    </DyraneButton>
                    {hasItemsInCart && (
                        <DyraneButton asChild size="sm" variant="outline">
                            <Link href="/cart">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                View Cart ({cart.items.length})
                            </Link>
                        </DyraneButton>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    )
}
