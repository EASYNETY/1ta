"use client"

import { PaymentRecord } from "../types/payment-types"
import type { DomToImage } from "../types/dom-to-image-types"

interface DomToImageReceiptProps {
    payment: PaymentRecord
    receiptElementId: string
}

// This is a custom hook, not a React component
export const useDomToImageReceipt = ({ payment, receiptElementId }: DomToImageReceiptProps) => {
    const handleDownloadImage = async () => {
        const receiptElement = document.getElementById(receiptElementId)
        if (!receiptElement) return

        try {
            // Dynamically import domtoimage library
            const domtoimage = (await import("dom-to-image")).default as unknown as DomToImage

            // Create a clone of the receipt element to avoid modifying the original
            const clone = receiptElement.cloneNode(true) as HTMLElement
            document.body.appendChild(clone)

            // Set styles for the clone to ensure proper rendering
            clone.style.position = "absolute"
            clone.style.left = "-9999px"
            clone.style.width = `${receiptElement.offsetWidth}px`
            clone.style.background = "white"

            // Generate PNG blob
            const dataBlob = await domtoimage.toPng(clone, {
                quality: 1,
                bgcolor: "white",
                style: {
                    transform: "scale(2)", // Increase quality
                },
                filter: (node: Node) => {
                    // Fix for Tailwind CSS OKLCH colors
                    if (node instanceof HTMLElement && node.tagName === 'STYLE') {
                        // Keep all style nodes
                        return true;
                    }
                    return true; // Keep all nodes
                }
            })

            // Clean up the clone
            document.body.removeChild(clone)

            // Create download link
            const link = document.createElement("a")
            link.download = `payment-receipt-${payment.id}.png`
            link.href = dataBlob
            link.click()
        } catch (error) {
            console.error("Error generating receipt image:", error)

            // Fallback to direct SVG approach if dom-to-image fails
            fallbackToDirectDownload()
        }
    }

    const fallbackToDirectDownload = () => {
        const receiptElement = document.getElementById(receiptElementId)
        if (!receiptElement) return

        // Create a canvas element
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const rect = receiptElement.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2

        // Draw white background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Convert receipt HTML to SVG data URL
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${receiptElement.outerHTML}
        </div>
      </foreignObject>
    </svg>`

        // Create SVG blob
        const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)

        // Load SVG into image
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            // Draw image to canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            // Convert to PNG and download
            try {
                const pngUrl = canvas.toDataURL("image/png")
                const link = document.createElement("a")
                link.download = `payment-receipt-${payment.id}.png`
                link.href = pngUrl
                link.click()
            } catch (e) {
                console.error("Error in fallback download:", e)
                alert("Unable to download receipt. Please try the print option instead.")
            }

            // Clean up
            URL.revokeObjectURL(svgUrl)
        }

        img.onerror = (err) => {
            console.error("Error loading SVG:", err)
            URL.revokeObjectURL(svgUrl)
            alert("Unable to download receipt. Please try the print option instead.")
        }

        img.src = svgUrl
    }

    return { handleDownloadImage }
}
