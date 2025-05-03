// lib/barcode-scanner.tsx

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { Maximize, Focus, Barcode } from "lucide-react"

interface BarcodeScannerProps {
    onDetected: (code: string) => void
    width?: number
    height?: number
    isActive?: boolean // Control scanner activation
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, width = 500, height = 500, isActive = true }) => {
    const [cooldown, setCooldown] = useState(false)
    const scannerRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Simulate camera focus effect
    useEffect(() => {
        if (isActive && !cooldown) {
            // Simulate periodic auto-focus
            const focusInterval = setInterval(() => {
                setIsFocused(true)
                setTimeout(() => setIsFocused(false), 500)
            }, 5000)

            return () => clearInterval(focusInterval)
        }
    }, [isActive, cooldown])

    // Handle manual focus
    const handleFocus = () => {
        if (isActive && !cooldown) {
            setIsFocused(true)
            setTimeout(() => setIsFocused(false), 500)
        }
    }

    // Handle successful scan with cooldown
    const handleScan = (result: any) => {
        if (!isActive || cooldown || !result) return

        // Extract the barcode text and ensure it's a string
        const code = String(result?.text ?? result)

        // Set cooldown to prevent multiple rapid scans
        setCooldown(true)

        // Call the callback with the detected code
        onDetected(code)
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
        <div className="flex flex-col items-center max-h-[400px]">
            {/* Scanner with visual guides */}
            <div className="relative" ref={scannerRef} onClick={handleFocus}>
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

                    {/* Rectangular barcode target area - optimized for linear barcodes */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className={`w-64 h-24 border-2 border-dashed ${isFocused ? "border-green-500" : "border-primary/50"
                                } flex items-center justify-center transition-colors duration-300`}
                        >
                            <Barcode className={`h-8 w-12 ${isFocused ? "text-green-500" : "text-primary/30"}`} />
                        </div>
                    </div>

                    {/* Horizontal scanning line - better for linear barcodes */}
                    <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                        <div className="h-1 bg-red-500/70 animate-pulse w-full"></div>
                    </div>

                    {/* Focus animation */}
                    {isFocused && <div className="absolute inset-0 border-2 border-green-500 animate-pulse opacity-50"></div>}
                </div>
            </div>

            {/* Scanning instructions */}
            <div className="mt-2 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                <Maximize className="h-4 w-4" />
                <span>Position barcode horizontally within the frame</span>
                {cooldown && <span className="ml-2 font-medium text-primary animate-pulse">Processing scan...</span>}
            </div>

            {/* Focus instruction */}
            <button
                onClick={handleFocus}
                className="mt-1 text-xs text-primary flex items-center justify-center gap-1 hover:underline"
                disabled={!isActive || cooldown}
            >
                <Focus className="h-3 w-3" />
                <span>Tap to focus</span>
            </button>
        </div>
    )
}

export default BarcodeScanner
