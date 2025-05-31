// app/(authenticated)/checkout/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react" // Added useState
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { useToast } from "@/hooks/use-toast"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, ShoppingCart, AlertTriangle, ArrowLeft, Users, CreditCard } from "lucide-react" // Added CreditCard
import { PaystackCheckout } from "@/components/payment/paystack-checkout"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { clearCart, selectCartItems, selectCartTotalWithTax } from "@/features/cart/store/cart-slice" // Added selectCartTotalWithTax
import {
    // prepareCheckout action is dispatched from CartPage with invoiceId now
    enrolCoursesAfterPayment,
    resetCheckout,
    selectCheckoutItems,
    selectCheckoutTotalAmount, // This will be the invoiced amount
    selectCheckoutStatus,
    selectCheckoutError,
    setShowPaymentModal,
    selectCheckoutShowPaymentModal,
    setPaymentReference,
    setCheckoutError,
    setSkipCheckout,
    selectCheckoutInvoiceId, // Important selector
    setPaymentProcessingStatus,
    setCheckoutStatus, // Import if you use it
} from "@/features/checkout/store/checkoutSlice"
import type { User } from "@/types/user.types"
import { isStudent } from "@/types/user.types"
import type { EnrolCoursesPayload } from "@/features/checkout/types/checkout-types"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
// Removed fetchCourses from here, as course data for checkout items should be part of what's
// passed from cart to prepareCheckout or already in cart items.

export default function CheckoutPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { toast } = useToast()
    const searchParams = useSearchParams();

    // --- Selectors ---
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const cartItemsFromStore = useAppSelector(selectCartItems) // Get cart items for initial check
    const totalAmountFromCartStore = useAppSelector(selectCartTotalWithTax); // Get invoiced amount

    const checkoutItems = useAppSelector(selectCheckoutItems)
    const totalAmountForPayment = useAppSelector(selectCheckoutTotalAmount) // This should match invoiced total
    const checkoutStatus = useAppSelector(selectCheckoutStatus)
    const checkoutError = useAppSelector(selectCheckoutError)
    const showPaymentModal = useAppSelector(selectCheckoutShowPaymentModal)
    const invoiceIdFromCheckoutState = useAppSelector(selectCheckoutInvoiceId) // The crucial invoice ID

    // --- Component State & Derived Values ---
    const [isPageLoading, setIsPageLoading] = useState(true); // For initial setup

    const isPreparingCheckout = checkoutStatus === "preparing";
    const isEnroling = checkoutStatus === "processing_enrolment";
    const isPaymentModalAction = checkoutStatus === "processing_payment"; // Status for when modal is active

    const isCorporateStudent = user && isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager
    const isCorporateManager = user && isStudent(user) && Boolean(user.isCorporateManager)

    // Placeholder - in a real app, fetch this or get from user.corporate.studentCount
    const corporateStudentCount = useMemo(() => (isCorporateManager ? 5 : 1), [isCorporateManager]);

    // --- Effects ---

    // Redirect if not authenticated or if corporate student
    useEffect(() => {
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to proceed.",
                variant: "default",
            });
            router.push("/signup?redirect=/checkout"); // Redirect back to checkout after login
            return;
        }
        if (isCorporateStudent) {
            toast({
                title: "Access Restricted",
                description: "Corporate students don't make direct purchases.",
                variant: "destructive",
            });
            router.push("/dashboard");
        }
    }, [isAuthenticated, isCorporateStudent, router, toast]);


    // Main effect to handle page load, check for invoiceId, and cart status
    useEffect(() => {
        setIsPageLoading(true);
        if (!isAuthenticated || isCorporateStudent) return; // Handled by above useEffect

        // If invoiceId is not in checkout state, it means prepareCheckout wasn't called
        // (e.g., direct navigation or cart became empty after invoice creation but before nav).
        // This page *requires* an invoiceId to have been set by the cart page.
        if (!invoiceIdFromCheckoutState) {
            if (cartItemsFromStore.length > 0) {
                toast({
                    title: "Checkout Session Expired",
                    description: "Please return to your cart to proceed.",
                    variant: "default",
                });
                router.push("/cart");
            } else {
                // Cart is empty, and no invoice - normal to redirect
                router.push("/courses");
            }
            return; // Stop further processing in this effect
        }

        // If we have an invoiceId, it means prepareCheckout was called from CartPage.
        // The checkout state (items, totalAmount) should already be set.
        // We don't need to call prepareCheckout again here.

        setIsPageLoading(false); // Setup complete

    }, [
        isAuthenticated,
        isCorporateStudent,
        invoiceIdFromCheckoutState,
        cartItemsFromStore,
        router,
        toast,
        dispatch // Added dispatch though not directly used in this logic path
    ]);


    // Effect 3: Cleanup checkout state on unmount
    // THIS IS THE CRITICAL CHANGE: Only reset if navigating AWAY MANUALLY
    // while checkout is in a "transient" state (like 'ready' but not yet paid/failed).
    // Do NOT reset if it's just a re-render or HMR.
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // This doesn't reliably work for SPA navigation, but good for browser close/refresh
            if (checkoutStatus === "ready" || checkoutStatus === "processing_payment") {
                // Consider if you want to warn user or auto-reset here.
                // For now, we let the router-based cleanup handle it.
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // The logic for resetting on SPA navigation away from /checkout
            // should ideally be tied to *why* the user is leaving.
            // If they click "Skip Checkout", that button's handler can dispatch resetCheckout.
            // If they use browser back from /checkout to /cart, /cart should re-initiate.
            // A blanket reset on unmount is too broad.
            // We will rely on CartPage re-initiating a clean checkout process if user returns.
            console.log("CheckoutPage unmounting. Current status:", checkoutStatus);
            // If explicitly skipping, skipCheckout flag is true.
            // If payment succeeded/failed, we don't reset.
            // If payment was just cancelled from modal, modal's onOpenChange might reset.
            // This leaves manual navigation away (e.g. clicking a link in nav bar)
            // if (checkoutStatus !== "succeeded" && checkoutStatus !== "failed" && !selectSkipCheckout(store.getState())) {
            //    dispatch(resetCheckout());
            // }
        };
    }, [dispatch, checkoutStatus]); // Removed 'store' as a direct dependency


    // Handle payment success from PaystackCheckout
    const handlePaymentSuccess = (paystackReference: { reference: string;[key: string]: any }) => {
        if (!user || !invoiceIdFromCheckoutState || checkoutItems.length === 0 || totalAmountForPayment < 0) {
            dispatch(setCheckoutError("Missing required information for enrolment. Please try again."));
            dispatch(setShowPaymentModal(false));
            return;
        }

        dispatch(setPaymentReference(paystackReference?.reference || null));
        dispatch(setShowPaymentModal(false)); // Close Paystack modal

        const payload: EnrolCoursesPayload = {
            userId: user.id,
            courseIds: checkoutItems.map((item) => item.courseId),
            paymentReference: paystackReference,
            totalAmountPaid: totalAmountForPayment,
            isCorporatePurchase: isCorporateManager || checkoutItems.some((item) => item.isCorporatePrice),
            corporateStudentCount: isCorporateManager ? corporateStudentCount : undefined,
            // Consider adding invoiceId to this payload if your backend enrolment needs it
            // invoiceId: invoiceIdFromCheckoutState,
        };

        dispatch(enrolCoursesAfterPayment(payload))
            .unwrap()
            .then((response) => {
                const successMessage = isCorporateManager
                    ? `Successfully enroled ${corporateStudentCount} students in ${response.enroledCourseIds.length} course(s).`
                    : `You are now enroled in ${response.enroledCourseIds.length} course(s).`;
                toast({ variant: "success", title: "Enrolment Successful!", description: response.message || successMessage });
                dispatch(clearCart());
                router.push("/dashboard");
            })
            .catch((errorMsg) => {
                toast({ variant: "destructive", title: "Enrolment Failed", description: errorMsg || "Could not complete enrolment after payment." });
            });
    };

    // Handle payment cancellation
    const handlePaymentCancel = () => {
        dispatch(setShowPaymentModal(false));
        toast({ title: "Payment Cancelled", variant: "default" });
    };

    // Handle query params for payment status from redirect
    useEffect(() => {
        const paymentStatusParam = searchParams.get('payment_status');
        const paymentRefParam = searchParams.get('ref');

        if (paymentStatusParam) {
            let title = "Payment Status";
            let description = `Payment reference: ${paymentRefParam || 'N/A'}`;
            let variant: "destructive" | "default" = "default";

            if (paymentStatusParam === 'verification_failed') {
                title = "Payment Verification Failed";
                description = `We couldn't confirm your payment. ${description}. Please try again or contact support.`;
                variant = "destructive";
            } else if (paymentStatusParam === 'declined') {
                title = "Payment Declined";
                description = `Your payment was not successful. ${description}. Please try a different method or contact your bank.`;
                variant = "destructive";
            }
            toast({ title, description, variant });
            // Clean URL to prevent re-showing toast on refresh
            router.replace('/checkout');
        }
    }, [searchParams, toast, router]);


    // Function to show the payment modal
    const handleInitiatePayment = () => {
        if (checkoutStatus !== "ready") {
            toast({ variant: "default", title: "Checkout Not Ready", description: "Please wait or try returning to your cart." });
            return;
        }
        if (totalAmountForPayment < 0) { // Free items have totalAmountForPayment === 0
            toast({ variant: "default", title: "Invalid Total Amount", description: "Total amount cannot be negative." });
            return;
        }
        if (!user?.email) {
            toast({ variant: "default", title: "Email Missing", description: "Your email is required to proceed." });
            return;
        }
        if (!invoiceIdFromCheckoutState) {
            toast({ variant: "destructive", title: "Error", description: "Invoice ID is missing. Please return to cart." });
            return;
        }

        dispatch(setPaymentProcessingStatus()); // Set status to 'processing_payment'
        dispatch(setShowPaymentModal(true));
    };

    const handleSkipCheckoutAndBrowse = () => {
        dispatch(setSkipCheckout(true));
        toast({ title: "Checkout Postponed", description: "Your items are saved in your cart.", variant: "default" });
        router.push("/courses"); // Go to browse courses
    };


    // --- Render Logic ---

    if (isPageLoading || (!isAuthenticated && !isCorporateStudent)) { // Show loader if page is loading or auth checks are pending
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading checkout...</p>
            </div>
        );
    }

    if (!invoiceIdFromCheckoutState && cartItemsFromStore.length > 0) {
        // This state should ideally be caught by useEffect redirecting to cart
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Session Issue</h2>
                <p className="text-muted-foreground mb-6">There was an issue with your checkout session. Please return to your cart.</p>
                <DyraneButton asChild>
                    <Link href="/cart">Go to Cart</Link>
                </DyraneButton>
            </div>
        );
    }


    if (cartItemsFromStore.length === 0 && checkoutStatus !== "succeeded") {
        // If cart is empty AND checkout hasn't just succeeded (which clears the cart)
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-6">Add some courses to proceed.</p>
                <DyraneButton asChild>
                    <Link href="/courses">Browse Courses</Link>
                </DyraneButton>
            </div>
        );
    }

    if (isPreparingCheckout) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Finalizing your order...</p>
            </div>
        );
    }


    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <DyraneButton variant="outline" size="sm" onClick={() => router.push('/cart')} aria-label="Back to Cart">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
                </DyraneButton>
                <h1 className="text-2xl md:text-3xl font-bold text-center flex-grow">Checkout</h1>
                <DyraneButton
                    variant="ghost"
                    onClick={handleSkipCheckoutAndBrowse}
                    disabled={isEnroling || isPaymentModalAction}
                    size="sm"
                >
                    Continue Shopping
                </DyraneButton>
            </div>

            {checkoutError && (checkoutStatus === "failed" || checkoutStatus === "processing_enrolment" /* Show error during enrolment fail too */) && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>{checkoutError}</AlertDescription>
                </Alert>
            )}

            {isCorporateManager && (
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="ml-2 font-semibold text-blue-700 dark:text-blue-300">Corporate Purchase Details</AlertTitle>
                    <AlertDescription className="ml-2 text-blue-600 dark:text-blue-400">
                        You are purchasing for {corporateStudentCount} students. The total reflects this count.
                        Invoice ID: <span className="font-mono text-xs">{invoiceIdFromCheckoutState}</span>
                    </AlertDescription>
                </Alert>
            )}
            {!isCorporateManager && invoiceIdFromCheckoutState && (
                <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="ml-2 font-semibold text-green-700 dark:text-green-300">Order Ready for Payment</AlertTitle>
                    <AlertDescription className="ml-2 text-green-600 dark:text-green-400">
                        Invoice ID: <span className="font-mono text-xs">{invoiceIdFromCheckoutState}</span>
                    </AlertDescription>
                </Alert>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                    {checkoutItems.length === 0 && checkoutStatus === "ready" && (
                        <p className="text-muted-foreground">No items in your order to display.</p>
                    )}
                    {checkoutItems.map((item) => (
                        <Card key={item.courseId} className="flex items-start gap-4 p-4">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                                />
                            ) : <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-muted-foreground" /></div>}
                            <div className="flex-grow">
                                <h3 className="font-medium text-base">{item.title}</h3>
                                {item.instructor && <p className="text-xs text-muted-foreground">By {item.instructor}</p>}
                                {item.isCorporatePrice && (
                                    <Badge variant="outline" className="text-xs mt-1 bg-sky-100 text-sky-700 border-sky-300">
                                        Corporate Price
                                    </Badge>
                                )}
                                {isCorporateManager && item.studentCount && item.studentCount > 1 && (
                                    <p className="text-xs text-muted-foreground mt-1">For {item.studentCount} students</p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-base">₦{item.priceToPay.toLocaleString()}</p>
                                {item.priceToPay < item.originalPrice && (
                                    <p className="text-xs text-muted-foreground line-through">₦{item.originalPrice.toLocaleString()}</p>
                                )}
                                {isCorporateManager && item.studentCount && item.studentCount > 0 && item.priceToPay > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        (₦{(item.priceToPay / item.studentCount).toLocaleString()} per student)
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <DyraneCard className="sticky top-24 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">Order Total</CardTitle>
                            {isCorporateManager && <CardDescription>For {corporateStudentCount} students</CardDescription>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isCorporateManager && checkoutItems.length > 0 && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Price per student package</span>
                                    <span>₦{(totalAmountForPayment / corporateStudentCount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal (from invoice)</span>
                                <span>₦{totalAmountForPayment.toLocaleString()}</span>
                            </div>
                            {/* Add tax or other fees here if they are applied AFTER invoice creation,
                                otherwise, they should be part of totalAmountForPayment from the invoice */}
                            <Separator />
                            <div className="flex justify-between font-bold text-xl">
                                <span>Amount to Pay</span>
                                <span>₦{totalAmountForPayment.toLocaleString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col space-y-3">
                            <DyraneButton
                                onClick={handleInitiatePayment}
                                className="w-full"
                                disabled={isPreparingCheckout || isEnroling || isPaymentModalAction || checkoutStatus !== "ready" || !invoiceIdFromCheckoutState}
                                size="lg"
                            >
                                {(isEnroling || isPaymentModalAction) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEnroling ? "Processing Enrolment..." :
                                    isPaymentModalAction ? "Processing Payment..." :
                                        totalAmountForPayment === 0 ? "Complete Free Enrolment" : "Proceed to Payment"}
                            </DyraneButton>
                            <p className="text-xs text-muted-foreground text-center px-2">
                                {isCorporateManager
                                    ? `You will be charged for ${corporateStudentCount} students.`
                                    : totalAmountForPayment === 0
                                        ? "Free items will be added to your account immediately upon completion."
                                        : "You'll be redirected to our secure payment gateway."}
                            </p>
                        </CardFooter>
                    </DyraneCard>
                </div>
            </div>

            <Dialog
                open={showPaymentModal}
                onOpenChange={(open) => {
                    // Allow closing only if not in the middle of an API call triggered by the modal
                    if (!isEnroling) {
                        dispatch(setShowPaymentModal(open));
                        if (!open) {
                            // If modal is closed while payment was "processing" (Paystack modal was open),
                            // reset status to ready, unless an error/success has occurred from Paystack callback
                            dispatch(setCheckoutStatus('ready')); // Or a softer reset if needed
                        }
                    }
                }}
            >
                <VisuallyHidden>
                    <DialogTitle>
                        Secure Payment
                    </DialogTitle>
                </VisuallyHidden>
                <DialogContent className="sm:max-w-md py-8 bg-card/5 backdrop-blur-sm border border-primary/5 shadow-none">
                    {/* DialogHeader removed as PaystackCheckout has its own title feel */}
                    <div className="">
                        {user?.email && checkoutStatus === "processing_payment" && invoiceIdFromCheckoutState && (
                            <PaystackCheckout
                                invoiceId={invoiceIdFromCheckoutState}
                                courseTitle={
                                    isCorporateManager
                                        ? `Corp. Purchase (${checkoutItems.length} items x ${corporateStudentCount} students)`
                                        : `Course Purchase (${checkoutItems.length} items)`
                                }
                                amount={totalAmountForPayment}
                                email={user.email}
                                userId={user.id}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                            />
                        )}
                        {(checkoutStatus !== "processing_payment" || !invoiceIdFromCheckoutState || !user?.email) && (
                            <div className="p-6 bg-card rounded-xl">
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Cannot Proceed</AlertTitle>
                                    <AlertDescription>
                                        {!invoiceIdFromCheckoutState ? "Invoice details are missing. " : ""}
                                        {!user?.email ? "User email is missing. " : ""}
                                        Please return to cart or refresh.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}