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
import { GraduationCap, ArrowRight, AlertTriangle } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
    selectCurrentInvoice, // Added this selector
    selectInvoiceCreationStatus,
    selectInvoiceCreationError
} from "@/features/payment/store/payment-slice" // Assuming selectCurrentInvoice is exported
import type { CreateInvoicePayload, InvoiceItem } from "@/features/payment/types/payment-types"

// Import public course selectors and components
import {
    selectAllCourses,
    fetchCourses
} from "@/features/public-course/store/public-course-slice"
import { EnhancedCourseItem } from "@/components/cart/enhanced-course-item"
import { PaymentBreakdown } from "@/components/payment/payment-breakdown"

// Helper function for comparing invoice items (ideally from a shared utils or payment-slice if exported)
function compareInvoiceItemsForCartPage(a: InvoiceItem, b: InvoiceItem): number {
    const courseIdA = a.courseId ?? '';
    const courseIdB = b.courseId ?? '';
    if (courseIdA < courseIdB) return -1;
    if (courseIdA > courseIdB) return 1;
    if (a.description < b.description) return -1;
    if (a.description > b.description) return 1;
    if (a.amount < b.amount) return -1;
    if (a.amount > b.amount) return 1;
    if (a.quantity < b.quantity) return -1;
    if (a.quantity > b.quantity) return 1;
    return 0;
}

function areCartInvoiceItemsEffectivelyEqual(
    cartItemsPayload: InvoiceItem[],
    existingInvoiceItems: InvoiceItem[]
): boolean {
    if (cartItemsPayload.length !== existingInvoiceItems.length) return false;
    if (cartItemsPayload.length === 0) return true;

    const sortedCartItems = [...cartItemsPayload].sort(compareInvoiceItemsForCartPage);
    const sortedExistingItems = [...existingInvoiceItems].sort(compareInvoiceItemsForCartPage);

    for (let i = 0; i < sortedCartItems.length; i++) {
        const item1 = sortedCartItems[i];
        const item2 = sortedExistingItems[i];
        if (
            item1.description !== item2.description ||
            item1.amount !== item2.amount ||
            item1.quantity !== item2.quantity ||
            (item1.courseId ?? null) !== (item2.courseId ?? null)
        ) {
            return false;
        }
    }
    return true;
}


export default function CartPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();

    const { user, skipOnboarding, token } = useAppSelector((state) => state.auth);
    const cart = useAppSelector((state) => state.cart);
    const totalWithTax = useAppSelector((state) => state.cart.totalWithTax); // This is the current cart's total

    const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const currentAttemptInvoiceIdRef = useRef<string | null>(null);

    // Selectors for existing payment/invoice state
    const existingCurrentInvoice = useAppSelector(selectCurrentInvoice);
    const existingInvoiceCreationStatus = useAppSelector(selectInvoiceCreationStatus);
    const invoiceCreationError = useAppSelector(selectInvoiceCreationError); // Used in useEffect

    // Selectors for existing checkout state
    const existingCheckoutPreparationStatus = useAppSelector(selectCheckoutStatus);
    const existingPreparedInvoiceIdFromCheckoutSlice = useAppSelector(selectCheckoutInvoiceId);

    // Selectors for course details
    const allCourses = useAppSelector(selectAllCourses);


    const profileComplete = user ? isProfileComplete(user) : false;
    const hasItems = cart.items.length > 0;
    const isCorporateStudent = user && isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager;
    const isCorporateManager = user && isStudent(user) && Boolean(user.isCorporateManager);

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

    // Helper function to get course details for a cart item
    const getCourseDetails = (courseId: string) => {
        return allCourses.find(course => course.id === courseId);
    };

    // Fetch courses if not already loaded
    useEffect(() => {
        if (allCourses.length === 0) {
            dispatch(fetchCourses());
        }
    }, [dispatch, allCourses.length]);

    const toggleExpandedItem = (courseId: string) => {
        const newExpandedItems = new Set(expandedItems);
        if (newExpandedItems.has(courseId)) {
            newExpandedItems.delete(courseId);
        } else {
            newExpandedItems.add(courseId);
        }
        setExpandedItems(newExpandedItems);
    };

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
        // currentAttemptInvoiceIdRef.current is reset more conditionally below or after successful creation
        // Calculate the discounted total here (including tax if needed)
        const discountedTotalWithTax = cart.items.reduce((acc, item) => {
            return acc + ((item.discountPriceNaira ?? item.priceNaira) * item.quantity);
        }, 0);
        let proceedWithNewInvoiceFlow = true;

        // Pre-checks for user, profile, cart items (these should run regardless of reset logic)
        if (!user) {
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
            setIsInitiatingCheckout(false);
            return;
        }
        if (!profileComplete && !skipOnboarding) {
            toast({ title: "Profile Incomplete", description: "Please complete your profile.", variant: "default" });
            router.push("/profile");
            setIsInitiatingCheckout(false);
            return;
        }
        if (!hasItems) {
            toast({ title: "Cart Empty", description: "Your cart is empty.", variant: "default" });
            setIsInitiatingCheckout(false);
            return;
        }

        // Check if user is already enrolled in any of the courses in the cart
        try {
            // Import the enrollment check utility
            const { checkExistingEnrollments } = await import("@/features/checkout/utils/enrollment-check");

            // Get the course IDs from the cart
            const courseIds = cart.items.map(item => item.courseId);

            // Check if user is already enrolled in any of these courses
            const { alreadyEnrolled, canProceed } = await checkExistingEnrollments(
                user.id,
                courseIds,
                token || ""
            );

            if (!canProceed) {
                // User is already enrolled in one or more courses
                const alreadyEnrolledTitles = cart.items
                    .filter(item => alreadyEnrolled.includes(item.courseId))
                    .map(item => item.title);

                toast({
                    title: "Already Enrolled",
                    description: `You are already enrolled in: ${alreadyEnrolledTitles.join(", ")}`,
                    variant: "destructive"
                });
                setIsInitiatingCheckout(false);
                return;
            }
        } catch (error) {
            console.error("Error checking enrollment status:", error);
            // Continue with checkout even if enrollment check fails
            // The backend will still perform the check
        }

        // --- Conditional Reset and Reuse Logic ---
        if (
            existingCurrentInvoice &&
            existingInvoiceCreationStatus === "succeeded" &&
            existingCheckoutPreparationStatus === "ready" &&
            existingPreparedInvoiceIdFromCheckoutSlice === existingCurrentInvoice.id
        ) {
            console.log("CartPage: Found a previously prepared invoice:", existingCurrentInvoice.id);
            // An invoice was successfully created and checkout was prepared.
            // Now, check if it's for the *current* cart contents.

            const currentCartInvoiceItems: InvoiceItem[] = cart.items.map(item => ({
                description: item.title,
                amount: item.discountPriceNaira ?? item.priceNaira,
                quantity: 1, courseId: item.courseId,
            }));

            // Compare key aspects: studentId, total amount, due date (might need care if generated on the fly), and items.
            // Due date comparison can be tricky if it's always "today + 7 days".
            // For simplicity, let's focus on amount and items primarily for cart identity.
            const isCartEffectivelyIdentical =
                existingCurrentInvoice.studentId === user.id && // Should always match if same user
                existingCurrentInvoice.amount === discountedTotalWithTax &&
                // existingCurrentInvoice.amount === totalWithTax && // Compare current cart total with existing invoice total
                areCartInvoiceItemsEffectivelyEqual(currentCartInvoiceItems, existingCurrentInvoice.items);

            if (isCartEffectivelyIdentical) {
                console.log("CartPage: Cart is identical to the previously prepared invoice. Attempting to reuse.");
                currentAttemptInvoiceIdRef.current = existingCurrentInvoice.id; // Signal useEffect to use this ID
                proceedWithNewInvoiceFlow = false;
                // No need to dispatch resets or create new invoice/prepare checkout.
                // The useEffect will handle navigation.
            } else {
                console.log("CartPage: Cart has changed or details mismatch. Resetting and creating new invoice.");
                console.log(
                    `Comparison details: existingAmount=${existingCurrentInvoice.amount}, currentTotalWithTax=${totalWithTax}, studentIdMatch=${existingCurrentInvoice.studentId === user.id}`
                );
                console.log("Existing items:", JSON.stringify(existingCurrentInvoice.items));
                console.log("Current cart items for payload:", JSON.stringify(currentCartInvoiceItems));
                await dispatch(resetPaymentState());
                await dispatch(resetCheckout());
                currentAttemptInvoiceIdRef.current = null; // Clear ref for new invoice
            }
        } else {
            // No fully prepared invoice, or some state is not 'succeeded'/'ready'.
            // Or this is the very first attempt. Reset for a fresh start.
            console.log("CartPage: No fully prepared identical invoice found, or states not ready. Resetting for new flow.");
            console.log(`Relevant states: existingInvoiceCreationStatus=${existingInvoiceCreationStatus}, existingCheckoutPreparationStatus=${existingCheckoutPreparationStatus}, existingPreparedInvoiceIdFromCheckoutSlice=${existingPreparedInvoiceIdFromCheckoutSlice}, existingCurrentInvoiceId=${existingCurrentInvoice?.id}`);
            await dispatch(resetPaymentState());
            await dispatch(resetCheckout());
            currentAttemptInvoiceIdRef.current = null; // Clear ref for new invoice
        }


        // --- Proceed with new invoice creation if decided ---
        if (proceedWithNewInvoiceFlow) {
            console.log("CartPage: Proceeding with new invoice creation flow...");

            const invoiceItems: InvoiceItem[] = cart.items.map(item => ({
                description: item.title,
                amount: item.discountPriceNaira ?? item.priceNaira,
                quantity: 1, courseId: item.courseId,
            }));
            const today = new Date();
            const dueDate = new Date(today.setDate(today.getDate() + 7)); // Creates a new date object
            const formattedDueDate = dueDate.toISOString().split('T')[0];

            // const invoicePayload: CreateInvoicePayload = {
            //     studentId: user.id, // User is confirmed not null above
            //     amount: totalWithTax,
            //     description: cart.items.map(i => i.title).join(', '), // Removed 'Course enrolment:' prefix
            //     dueDate: formattedDueDate,
            //     items: invoiceItems,
            // };


            const invoicePayload: CreateInvoicePayload = {
                studentId: user.id,
                amount: discountedTotalWithTax, // <-- Now uses discount
                description: cart.items.map(i => i.title).join(', '),
                dueDate: formattedDueDate,
                items: invoiceItems,
            };

            try {
                console.log("CartPage: Dispatching createInvoiceThunk...");
                const createdInvoice = await dispatch(createInvoiceThunk(invoicePayload)).unwrap();
                currentAttemptInvoiceIdRef.current = createdInvoice.id; // Set ref for new invoice
                console.log("CartPage: Invoice created successfully, ID:", createdInvoice.id);
                toast({ title: "Invoice Created", description: `Invoice ${createdInvoice.id} ready. Preparing checkout...`, variant: "success" });

                console.log("CartPage: Dispatching prepareCheckout with invoiceId:", createdInvoice.id);
                dispatch(
                    prepareCheckout({
                        cartItems: cart.items,
                        coursesData: [], // Assuming this is correct for your setup
                        user: user as User, // User is confirmed not null
                        totalAmountFromCart: totalWithTax,
                        invoiceId: createdInvoice.id,
                    })
                );
                // useEffect will handle navigation and final reset of isInitiatingCheckout
            } catch (error: any) {
                console.error("CartPage: Error during createInvoiceThunk:", error);
                toast({ title: "Checkout Initiation Failed", description: typeof error === 'string' ? error : error?.message || "Could not create an invoice.", variant: "destructive" });
                setIsInitiatingCheckout(false); // Reset flag on error
                currentAttemptInvoiceIdRef.current = null; // Clear ref on error
            }
        } else {
            // Not proceeding with new invoice flow because we are reusing.
            // isInitiatingCheckout is already true.
            // currentAttemptInvoiceIdRef.current is set to the existing invoice ID.
            // The useEffect should now pick this up and navigate.
            console.log("CartPage: Reusing existing prepared invoice ID:", currentAttemptInvoiceIdRef.current, ". Relying on useEffect for navigation.");
        }
    };

    // useEffect to handle navigation AFTER Redux state is updated
    useEffect(() => {
        console.log(
            `CartPage Nav useEffect: isInitiatingCheckout=${isInitiatingCheckout}, ` +
            `currentAttemptInvoiceIdRef.current=${currentAttemptInvoiceIdRef.current}, ` +
            `invoiceCreationStatus=${existingInvoiceCreationStatus}, ` + // Use the selector variable for consistency
            `checkoutPreparationStatus=${existingCheckoutPreparationStatus}, ` + // Use the selector variable
            `preparedInvoiceIdFromSlice=${existingPreparedInvoiceIdFromCheckoutSlice}` // Use the selector variable
        );

        if (isInitiatingCheckout && currentAttemptInvoiceIdRef.current) {
            // Check against the Redux state values directly for conditions
            if (
                existingInvoiceCreationStatus === "succeeded" &&
                existingCheckoutPreparationStatus === "ready" &&
                existingPreparedInvoiceIdFromCheckoutSlice === currentAttemptInvoiceIdRef.current
            ) {
                console.log("CartPage: All conditions met in useEffect. Navigating to /checkout with invoiceId:", currentAttemptInvoiceIdRef.current);
                router.push("/checkout");
                setIsInitiatingCheckout(false); // Reset after initiating navigation
                // currentAttemptInvoiceIdRef.current = null; // Optional: clear ref after nav
            } else if (existingInvoiceCreationStatus === "failed") {
                console.error("CartPage: Invoice creation failed (observed by useEffect). Error:", invoiceCreationError);
                toast({ title: "Invoice Error", description: invoiceCreationError as string || "Failed to create invoice.", variant: "destructive" });
                setIsInitiatingCheckout(false);
                currentAttemptInvoiceIdRef.current = null;
            } else if (existingCheckoutPreparationStatus === "failed" && existingInvoiceCreationStatus === "succeeded") {
                // This case implies invoice was created, but checkout prep failed for it.
                console.error("CartPage: Checkout preparation failed (observed by useEffect) for invoice:", currentAttemptInvoiceIdRef.current);
                toast({ title: "Checkout Error", description: "Failed to prepare checkout.", variant: "destructive" });
                setIsInitiatingCheckout(false);
                currentAttemptInvoiceIdRef.current = null;
            }
            // If states are still 'loading' or not yet 'ready'/'succeeded', useEffect will re-run when they change.
        }
        // If isInitiatingCheckout is true, but currentAttemptInvoiceIdRef.current is null (e.g. after an error in handleCheckout before ref was set)
        // and an error didn't set isInitiatingCheckout to false, this useEffect won't navigate, which is correct.
        // The toast for the error should have appeared from handleCheckout.
    }, [
        isInitiatingCheckout,
        existingInvoiceCreationStatus, // Dependency on Redux state
        existingCheckoutPreparationStatus, // Dependency on Redux state
        existingPreparedInvoiceIdFromCheckoutSlice, // Dependency on Redux state
        invoiceCreationError,
        router,
        toast,
        // currentAttemptInvoiceIdRef.current is a ref, its change doesn't trigger useEffect directly.
        // The effect relies on isInitiatingCheckout and the Redux states changing.
        // When reusing an invoice, currentAttemptInvoiceIdRef is set, and isInitiatingCheckout is true.
        // The Redux states (existingInvoiceCreationStatus, etc.) should ALREADY be in the "succeeded"/"ready" state
        // for the reuse path, so the condition inside useEffect should immediately pass.
    ]);

    const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariant: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                        {cart.items.map((cartItem) => (
                            <motion.div key={cartItem.courseId} variants={itemVariant}>
                                <EnhancedCourseItem
                                    cartItem={cartItem}
                                    courseDetails={getCourseDetails(cartItem.courseId)}
                                    onRemove={handleRemoveItem}
                                    isExpanded={expandedItems.has(cartItem.courseId)}
                                    onToggleExpand={() => toggleExpandedItem(cartItem.courseId)}
                                />
                                {isCorporateManager && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Corporate pricing will be applied at checkout based on your student count
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                <div className="space-y-6">
                    {/* Payment Breakdown Component */}
                    <PaymentBreakdown cartItems={cart.items} />

                    {/* Corporate Manager Notice */}
                    {isCorporateManager && (
                        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Corporate Purchase:</strong> Final pricing will be calculated at checkout based on your student count.
                            </p>
                        </Card>
                    )}

                    {/* Checkout Button */}
                    <Card className="p-6">
                        <DyraneButton
                            className="w-full"
                            onClick={handleCheckout}
                            disabled={isInitiatingCheckout || existingInvoiceCreationStatus === 'loading'}
                            asChild={false}
                        >
                            {(isInitiatingCheckout || existingInvoiceCreationStatus === 'loading') ? "Processing..." : (
                                <>
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </DyraneButton>
                    </Card>
                </div>
            </div>
        </div>
    );
}