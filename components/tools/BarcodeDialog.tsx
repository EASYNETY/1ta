// components/tools/BarcodeDialog.tsx

import { useRef } from 'react';
import Barcode from 'react-barcode';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DyraneButton } from '../dyrane-ui/dyrane-button';


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

    const handleDownloadSVG = () => {
        const svgNode = barcodeRef.current?.querySelector('svg'); // Find the SVG inside the ref'd div
        if (!svgNode) {
            console.error("SVG element not found within barcode container.");
            return;
        }

        // Serialize the SVG to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgNode);

        // Create a data URL
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Set canvas size to match SVG size (or desired output size)
            // Use getBoundingClientRect for more accuracy if needed
            const bbox = svgNode.getBBox ? svgNode.getBBox() : { width: 150, height: 50 }; // Fallback size
            canvas.width = bbox.width * 2; // Render at 2x for quality
            canvas.height = bbox.height * 2;

            // Draw the SVG image onto the canvas
            if (ctx) {
                ctx.fillStyle = '#ffffff'; // Set background fill color for the canvas
                ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw SVG

                // Get PNG data URL from canvas
                const pngDataUrl = canvas.toDataURL('image/png');

                // Trigger download
                const link = document.createElement('a');
                link.download = `barcode-${userId}.png`;
                link.href = pngDataUrl;
                link.click();
            } else {
                console.error("Could not get canvas context.");
            }
        };

        img.onerror = (err) => {
            console.error("Error loading SVG data URL into image:", err);
        }
        img.src = svgDataUrl;
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <div className="flex items-center justify-center p-1 bg-[#00000000] rounded cursor-pointer hover:opacity-80 transition-opacity">
                            <Barcode
                                value={userId}
                                height={20}
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

            <DialogContent
                className="sm:max-w-[340px] bg-background/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300"
            >
                <DialogHeader className="mb-2 text-center">
                    <DialogTitle className="text-xl font-semibold">
                        Scan User ID
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={barcodeRef}
                    className="bg-white p-2 rounded-md shadow-md border"
                >
                    <Barcode
                        value={userId}
                        height={100}
                        width={2.5}
                        displayValue={false}
                        lineColor="#000000"
                        background="#ffffff"
                    />
                </div>

                <DyraneButton
                    onClick={handleDownloadSVG}
                    variant={'default'}                >
                    Download Barcode
                </DyraneButton>
            </DialogContent>

        </Dialog>
    );
};