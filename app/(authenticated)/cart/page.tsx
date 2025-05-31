// app/(authenticated)/cart/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { removeItem } from "@/features/cart/store/cart-slice"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { isStudent, User } from "@/types/user.types" // Import type guard
import { Trash2, GraduationCap, ArrowRight, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { prepareCheckout } from "@/features/checkout/store/checkoutSlice"
import { createInvoiceThunk, selectInvoiceCreationStatus } from "@/features/payment/store/payment-slice"
import { CreateInvoicePayload, InvoiceItem } from "@/features/payment/types/payment-types"

export default function CartPage() {
    const { user, skipOnboarding } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const taxAmount = useAppSelector((state) => state.cart.taxAmount)
    const totalWithTax = useAppSelector((state) => state.cart.totalWithTax)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { toast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)

    const profileComplete = user ? isProfileComplete(user) : false
    const hasItems = cart.items.length > 0
    const invoiceCreationStatus = useAppSelector(selectInvoiceCreationStatus); // Track invoice creation

    // Check if user is a corporate student (has corporateId but is not a manager)
    const isCorporateStudent = user && isStudent(user) && Boolean(user.corporateId) && !user.isCorporateManager

    // Check if user is a corporate manager
    const isCorporateManager = user && isStudent(user) && Boolean(user.isCorporateManager)

    // Redirect corporate students away from cart
    useEffect(() => {
        if (isCorporateStudent) {
            toast({
                title: "Access Restricted",
                description: "Corporate students don't need to make purchases. Your courses are managed by your organization.",
                variant: "destructive",
            })
            router.push("/dashboard")
        }
    }, [isCorporateStudent, router, toast])

    const handleRemoveItem = (courseId: string) => {
        dispatch(removeItem({
            id: courseId
        }))
        toast({
            title: "Item Removed",
            description: "The item has been removed from your cart.",
            variant: "default",
        })
    }

    const handleCheckout = async () => { // Make async
        setIsProcessing(true);

        if (!user) {
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
            setIsProcessing(false);
            return;
        }

        if (!profileComplete && !skipOnboarding) {
            toast({
                title: "Profile Incomplete",
                description: "Please complete your profile before proceeding to checkout.",
                variant: "default",
            });
            router.push("/profile");
            setIsProcessing(false);
            return;
        }

        if (cart.items.length === 0) {
            toast({ title: "Cart Empty", description: "Your cart is empty.", variant: "default" });
            setIsProcessing(false);
            return;
        }

        // --- Create Invoice ---
        const invoiceItems: InvoiceItem[] = cart.items.map(item => ({
            description: item.title,
            amount: item.discountPriceNaira ?? item.priceNaira, // Use discounted price if available
            quantity: 1, // Assuming 1 for each course
            courseId: item.courseId,
        }));

        const today = new Date();
        const dueDate = new Date(today.setDate(today.getDate() + 7)); // Example: Due in 7 days
        const formattedDueDate = dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        const invoicePayload: CreateInvoicePayload = {
            studentId: user.id,
            amount: totalWithTax, // Use the total amount including tax from cart
            description: `Course enrolment: ${cart.items.map(i => i.title).join(', ')}`,
            dueDate: formattedDueDate,
            items: invoiceItems,
        };

        try {
            const resultAction = await dispatch(createInvoiceThunk(invoicePayload)).unwrap();
            // resultAction is CreateInvoiceResponse here
            const createdInvoice = resultAction; // The created invoice object

            toast({
                title: "Invoice Created",
                description: `Invoice ${createdInvoice.id} ready for payment.`,
                variant: "success",
            });

            // --- Prepare Checkout with Invoice ID ---
            dispatch(
                prepareCheckout({
                    cartItems: cart.items, // Still pass cart items for display on checkout page
                    coursesData: [], // Assuming coursesData will be fetched in checkout page if needed
                    user: user as User,
                    totalAmountFromCart: totalWithTax, // The amount on the invoice
                    invoiceId: createdInvoice.id, // <<<< PASS THE CREATED INVOICE ID
                }),
            );
            router.push("/checkout");

        } catch (error: any) {
            toast({
                title: "Invoice Creation Failed",
                description: typeof error === 'string' ? error : "Could not create an invoice. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };


    // Define proper motion variants
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    // If user is a corporate student, they shouldn't be here - handled by useEffect redirect
    if (isCorporateStudent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground mb-6">Corporate students don't need to make purchases.</p>
                <DyraneButton asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                </DyraneButton>
            </div>
        )
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
                        {<DyraneButton asChild>
                            <a
                                href={user ? '/courses' : "/#courses"}
                            >Browse Courses</a>
                        </DyraneButton>}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            {!profileComplete && !skipOnboarding && (
                <Alert variant="default" className="mb-6 bg-primary/5 border-primary/20">
                    <AlertTitle>Complete Your Profile</AlertTitle>
                    <AlertDescription>Please complete your profile before proceeding to checkout.</AlertDescription>
                </Alert>
            )}

            {/* Corporate Manager Info Banner */}
            {isCorporateManager && (
                <Alert variant="default" className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <AlertTitle>Corporate Purchase</AlertTitle>
                    <AlertDescription>
                        As a corporate manager, you'll be purchasing these courses for all students in your organization. The final
                        price will be calculated at checkout based on your student count.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                        {cart.items.map((item) => (
                            <motion.div key={item.courseId}>
                                <Card className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.title}</h3>
                                            {item.instructor && (
                                                <p className="text-sm text-muted-foreground">Instructor: {item.instructor}</p>
                                            )}
                                            {isCorporateManager && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Corporate pricing will be applied at checkout
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="text-right">
                                                {item.discountPriceNaira ? (
                                                    <>
                                                        <p className="line-through text-sm text-muted-foreground">₦{item.priceNaira.toLocaleString()}</p>
                                                        <p className="font-medium">₦{item.discountPriceNaira.toLocaleString()}</p>
                                                    </>
                                                ) : (
                                                    <p className="font-medium">₦{item.priceNaira.toLocaleString()}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.courseId)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div>
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₦{cart.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₦{taxAmount.toLocaleString()}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₦{totalWithTax.toLocaleString()}</span>
                            </div>

                            {isCorporateManager && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    * Final price will be calculated at checkout based on your student count
                                </p>
                            )}
                        </div>
                        <DyraneButton className="w-full mt-4" onClick={handleCheckout} disabled={isProcessing || invoiceCreationStatus === 'loading'}>
                            {isProcessing || invoiceCreationStatus === 'loading' ? (
                                "Processing..."
                            ) : (
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
    )
}
