import { useRef } from 'react';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface BarcodeDialogProps {
    userId: string;
    lineColor?: string;
    triggerLabel?: string;
}

export const BarcodeDialog: React.FC<BarcodeDialogProps> = ({
    userId,
    lineColor = '#000000',
    triggerLabel = 'Click to enlarge',
}) => {
    const barcodeRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const el = barcodeRef.current;
        if (!el) {
            console.error("Barcode element ref not found.");
            return;
        }

        // No need to manually change style here anymore

        // Use html2canvas options to fix background issue and improve quality
        html2canvas(el, {
            backgroundColor: '#ffffff', // Explicitly set background for canvas rendering
            scale: 2, // Optional: Render at higher scale for better resolution
            // You might need other options depending on specific CSS issues
            // logging: true, // Enable logging for debugging if needed
        }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `barcode-${userId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            // No need to restore background color here
        }).catch(err => {
            console.error("Error generating barcode image:", err);
            // Add user feedback here (e.g., toast notification)
        });
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <div className="flex items-center justify-center p-1 bg-background/85 backdrop-blur-sm rounded cursor-pointer hover:opacity-80 transition-opacity">
                            <Barcode
                                value={userId}
                                height={20} // Adjusted height for visual balance with padding
                                width={1.5}
                                displayValue={false}
                                margin={0}
                                lineColor={lineColor}
                                background="#000000"
                            />
                        </div>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">{triggerLabel} | User ID: {userId}</TooltipContent>
            </Tooltip>

            {/* Modal content - Styling seems okay, keep background/blur */}
            <DialogContent className="sm:max-w-[300px] bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-center text-lg font-medium">Scan User ID</DialogTitle>
                </DialogHeader>

                {/* This div contains the barcode for download */}
                {/* Ref is correctly placed here */}
                <div ref={barcodeRef} className="bg-white p-4 inline-block"> {/* Ensure white background for capture, padding added via class */}
                    <Barcode
                        value={userId}
                        height={100}
                        width={3}
                        displayValue={false} // Show value in modal for clarity
                        lineColor="#000000" // Black on white for scanning
                        background="#ffffff" // White background
                    />
                </div>

                {/* Use the corrected download handler */}
                <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    Download Barcode
                </Button>
            </DialogContent>
        </Dialog>
    );
};