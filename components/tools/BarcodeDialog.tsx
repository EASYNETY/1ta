'use client';

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
        if (!el) return;

        const originalBg = el.style.backgroundColor;
        el.style.backgroundColor = '#ffffff';

        html2canvas(el).then((canvas) => {
            const link = document.createElement('a');
            link.download = `barcode-${userId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            el.style.backgroundColor = originalBg;
        });
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <div className="flex items-center justify-center p-1 bg-transparent backdrop-blur-sm rounded cursor-pointer hover:opacity-80 transition-opacity">
                            <Barcode
                                value={userId}
                                height={22.85} // mm scale look
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

            <DialogContent className="sm:max-w-[300px] bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-center text-lg font-medium">Scan User ID</DialogTitle>
                </DialogHeader>

                <div ref={barcodeRef} style={{ backgroundColor: '#ffffff', padding: '1rem' }}>
                    <Barcode
                        value={userId}
                        height={100}
                        width={3}
                        displayValue={false}
                        lineColor="#000000"
                        background="#ffffff"
                    />
                </div>

                <Button className="mt-4" onClick={handleDownload}>
                    Download Barcode
                </Button>
            </DialogContent>
        </Dialog>
    );
};
