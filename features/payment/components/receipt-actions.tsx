"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Image } from 'lucide-react';
import { 
  printReceipt, 
  downloadReceiptAsPDF, 
  downloadReceiptAsImage 
} from '../utils/receipt-utils';
import type { PaymentRecord } from '../types/payment-types';
import { toast } from 'sonner';

interface ReceiptActionsProps {
  payment: PaymentRecord;
  receiptElementId: string;
  className?: string;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({ 
  payment, 
  receiptElementId,
  className = ''
}) => {
  const handlePrint = () => {
    try {
      printReceipt(receiptElementId);
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Failed to print receipt. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadReceiptAsPDF(receiptElementId, payment);
      toast.success('Receipt downloaded as PDF');
    } catch (error) {
      console.error('Error downloading receipt as PDF:', error);
      toast.error('Failed to download receipt as PDF. Please try again.');
    }
  };

  const handleDownloadImage = async () => {
    try {
      await downloadReceiptAsImage(receiptElementId, payment);
      toast.success('Receipt downloaded as image');
    } catch (error) {
      console.error('Error downloading receipt as image:', error);
      toast.error('Failed to download receipt as image. Please try again.');
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
        className="flex items-center gap-1"
      >
        <Printer className="h-4 w-4" />
        <span>Print</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownloadPDF}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        <span>PDF</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownloadImage}
        className="flex items-center gap-1"
      >
        <Image className="h-4 w-4" />
        <span>Image</span>
      </Button>
    </div>
  );
};
