// app/(authenticated)/cart/page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { removeItem } from "@/features/cart/store/cart-slice"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { isStudent, User } from "@/types/user.types"
import { Trash2, GraduationCap, ArrowRight, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// Import actions and selectors for both checkout and payment (invoice) slices
import {
    prepareCheckout,
    selectCheckoutStatus,
    selectCheckoutInvoiceId,
    resetCheckout
} from "@/features/checkout/store/checkoutSlice"
import {
    createInvoiceThunk,
    resetPaymentState,
    selectInvoiceCreationStatus,
    selectInvoiceError
} from "@/features/payment/store/payment-slice"
import type { CreateInvoicePayload, InvoiceItem } from "@/features/payment/types/payment-types"

export default function CartPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();

    const { user, skipOnboarding } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const taxAmount = useAppSelector((state) => state.cart.taxAmount);
    const totalWithTax = useAppSelector((state) => state.cart.totalWithTax);

    const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
    // Use a ref to store the current attempt's invoice ID to avoid stale closures in useEffect
    const currentAttemptInvoiceIdRef = useRef<string | null>(null);

    const invoiceCreationStatus = useAppSelector(selectInvoiceCreationStatus);
    const invoiceCreationError = useAppSelector(selectInvoiceError);
    const checkoutPreparationStatus = useAppSelector(selectCheckoutStatus);
    const preparedInvoiceIdFromCheckoutSlice = useAppSelector(selectCheckoutInvoiceId);

    const profileComplete = user ? isProfileComplete(user) : false;
    const hasItems = cart.items.length > 0;
    const isCorporateStudent = user && isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager;
    const isCorporateManager = user && isStudent(user) && Boolean(user.isCorporateManager);
    // Redirect corporate students
    useEffect(() => {
        if (isCorporateStudent) {
            toast({
                title: "Access Restricted",
                description: "Corporate students don't need to make purchases. Your courses are managed by your organization.",
                variant: "destructive",
            });
            router.push("/dashboard");
        }
    }, [isCorporateStudent, router, toast]);

    const handleRemoveItem = (courseId: string) => {
        dispatch(removeItem({ id: courseId }));
        toast({
            title: "Item Removed",
            description: "The item has been removed from your cart.",
            variant: "default",
        });
    };

    const handleCheckout = async () => {
        if (isInitiatingCheckout) {
            console.warn("CartPage: handleCheckout - Already initiating.");
            return;
        }
        setIsInitiatingCheckout(true);
        currentAttemptInvoiceIdRef.current = null; // Reset ref

        // Dispatch resets first to ensure a clean state for selectors in useEffect
        console.log("CartPage: Resetting payment and checkout states...");
        await dispatch(resetPaymentState());
        await dispatch(resetCheckout());
        // Give Redux a moment to process state updates if needed, though usually synchronous for reducers
        // await new Promise(resolve => setTimeout(resolve, 0)); // Optional, usually not needed

        console.log("CartPage: handleCheckout - Initiating checkout process...");

        if (!user) {
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
            setIsInitiatingCheckout(false); // Reset flag
            return;
        }
        if (!profileComplete && !skipOnboarding) {
            toast({ title: "Profile Incomplete", description: "Please complete your profile.", variant: "default" });
            router.push("/profile");
            setIsInitiatingCheckout(false); // Reset flag
            return;
        }
        if (!hasItems) {
            toast({ title: "Cart Empty", description: "Your cart is empty.", variant: "default" });
            setIsInitiatingCheckout(false); // Reset flag
            return;
        }

        const invoiceItems: InvoiceItem[] = cart.items.map(item => ({
            description: item.title,
            amount: item.discountPriceNaira ?? item.priceNaira,
            quantity: 1, courseId: item.courseId,
        }));
        const today = new Date();
        const dueDate = new Date(today.setDate(today.getDate() + 7));
        const formattedDueDate = dueDate.toISOString().split('T')[0];
        const invoicePayload: CreateInvoicePayload = {
            studentId: user.id, amount: totalWithTax,
            description: `Course enrolment: ${cart.items.map(i => i.title).join(', ')}`,
            dueDate: formattedDueDate, items: invoiceItems,
        };

        try {
            console.log("CartPage: Dispatching createInvoiceThunk...");
            const createdInvoice = await dispatch(createInvoiceThunk(invoicePayload)).unwrap();
            // 'createdInvoice' is the Invoice object
            currentAttemptInvoiceIdRef.current = createdInvoice.id; // Set the ref immediately
            console.log("CartPage: Invoice created successfully, ID:", createdInvoice.id);
            toast({ title: "Invoice Created", description: `Invoice ${createdInvoice.id} ready. Preparing checkout...`, variant: "success" });

            console.log("CartPage: Dispatching prepareCheckout with invoiceId:", createdInvoice.id);
            dispatch(
                prepareCheckout({
                    cartItems: cart.items, coursesData: [],
                    user: user as User, totalAmountFromCart: totalWithTax,
                    invoiceId: createdInvoice.id,
                })
            );
            // useEffect will handle navigation and final reset of isInitiatingCheckout
        } catch (error: any) {
            console.error("CartPage: Error during createInvoiceThunk:", error);
            toast({ title: "Checkout Initiation Failed", description: typeof error === 'string' ? error : error?.message || "Could not create an invoice.", variant: "destructive" });
            setIsInitiatingCheckout(false); // Reset on error
            currentAttemptInvoiceIdRef.current = null;
        }
    };

    // useEffect to handle navigation AFTER Redux state is updated
    useEffect(() => {
        console.log(
            `CartPage Nav useEffect: isInitiatingCheckout=${isInitiatingCheckout}, ` +
            `currentAttemptInvoiceIdRef.current=${currentAttemptInvoiceIdRef.current}, ` +
            `invoiceCreationStatus=${invoiceCreationStatus}, ` +
            `checkoutPreparationStatus=${checkoutPreparationStatus}, ` +
            `preparedInvoiceIdFromSlice=${preparedInvoiceIdFromCheckoutSlice}`
        );

        if (isInitiatingCheckout && currentAttemptInvoiceIdRef.current) {
            if (
                invoiceCreationStatus === "succeeded" &&
                checkoutPreparationStatus === "ready" &&
                preparedInvoiceIdFromCheckoutSlice === currentAttemptInvoiceIdRef.current
            ) {
                console.log("CartPage: All conditions met. Navigating to /checkout with invoiceId:", currentAttemptInvoiceIdRef.current);
                router.push("/checkout");
                setIsInitiatingCheckout(false);
                currentAttemptInvoiceIdRef.current = null;
            } else if (invoiceCreationStatus === "failed") {
                console.error("CartPage: Invoice creation failed (observed by useEffect). Error:", invoiceCreationError);
                toast({ title: "Invoice Error", description: invoiceCreationError || "Failed to create invoice.", variant: "destructive" });

                setIsInitiatingCheckout(false);
                currentAttemptInvoiceIdRef.current = null;
            } else if (checkoutPreparationStatus === "failed" && invoiceCreationStatus === "succeeded") {
                console.error("CartPage: Checkout preparation failed (observed by useEffect).");
                toast({ title: "Checkout Error", description: "Failed to prepare checkout.", variant: "destructive" });

                setIsInitiatingCheckout(false);
                currentAttemptInvoiceIdRef.current = null;
            }
        }
    }, [
        isInitiatingCheckout, // This is a local state, will trigger effect when changed
        // currentAttemptInvoiceIdRef.current, // A ref change doesn't trigger useEffect, so we rely on other deps
        invoiceCreationStatus,
        checkoutPreparationStatus,
        preparedInvoiceIdFromCheckoutSlice,
        invoiceCreationError,
        router,
        toast,
    ]);

    const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariant: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }; // Renamed to avoid conflict

    if (isCorporateStudent) {
        return (<div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6"> <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" /> <h2 className="text-xl font-semibold mb-2">Access Restricted</h2> <p className="text-muted-foreground mb-6">Corporate students don't need to make purchases.</p> <DyraneButton asChild> <a href="/dashboard">Go to Dashboard</a> </DyraneButton> </div>);
    }
    if (!hasItems) {
        return (
            <div className="mx-auto">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                        <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Browse our courses and add some to your cart.</p>
                        <button className="bg-primary rounded-xl p-4">
                            <a href={user ? '/courses' : "/#courses"}>Browse Courses</a>
                        </button>
                    </div> </Card>
            </div>);
    }

    return (
        <div className="mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            {!profileComplete && !skipOnboarding && (<Alert variant="default" className="mb-6 bg-primary/5 border-primary/20"> <AlertTitle>Complete Your Profile</AlertTitle> <AlertDescription>Please complete your profile before proceeding to checkout.</AlertDescription> </Alert>)}
            {isCorporateManager && (<Alert variant="default" className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"> <AlertTitle>Corporate Purchase</AlertTitle> <AlertDescription> As a corporate manager, you'll be purchasing these courses for all students in your organization. The final price will be calculated at checkout based on your student count. </AlertDescription> </Alert>)}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                        {cart.items.map((cartItem) => ( // Use cartItem to avoid conflict with itemVariant
                            <motion.div key={cartItem.courseId} variants={itemVariant}>
                                <Card className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            {cartItem.image ? (<Image src={cartItem.image || "/placeholder.svg"} alt={cartItem.title} fill className="object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-muted"> <GraduationCap className="h-6 w-6 text-muted-foreground" /> </div>)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{cartItem.title}</h3>
                                            {cartItem.instructor && (<p className="text-sm text-muted-foreground">Instructor: {cartItem.instructor}</p>)}
                                            {isCorporateManager && (<p className="text-xs text-blue-600 dark:text-blue-400 mt-1"> Corporate pricing will be applied at checkout </p>)}
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="text-right">
                                                {cartItem.discountPriceNaira ? (<> <p className="line-through text-sm text-muted-foreground">₦{cartItem.priceNaira.toLocaleString()}</p> <p className="font-medium">₦{cartItem.discountPriceNaira.toLocaleString()}</p> </>) : (<p className="font-medium">₦{cartItem.priceNaira.toLocaleString()}</p>)}
                                            </div>
                                            <button onClick={() => handleRemoveItem(cartItem.courseId)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove item" > <Trash2 className="h-4 w-4" /> </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                {
                    hasItems &&
                    <div>
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between"> <span className="text-muted-foreground">Subtotal</span> <span>₦{cart.total.toLocaleString()}</span> </div>
                                <div className="flex justify-between"> <span className="text-muted-foreground">Tax</span> <span>₦{taxAmount.toLocaleString()}</span> </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-medium"> <span>Total</span> <span>₦{totalWithTax.toLocaleString()}</span> </div>
                                {isCorporateManager && (<p className="text-xs text-muted-foreground mt-2"> * Final price will be calculated at checkout based on your student count </p>)}
                            </div>
                            <DyraneButton
                                className="w-full mt-4"
                                onClick={handleCheckout}
                                disabled={isInitiatingCheckout || invoiceCreationStatus === 'loading'}
                            >
                                {(isInitiatingCheckout || invoiceCreationStatus === 'loading') ? "Processing..." : (<> Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /> </>)}
                            </DyraneButton>
                        </Card>
                    </div>}
            </div>
        </div>
    );
}