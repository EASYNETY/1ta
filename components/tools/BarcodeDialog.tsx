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
        const elementToCapture = barcodeRef.current;
        if (!elementToCapture) {
            console.error("Barcode element ref is not attached.");
            // Optionally: Show error to user (e.g., using a toast notification)
            return;
        }

        console.log("Attempting to capture element:", elementToCapture);

        html2canvas(elementToCapture, {
            backgroundColor: '#ffffff', // Explicitly set background for canvas
            scale: 2, // Increase resolution
            logging: true, // Enable logging from html2canvas for debugging
            onclone: (clonedDoc) => {
                // Optional: You could try to modify the cloned document here
                // before rendering if needed, but usually not necessary with explicit styles.
                console.log("Document cloned for canvas rendering.");
            }
        }).then((canvas) => {
            console.log("Canvas generated successfully.");
            const link = document.createElement('a');
            link.download = `barcode-${userId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            console.log("Download initiated.");
        }).catch(err => {
            console.error("Error during html2canvas generation:", err);
            // Optionally: Show error to user
        });
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <div className="flex items-center justify-center p-1 bg-[#00000000] rounded cursor-pointer hover:opacity-80 transition-opacity">
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
            <DialogContent className="sm:max-w-[300px] bg-[#000000] opacity-85 flex flex-col items-center justify-center p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-center text-lg font-medium">Scan User ID</DialogTitle>
                </DialogHeader>

                {/* This div contains the barcode for download */}
                {/* Ref is correctly placed here */}
                <div ref={barcodeRef} className="bg-[#fff] p-4 inline-block"> {/* Ensure white background for capture, padding added via class */}
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
                <button  className="mt-4 cursor-pointer" onClick={handleDownload}>
                    Download Barcode
                </button>
            </DialogContent>
        </Dialog>
    );
};