// app/(authenticated)/subscription/payment-methods/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CreditCard, Trash2, CheckCircle, Loader2, PlusCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PaystackCheckout } from '@/components/payment/paystack-checkout'; // Import checkout
import { useToast } from '@/hooks/use-toast';

import {
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    selectAllPaymentMethods,
    selectDefaultPaymentMethodId,
    selectPaymentMethodsLoading,
    selectPaymentMethodsAdding,
    selectPaymentMethodsError,
    selectShowAddPaymentModal,
    setShowAddModal,
    clearPaymentMethodsError,
} from '@/features/payment/store/payment-slice'; // Import slice actions/selectors
import { cn } from '@/lib/utils';

// Helper to format card type
const formatCardType = (type?: string) => {
    if (!type) return 'Card';
    return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function PaymentMethodsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // --- Selectors ---
    const { user } = useAppSelector(state => state.auth);
    const methods = useAppSelector(selectAllPaymentMethods);
    const defaultMethodId = useAppSelector(selectDefaultPaymentMethodId);
    const isLoading = useAppSelector(selectPaymentMethodsLoading);
    const isAdding = useAppSelector(selectPaymentMethodsAdding);
    const error = useAppSelector(selectPaymentMethodsError);
    const showAddModal = useAppSelector(selectShowAddPaymentModal);

    // Local state for delete confirmation
    const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

    // --- Fetch methods on mount ---
    useEffect(() => {
        if (user?.id) {
            dispatch(fetchPaymentMethods(user.id));
        } else {
            // Handle case where user is not available (shouldn't happen in authenticated route)
            console.error("User not found for fetching payment methods.");
            // router.replace('/login'); // Or show an error
        }
        // Clear any previous errors on mount
        dispatch(clearPaymentMethodsError());

    }, [dispatch, user?.id]); // Dependency on user.id


    // --- Handlers ---
    const handleOpenAddModal = () => {
        dispatch(setShowAddModal(true));
    };

    // Called by PaystackCheckout on successful card *authorization*
    const handleAddMethodSuccess = (paystackReference: any) => {
        if (!user?.id) return;
        dispatch(addPaymentMethod({ userId: user.id, paystackReference }))
            .unwrap()
            .then(() => {
                toast({ variant: 'success', title: 'Payment Method Added' });
                // Modal closed automatically by slice on success
            })
            .catch((err) => {
                // Error handled by slice/rejected case, toast shown there potentially
                console.error("Add method failed after Paystack success:", err);
                // Error state is set in Redux, no need for separate toast here unless desired
                // toast({ variant: 'destructive', title: 'Failed to Save Method', description: err || 'Please try again.' });
            });
    };

    const handleSetDefault = (methodId: string) => {
        if (!user?.id || methodId === defaultMethodId) return; // No action if already default
        dispatch(clearPaymentMethodsError()); // Clear previous errors
        dispatch(setDefaultPaymentMethod({ userId: user.id, methodId: methodId }))
            .unwrap()
            .then(() => toast({ variant: 'success', title: 'Default Payment Method Updated' }))
            .catch((err) => toast({ variant: 'destructive', title: 'Update Failed', description: err || 'Could not set default.' }));
    };

    const handleDeleteConfirm = (methodId: string) => {
        setMethodToDelete(methodId); // Open confirmation dialog
    };

    const handleDeleteExecute = () => {
        if (!user?.id || !methodToDelete) return;
        dispatch(clearPaymentMethodsError());
        dispatch(deletePaymentMethod({ userId: user.id, methodId: methodToDelete }))
            .unwrap()
            .then(() => {
                toast({ variant: 'success', title: 'Payment Method Deleted' });
                setMethodToDelete(null); // Close confirmation dialog
            })
            .catch((err) => {
                toast({ variant: 'destructive', title: 'Delete Failed', description: err || 'Could not delete method.' });
                setMethodToDelete(null); // Close confirmation dialog on error too
            });
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4"> {/* Increased max-width */}
            <div className="flex items-center gap-2 mb-8">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-3xl font-bold">Manage Payment Methods</h1>
            </div>

            {/* Loading State */}
            {isLoading && !isAdding && ( // Show general loading only if not adding
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Error Display */}
            {error && !showAddModal && ( // Don't show general error when add modal is open
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Payment Methods List */}
            <DyraneCard className={cn(isLoading && 'opacity-50 pointer-events-none')}> {/* Dim while loading */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Saved Methods</h2>
                        <DyraneButton size="sm" onClick={handleOpenAddModal} disabled={isLoading || isAdding}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </DyraneButton>
                    </div>

                    {methods.length === 0 && !isLoading && (
                        <p className="text-muted-foreground text-center py-4">No saved payment methods found.</p>
                    )}

                    {methods.map((method) => (
                        <div key={method.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md gap-4 bg-background hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <CreditCard className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {formatCardType(method.cardType)} ending in ****{method.last4}
                                        </p>
                                        {method.id === defaultMethodId && (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Expires {method.expiryMonth}/{method.expiryYear} {method.bank && ` • ${method.bank}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                <DyraneButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefault(method.id)}
                                    disabled={isLoading || method.id === defaultMethodId} // Disable if loading or already default
                                >
                                    {isLoading && method.id !== defaultMethodId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                    <span className="ml-1 sm:hidden lg:inline">Set Default</span>
                                </DyraneButton>
                                <DyraneButton
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteConfirm(method.id)}
                                    disabled={isLoading || methods.length <= 1} // Disable delete if only one method left or loading
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-1 sm:hidden lg:inline">Delete</span>
                                </DyraneButton>
                            </div>
                        </div>
                    ))}
                </div>
            </DyraneCard>

            {/* Add Payment Method Modal */}
            <Dialog open={showAddModal} onOpenChange={(open) => dispatch(setShowAddModal(open))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Payment Method</DialogTitle>
                        <DialogDescription>
                            Your card will be authorized via Paystack. A small temporary hold might be placed and refunded.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Display adding error specifically inside modal */}
                    {error && isAdding && (
                        <Alert variant="destructive" className="my-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error Adding Card</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="py-2">
                        {user?.email && ( // Ensure user email is available
                            <PaystackCheckout
                                // Configuration for adding a card might differ slightly,
                                // consult Paystack docs if needed. Often the standard checkout
                                // flow results in a reusable authorization if your Paystack account is set up for it.
                                courseId={`add_card_${user.id}`} // Use a descriptive unique ID
                                courseTitle="Authorize New Card"
                                amount={50} // Standard Paystack authorization amount (NGN 50), often refunded
                                email={user.email}
                                userId={user.id}
                                onSuccess={handleAddMethodSuccess} // Dispatch addPaymentMethod thunk on success
                                onCancel={() => dispatch(setShowAddModal(false))}
                            />
                        )}
                        {!user?.email && (
                            <p className="text-red-600 text-sm text-center">User email not found. Cannot add card.</p>
                        )}
                        {/* Show loading indicator specifically for adding */}
                        {isAdding && (
                            <div className="flex items-center justify-center pt-4">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving payment method...
                            </div>
                        )}
                    </div>
                    {/* Optional Footer */}
                    {/* <DialogFooter> <Button ...> </DialogFooter> */}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!methodToDelete} onOpenChange={() => setMethodToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this payment method? This action cannot be undone.
                            {methods.find(m => m.id === methodToDelete)?.isDefault && methods.length > 1 && (
                                <span className='block mt-2 font-medium text-amber-700'> Since this is your default, another method will be set as default automatically.</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DyraneButton variant="outline" onClick={() => setMethodToDelete(null)} disabled={isLoading}>
                            Cancel
                        </DyraneButton>
                        <DyraneButton variant="destructive" onClick={handleDeleteExecute} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </DyraneButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}