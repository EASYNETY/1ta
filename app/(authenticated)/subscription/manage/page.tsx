// app(authenticated)/subscription/manage/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Calendar, CreditCard, AlertCircle, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
    selectUserSubscription,
    updateUserSubscription,
    cancelUserSubscription,
    selectPricingLoading,
} from "@/features/pricing/store/pricing-slice"

export default function ManageSubscriptionPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const userSubscription = useAppSelector(selectUserSubscription)
    const isLoading = useAppSelector(selectPricingLoading)
    const [autoRenew, setAutoRenew] = useState(userSubscription?.autoRenew || false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)

    useEffect(() => {
        if (userSubscription) {
            setAutoRenew(userSubscription.autoRenew)
        }
    }, [userSubscription])

    if (!userSubscription) {
        router.push("/pricing")
        return null
    }

    const handleAutoRenewToggle = async (checked: boolean) => {
        try {
            await dispatch(
                updateUserSubscription({
                    subscriptionId: userSubscription.id,
                    data: { autoRenew: checked },
                }),
            ).unwrap()

            setAutoRenew(checked)
            toast({
                title: "Subscription Updated",
                description: `Auto-renewal has been ${checked ? "enabled" : "disabled"}.`,
                variant: "success",
            })
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update auto-renewal setting. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleCancelSubscription = async () => {
        try {
            await dispatch(cancelUserSubscription(userSubscription.id)).unwrap()

            toast({
                title: "Subscription Cancelled",
                description: "Your subscription has been cancelled successfully.",
                variant: "success",
            })
            setShowCancelDialog(false)
            router.push("/pricing")
        } catch (error) {
            toast({
                title: "Cancellation Failed",
                description: "Failed to cancel subscription. Please try again.",
                variant: "destructive",
            })
        }
    }

    const renewalDate = userSubscription.autoRenew
        ? format(new Date(userSubscription.expiryDate), "PPP")
        : "Not set to renew"

    return (
        <div className="mx-auto">
            <div className="flex items-center gap-2 mb-8">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-3xl font-bold">Manage Subscription</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <DyraneCard>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Plan</span>
                                    <span className="font-medium">{userSubscription.planName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                        {userSubscription.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Start Date</span>
                                    <span>{format(new Date(userSubscription.startDate), "PPP")}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Expiry Date</span>
                                    <span>{format(new Date(userSubscription.expiryDate), "PPP")}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <Label htmlFor="auto-renew" className="font-medium">
                                            Auto-Renewal
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Your subscription will {autoRenew ? "automatically renew on" : "expire on"}{" "}
                                            {format(new Date(userSubscription.expiryDate), "PPP")}
                                        </p>
                                    </div>
                                    <Switch
                                        id="auto-renew"
                                        checked={autoRenew}
                                        onCheckedChange={handleAutoRenewToggle}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </DyraneCard>

                    <DyraneCard>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="flex items-center gap-4 p-4 border rounded-md">
                                <CreditCard className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Card ending in ****4081</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <DyraneButton variant="outline">Update Payment Method</DyraneButton>
                            </div>
                        </div>
                    </DyraneCard>

                    <DyraneCard className="border-destructive/50">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-destructive">Cancel Subscription</h2>
                            <p className="text-muted-foreground mb-4">
                                Cancelling your subscription will allow you to use the service until the end of your current billing
                                period on {format(new Date(userSubscription.expiryDate), "PPP")}.
                            </p>
                            <DyraneButton variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={isLoading}>
                                Cancel Subscription
                            </DyraneButton>
                        </div>
                    </DyraneCard>
                </div>

                <div className="space-y-6">
                    <DyraneCard>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Subscription Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Billing Date</p>
                                        <p className="font-medium">{renewalDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="font-medium">
                                            ₦{userSubscription.paymentHistory[0]?.amount.toLocaleString() || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DyraneCard>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Need Help?</AlertTitle>
                        <AlertDescription>
                            If you have any questions about your subscription, please contact our support team.
                        </AlertDescription>
                    </Alert>

                    <DyraneButton variant="outline" className="w-full" onClick={() => router.push("/subscription/upgrade")}>
                        Upgrade Plan
                    </DyraneButton>
                </div>
            </div>

            {/* Cancel Subscription Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription? You will lose access to premium features after your
                            current billing period ends on {format(new Date(userSubscription.expiryDate), "PPP")}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This action cannot be undone. You will need to purchase a new subscription if you change your mind.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <DyraneButton variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isLoading}>
                            Keep Subscription
                        </DyraneButton>
                        <DyraneButton variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
                            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
                        </DyraneButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
