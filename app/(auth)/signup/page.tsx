// app/(auth)/signup/page.tsx

'use client'

import { SleekLogoLoader } from "@/components/ui/SleekLogoLoader";
import { SignupForm } from "@/features/auth/components/signup-form"
import { useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
    const router = useRouter(); // Import and use useRouter for navigation
    const searchParams = useSearchParams();
    const { isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);
    const redirectQueryParam = searchParams.get('redirect'); // Get ?redirect= from current URL

    useEffect(() => {
        // This effect handles the scenario where an ALREADY AUTHENTICATED user lands on this page.
        if (isInitialized && isAuthenticated) {
            const targetPath = redirectQueryParam || '/dashboard'; // Default to dashboard if no specific redirect
            console.log(`SignupPage: User is already authenticated. Redirecting to ${targetPath}.`);
            router.replace(targetPath); // Use replace to avoid adding /signup to history
        }
        // If !isAuthenticated, we let the page render the SignupForm.
        // After the user signs up through SignupForm, isAuthenticated will become true,
        // and then AuthProvider will take over the redirection logic from there.
    }, [isInitialized, isAuthenticated, redirectQueryParam, router]);

    // Show loader while Redux state is settling OR if we are about to redirect.
    // If isInitialized is true and isAuthenticated is true, the useEffect above will trigger a redirect.
    // So, showing a loader during this brief period is good UX.
    if (!isInitialized || (isInitialized && isAuthenticated)) {
        // Show loader if:
        // 1. Not yet initialized OR
        // 2. Initialized AND authenticated (because the useEffect above will be redirecting)
        return <SleekLogoLoader />;
    }
    return <SignupForm />
}
