"use client"

import type React from "react"
import { useState } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { ScanLine, QrCode, Maximize } from 'lucide-react'

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
            {/* Scanner with visual guides */}
            <div className="relative">
                <BarcodeScannerComponent
                    width={width}
                    height={height}
                    onUpdate={(err, result) => {
                        if (result) handleScan(result)
                    }}
                />

                {/* Scanning overlay with visual guides */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner guides */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary"></div>

                    {/* Center target */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border-2 border-dashed border-primary/50 rounded-md flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-primary/30" />
                        </div>
                    </div>

                    {/* Scanning animation */}
                    <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                        <div className="h-0.5 bg-primary/50 animate-pulse w-full"></div>
                    </div>
                </div>
            </div>

            {/* Scanning instructions */}
            <div className="mt-2 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                <Maximize className="h-4 w-4" />
                <span>Position barcode within the frame</span>
                {cooldown && <span className="ml-2 font-medium text-primary animate-pulse">Processing scan...</span>}
            </div>
        </div>
    )
}

export default BarcodeScanner
