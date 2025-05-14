"use client"

import type React from "react"
import { Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useDomToImageReceipt } from "./dom-to-image-receipt"
import type { PaymentRecord } from "../types/payment-types"
import { toast } from "sonner"

interface ReceiptActionsProps {
    payment: PaymentRecord
    receiptElementId: string
    className?: string
}

export const ReceiptActionsWithDom: React.FC<ReceiptActionsProps> = ({ payment, receiptElementId, className = "" }) => {
    const { handleDownloadImage } = useDomToImageReceipt({
        payment,
        receiptElementId,
    })

    const handlePrint = () => {
        const receiptElement = document.getElementById(receiptElementId)
        if (!receiptElement) {
            toast.error("Receipt element not found")
            return
        }

        try {
            const printWindow = window.open("", "_blank")
            if (!printWindow) {
                toast.error("Could not open print window")
                return
            }

            // Get all stylesheets from the current document
            const styleSheets = Array.from(document.styleSheets)
            let styleContent = ""

            // Extract CSS rules from stylesheets
            styleSheets.forEach((sheet) => {
                try {
                    if (sheet.cssRules) {
                        const cssRules = Array.from(sheet.cssRules)
                        cssRules.forEach((rule) => {
                            styleContent += rule.cssText + "\n"
                        })
                    }
                } catch (e) {
                    // Skip cross-origin stylesheets
                    console.warn("Could not access stylesheet:", e)
                }
            })

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Payment Receipt - ${payment.id}</title>
                        <style>
                            ${styleContent}
                            @media print {
                                body { margin: 0; padding: 20px; }
                                .receipt-container { max-width: 800px; margin: 0 auto; }
                            }
                            body { font-family: system-ui, -apple-system, sans-serif; }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-container">
                            ${receiptElement.outerHTML}
                        </div>
                        <script>
                            window.onload = function() { 
                                setTimeout(function() { 
                                    window.print(); 
                                    setTimeout(function() { window.close(); }, 500);
                                }, 500);
                            }
                        </script>
                    </body>
                </html>
            `)

            printWindow.document.close()
            toast.success("Preparing to print...")
        } catch (error) {
            console.error("Error printing:", error)
            toast.error("Failed to print receipt. Please try again.")
        }
    }

    const handleShare = async () => {
        if (!navigator.share) {
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
                            <span className="sr-only">Download receipt</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download receipt</TooltipContent>
                </Tooltip>

                {"share" in navigator && (
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
