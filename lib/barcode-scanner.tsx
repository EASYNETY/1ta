"use client"

import type React from "react"
import { useState } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"

interface BarcodeScannerProps {
    onDetected: (code: string) => void
    width?: number
    height?: number
    isActive?: boolean // Control scanner activation
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, width = 500, height = 500, isActive = true }) => {
    const [cooldown, setCooldown] = useState(false)

    // Handle successful scan with cooldown
    const handleScan = (result: any) => {
        if (!isActive || cooldown || !result) return

        // Extract the barcode text
        const code = result?.text ?? result

        // Set cooldown to prevent multiple rapid scans
        setCooldown(true)

        // Call the callback with the detected code
        onDetected(code)

        // Reset cooldown after delay
        setTimeout(() => setCooldown(false), 1500)
    }

    // Only render scanner when active
    if (!isActive) {
        return (
            <div className="flex items-center justify-center border rounded-lg bg-muted h-[300px] w-full max-w-[500px] mx-auto">
                <p className="text-muted-foreground">Scanner paused</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <BarcodeScannerComponent
                width={width}
                height={height}
                onUpdate={(err, result) => {
                    if (result) handleScan(result)
                }}
            />
            {cooldown && <div className="mt-2 text-sm text-muted-foreground">Processing scan...</div>}
        </div>
    )
}

export default BarcodeScanner
