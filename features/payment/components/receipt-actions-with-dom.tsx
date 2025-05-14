// src/features/payment/components/receipt-actions-with-dom.tsx
"use client"

import type React from "react"
import { Download, Printer, Share2, FileText } from "lucide-react" // Added FileText
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { PaymentRecord } from "../types/payment-types"
import { toast } from "sonner"

function hasShareAPI(navigator: Navigator): navigator is Navigator & { share: (data: any) => Promise<void> } {
    return "share" in navigator
}

interface ReceiptActionsProps {
    payment: PaymentRecord
    receiptElementId: string
    className?: string
}

export const ReceiptActionsWithDom: React.FC<ReceiptActionsProps> = ({ payment, receiptElementId, className = "" }) => {

    const handleDownloadHtml = async () => {
        const receiptNode = document.getElementById(receiptElementId);
        if (!receiptNode) {
            toast.error("Receipt element not found to download.");
            return;
        }

        try {
            const clonedReceipt = receiptNode.cloneNode(true) as HTMLElement;

            // Convert image src to absolute paths or data URLs for better standalone viewing
            const images = Array.from(clonedReceipt.getElementsByTagName('img'));
            const imagePromises = images.map(async (img) => {
                // Only process relative URLs that are not already data URLs
                if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('http') && img.getAttribute('src')) {
                    const originalSrcAttribute = img.getAttribute('src')!;
                    // Create a full URL based on the current page's origin for fetching
                    const fetchableUrl = new URL(originalSrcAttribute, window.location.origin).href;
                    try {
                        const response = await fetch(fetchableUrl);
                        if (!response.ok) throw new Error(`Failed to fetch image ${fetchableUrl} status: ${response.status}`);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise<void>((resolve, reject) => {
                            reader.onloadend = () => {
                                img.src = reader.result as string;
                                resolve();
                            };
                            reader.onerror = (error) => {
                                console.warn(`FileReader error for image ${fetchableUrl}:`, error);
                                reject(error);
                            };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.warn(`Failed to embed image ${fetchableUrl}:`, e);
                        // If fetching/embedding fails, set src to the absolute URL as a fallback
                        img.src = fetchableUrl;
                    }
                }
            });
            await Promise.all(imagePromises);

            const receiptHtml = clonedReceipt.outerHTML;
            const currentHtmlClassName = document.documentElement.className; // For dark/light mode

            let fullHtml = `
<!DOCTYPE html>
<html lang="en" class="${currentHtmlClassName}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${payment?.id || 'Details'}</title>
`;
            // Link to existing stylesheets. This relies on them being accessible.
            Array.from(document.head.getElementsByTagName('link')).forEach(link => {
                if (link.rel === 'stylesheet' && link.href) {
                    fullHtml += `<link rel="stylesheet" href="${link.href}">\n`;
                }
            });
            // Embed inline style tags from head (e.g., Tailwind base, globals.css output)
            Array.from(document.head.getElementsByTagName('style')).forEach(styleTag => {
                fullHtml += `<style>${styleTag.innerHTML}</style>\n`;
            });
            fullHtml += `
    <style>
        body { margin: 0; padding: 20px; background-color: var(--background, white); color: var(--foreground, black); font-family: var(--font-sans, sans-serif); }
        #${receiptElementId} { margin: 0 auto; max-width: 800px; /* Example styling for the receipt block */ }
        /* Tailwind print variants will apply when printing this HTML */
    </style>
</head>
<body>
    ${receiptHtml}
</body>
</html>`;

            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${payment?.id || 'details'}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Receipt HTML downloaded. Open it in a browser to view or print to PDF.", { duration: 5000 });

        } catch (error) {
            console.error("Error downloading receipt HTML:", error);
            toast.error(error instanceof Error ? error.message : "Failed to download receipt HTML.");
        }
    };

    const handleShare = async () => {
        if (!hasShareAPI(navigator)) {
            toast.error("Web Share API is not supported in your browser");
            return;
        }
        try {
            await navigator.share({
                title: `Payment Receipt - ${payment?.id || 'details'}`,
                text: `Payment receipt for transaction ${payment?.id || 'N/A'}`,
                url: window.location.href,
            });
            toast.success("Shared successfully");
        } catch (error) {
            console.error("Error sharing:", error);
            if (error instanceof Error && error.name !== "AbortError") {
                toast.error("Failed to share receipt");
            }
        }
    };

    const isShareAvailable = typeof window !== 'undefined' && hasShareAPI(navigator);

    return (
        <TooltipProvider>
            <div className={`flex gap-2 ${className}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleDownloadHtml}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Download as HTML</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download as HTML (view & print to PDF)</TooltipContent>
                </Tooltip>

                {isShareAvailable && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleShare}>
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share receipt link</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share receipt link</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
};