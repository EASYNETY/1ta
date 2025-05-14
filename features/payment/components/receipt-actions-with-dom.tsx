"use client"

import type React from "react"
import { Download, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DomToImageReceipt } from "./dom-to-image-receipt"
import { PaymentRecord } from "../types/payment-types"

interface ReceiptActionsProps {
    payment: PaymentRecord
    receiptElementId: string
    className?: string
}

export const ReceiptActionsWithDom: React.FC<ReceiptActionsProps> = ({ payment, receiptElementId, className = "" }) => {
    const { handleDownloadImage } = DomToImageReceipt({
        payment,
        receiptElementId,
    })

    const handlePrint = () => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const receiptElement = document.getElementById(receiptElementId)
        if (!receiptElement) return

        printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${payment.id}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt-container { max-width: 800px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptElement.innerHTML}
          </div>
        </body>
      </html>
    `)

        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
    }

    const handleShare = async () => {
        if (!navigator.share) {
            alert("Web Share API is not supported in your browser")
            return
        }

        try {
            await navigator.share({
                title: `Payment Receipt - ${payment.id}`,
                text: `Payment receipt for transaction ${payment.id}`,
                url: window.location.href,
            })
        } catch (error) {
            console.error("Error sharing:", error)
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

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share receipt</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share receipt</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}
