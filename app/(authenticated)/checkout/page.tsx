// app/(authenticated)/checkout/page.tsx
"use client";

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShoppingCart, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { PaystackCheckout } from '@/components/payment/paystack-checkout'; // Real or Mock handler inside
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Keep for Dialog title
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Keep Dialog
import { clearCart, selectCartItems } from '@/features/cart/store/cart-slice';
import {
    prepareCheckout,
    enrollCoursesAfterPayment,
    resetCheckout,
    selectCheckoutItems,
    selectCheckoutTotalAmount,
    selectCheckoutStatus,
    selectCheckoutError,
    setShowPaymentModal,
    selectCheckoutShowPaymentModal,
    setPaymentReference,
    setCheckoutError,
    setSkipCheckout,
} from '@/features/checkout/store/checkoutSlice';
import type { User } from '@/types/user.types';
import { isStudent } from '@/types/user.types'; // Import type guard
import { EnrollCoursesPayload } from '@/features/checkout/types/checkout-types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchCourses } from '@/features/public-course/store/public-course-slice';


export default function CheckoutPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();

    // Selectors
    const { user } = useAppSelector(state => state.auth);
    const cartItems = useAppSelector(selectCartItems);
    // Fetch public courses to get pricing info
    const { allCourses: publicCourses, status: courseStatus } = useAppSelector(state => state.public_courses);
    const checkoutItems = useAppSelector(selectCheckoutItems);
    const totalAmount = useAppSelector(selectCheckoutTotalAmount);
    const checkoutStatus = useAppSelector(selectCheckoutStatus);
    const checkoutError = useAppSelector(selectCheckoutError);
    const showPaymentModal = useAppSelector(selectCheckoutShowPaymentModal);

    const isLoading = checkoutStatus === 'idle' || checkoutStatus === 'preparing' || courseStatus === 'loading';
    const isEnrolling = checkoutStatus === 'processing_enrollment';
    const isPaymentProcessing = checkoutStatus === 'processing_payment'; // Maybe add this status later

    // Fetch public courses if not already loaded
    useEffect(() => {
        if (courseStatus === 'idle') {
            dispatch(fetchCourses());
        }
    }, [courseStatus, dispatch]);

    // Prepare checkout items when cart, user, or courses change
    useEffect(() => {
        // Ensure courses are loaded before preparing
        if (user && cartItems.length > 0 && courseStatus === 'succeeded' && publicCourses.length > 0) {
            console.log("Preparing checkout...");
            dispatch(prepareCheckout({
                cartItems,
                coursesData: publicCourses,
                user: user as User | null // Pass user, casting if needed based on definition
            }));
        } else if (cartItems.length === 0 && checkoutStatus !== 'idle' && checkoutStatus !== 'succeeded') {
            // If cart becomes empty, reset checkout unless already succeeded
            dispatch(resetCheckout());
        }
    }, [cartItems, user, dispatch, publicCourses, courseStatus, checkoutStatus]);

    // Cleanup checkout state on unmount
    useEffect(() => {
        return () => { dispatch(resetCheckout()); };
    }, [dispatch]);

    // Handler after successful payment via PaystackCheckout
    const handlePaymentSuccess = (paystackReference: any) => {
        if (!user || checkoutItems.length === 0 || totalAmount <= 0) {
            dispatch(setCheckoutError("Missing required information for enrollment."));
            dispatch(setShowPaymentModal(false)); // Close payment modal
            return;
        }

        dispatch(setPaymentReference(paystackReference?.reference || null)); // Store reference
        dispatch(setShowPaymentModal(false)); // Close Paystack modal

        const payload: EnrollCoursesPayload = {
            userId: user.id,
            courseIds: checkoutItems.map(item => item.courseId),
            paymentReference: paystackReference, // Pass full reference object
            totalAmountPaid: totalAmount, // Pass calculated total
            // Determine if corporate pricing was applied to *any* item
            isCorporatePurchase: checkoutItems.some(item => item.isCorporatePrice),
        };

        // Dispatch enrollment thunk
        dispatch(enrollCoursesAfterPayment(payload))
            .unwrap()
            .then((response) => {
                toast({ variant: 'success', title: 'Enrollment Successful!', description: response.message || `You are now enrolled in ${response.enrolledCourseIds.length} course(s).` });
                dispatch(clearCart()); // Clear the cart
                router.push('/dashboard'); // Redirect to dashboard
            })
            .catch((errorMsg) => {
                // Error state is set by the rejected case in the slice
                toast({ variant: 'destructive', title: 'Enrollment Failed', description: errorMsg || 'Could not complete enrollment after payment.' });
                // Keep user on checkout page to see error?
            });
    };

    const handlePaymentCancel = () => {
        dispatch(setShowPaymentModal(false));
        toast({ title: "Payment Cancelled", variant: 'default' });
    };

    // Function to initiate payment
    const initiatePayment = () => {
        if (checkoutStatus !== 'ready') {
            toast({
                variant: 'default',
                title: 'Checkout Not Ready',
                description: 'Please ensure your cart is ready before proceeding.',
            });
            return;
        }

        if (totalAmount <= 0) {
            toast({
                variant: 'default',
                title: 'Invalid Total Amount',
                description: 'Total amount must be greater than 0 to proceed with payment.',
            });
            return;
        }

        if (!user?.email) {
            toast({
                variant: 'default',
                title: 'Email Missing',
                description: 'Please ensure your email is available before continuing.',
            });
            return;
        }

        dispatch(setShowPaymentModal(true)); // Open the Paystack modal
    };

    const handleSkipCheckoutAndBrowse = () => {
        dispatch(setSkipCheckout(true)); // Set the flag
        toast({
            title: "Checkout Postponed",
            description: "Your items are saved in the cart.",
            variant: "default", // Use info variant
        });
        // Reset checkout state *before* navigating away if desired
        // dispatch(resetCheckout()); // Optional: Clear checkout items/total immediately
        router.push('/dashboard'); // Navigate to courses page (or dashboard)
    };


    // --- Render Logic ---

    if (courseStatus === 'loading' && checkoutStatus === 'idle') {
        return <div className='p-6'><Skeleton className="h-40 w-full" /></div> // Basic loading for courses
    }

    if (cartItems.length === 0 && checkoutStatus !== 'succeeded') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-6">Looks like you haven't added any courses yet.</p>
                <DyraneButton asChild>
                    <Link href="/courses">Browse Courses</Link>
                </DyraneButton>
            </div>
        );
    }

    if (checkoutStatus === 'preparing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Preparing your checkout...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto space-y-6">
            <div className="flex items-center gap-2 justify-between mb-4 flex-wrap">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
                <DyraneButton
                    variant="outline" // Use outline or ghost
                    onClick={handleSkipCheckoutAndBrowse}
                    className="w-full ml-auto"
                    disabled={isLoading} // Disable while processing
                >
                    {/* <LogOut className="mr-2 h-4 w-4" /> */}
                    Skip Checkout
                </DyraneButton>
            </div>

            {checkoutError && checkoutStatus === 'failed' && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Checkout Error</AlertTitle>
                    <AlertDescription>{checkoutError}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                    {checkoutItems.map(item => (
                        <Card key={item.courseId} className="flex items-start gap-4 p-4 bg-card/15 backdrop-blur-sm">
                            {item.image && <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />}
                            {!item.image && <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0"></div>}
                            <div className="flex-grow">
                                <h3 className="font-medium">{item.title}</h3>
                                {item.instructor && <p className="text-xs text-muted-foreground">Instructor: {item.instructor}</p>}
                                {item.isCorporatePrice && <Badge variant="outline" className="text-xs mt-1 bg-sky-100 text-sky-700 border-sky-300">Corporate Price</Badge>}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold">₦{item.priceToPay.toLocaleString()}</p>
                                {item.priceToPay < item.originalPrice && (
                                    <p className="text-xs text-muted-foreground line-through">₦{item.originalPrice.toLocaleString()}</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Checkout Actions */}
                <div className="lg:col-span-1">
                    <DyraneCard className="sticky top-20"> {/* Make summary sticky */}
                        <CardHeader>
                            <CardTitle>Total</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₦{totalAmount.toLocaleString()}</span>
                            </div>
                            {/* Add Discount/Tax lines if needed later */}
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Order Total</span>
                                <span>₦{totalAmount.toLocaleString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col space-y-3">
                            <DyraneButton
                                onClick={initiatePayment}
                                className="w-full"
                                disabled={isLoading || isEnrolling || checkoutStatus !== 'ready'}
                                size="lg"
                            >
                                {(isLoading || isEnrolling) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEnrolling ? 'Processing Enrollment...' : 'Proceed to Payment'}
                            </DyraneButton>
                            <p className="text-xs text-muted-foreground text-center">You will be redirected to our secure payment gateway.</p>
                        </CardFooter>
                    </DyraneCard>
                </div>
            </div>

            {/* Payment Modal (Uses PaystackCheckout internally) */}
            <Dialog open={showPaymentModal} onOpenChange={(open) => !isLoading && !isEnrolling && dispatch(setShowPaymentModal(open))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle><VisuallyHidden>Complete Your Payment</VisuallyHidden></DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        {user?.email && checkoutStatus === 'ready' && (
                            <PaystackCheckout
                                courseId={`cart_checkout_${user.id}`} // Unique identifier for this checkout type
                                courseTitle={`Course Purchase (${checkoutItems.length} items)`}
                                amount={totalAmount} // Pass the calculated total
                                email={user.email}
                                userId={user.id}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                            />
                        )}
                        {/* Handle cases where modal shouldn't show content */}
                        {(!user?.email || checkoutStatus !== 'ready') && (
                            <p className='text-center text-sm text-muted-foreground py-4'>Payment details cannot be loaded currently.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}