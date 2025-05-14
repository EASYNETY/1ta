"use client"

import type React from "react"
import { Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { PaymentRecord } from "../types/payment-types"
import { toast } from "sonner"
import { printReceipt, downloadReceiptAsImage } from "../utils/receipt-utils"

// Type guard for Web Share API
function hasShareAPI(navigator: Navigator): navigator is Navigator & { share: (data: any) => Promise<void> } {
    return "share" in navigator
}

interface ReceiptActionsProps {
    payment: PaymentRecord
    receiptElementId: string
    className?: string
}

export const ReceiptActionsWithDom: React.FC<ReceiptActionsProps> = ({ payment, receiptElementId, className = "" }) => {
    const handleDownloadImage = async () => {
        try {
            toast.loading("Opening receipt in new window...")
            await downloadReceiptAsImage(payment)
            toast.success("Receipt opened in new window")
        } catch (error) {
            console.error("Error downloading receipt:", error)
            toast.error(error instanceof Error ? error.message : "Failed to download receipt")
        }
    }

    const handlePrint = () => {
        try {
            toast.loading("Preparing to print...")
            printReceipt(receiptElementId)
            toast.success("Print dialog opened")
        } catch (error) {
            console.error("Error printing:", error)
            toast.error("Failed to print receipt. Please try again.")
        }
    }

    const handleShare = async () => {
        if (!hasShareAPI(navigator)) {
            toast.error("Web Share API is not supported in your browser")
            return
        }

        try {
            await navigator.share({
                title: `Payment Receipt - ${payment.id}`,
                text: `Payment receipt for transaction ${payment.id}`,
                url: window.location.href,
            })
            toast.success("Shared successfully")
        } catch (error) {
            console.error("Error sharing:", error)
            if (error instanceof Error && error.name !== "AbortError") {
                toast.error("Failed to share receipt")
            }
        }
    }

    // Check if Web Share API is available
    const isShareAvailable = hasShareAPI(navigator)

    return (
        <TooltipProvider>
            <div className={`flex gap-2 ${className}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print receipt</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print receipt</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleDownloadImage}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download as image</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download as image</TooltipContent>
                </Tooltip>

                {isShareAvailable && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share receipt</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share receipt</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    )
}
