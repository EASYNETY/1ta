// app/(authenticated)/subscription/payment-methods/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Construction } from 'lucide-react';

export default function PaymentMethodsPage() {
    const router = useRouter();

    // TODO: Implement fetching, displaying, adding, deleting payment methods
    // This would involve:
    // 1. Defining state in Redux (e.g., features/paymentMethods/paymentMethodsSlice.ts)
    // 2. Creating thunks to interact with API endpoints (e.g., /users/me/payment-methods)
    // 3. Creating mock handlers in api-client.ts for these endpoints
    // 4. Building the UI to list methods, show an "Add Method" form/modal, and delete buttons

    return (
        <div className="mx-auto w-full max-w-2xl px-4">
            <div className="flex items-center gap-2 mb-8">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-3xl font-bold">Manage Payment Methods</h1>
            </div>

            <DyraneCard>
                <div className="p-6">
                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                        <Construction className="h-5 w-5 text-amber-700" />
                        <AlertTitle className="font-semibold text-amber-800">Under Construction</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            Managing saved payment methods is coming soon! For now, your payment method is based on your last successful transaction.
                        </AlertDescription>
                    </Alert>

                    {/* Placeholder for future content */}
                    <div className="mt-6 space-y-4">
                        {/* Example structure for listing cards */}
                        {/* <div className="flex justify-between items-center p-4 border rounded"> ... </div> */}
                        <DyraneButton disabled>Add New Payment Method</DyraneButton>
                    </div>
                </div>
            </DyraneCard>
        </div>
    );
}