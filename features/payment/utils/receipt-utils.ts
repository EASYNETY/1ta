// features/payment/utils/receipt-utils.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { PaymentRecord } from '../types/payment-types';

/**
 * Formats a currency amount for display
 * @param amount Amount in smallest unit (e.g., kobo/cents)
 * @param currency Currency code (e.g., NGN, USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string): string => {
  // Convert from smallest unit to major unit
  const majorAmount = amount / 100;
  
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(majorAmount);
  } catch {
    // Fallback for unknown currency
    return `${currency} ${majorAmount.toFixed(2)}`;
  }
};

/**
 * Formats a date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString || 'N/A';
  }
};

/**
 * Generates a receipt number if one doesn't exist
 * @param payment Payment record
 * @returns Receipt number
 */
export const getReceiptNumber = (payment: PaymentRecord): string => {
  if (payment.receiptNumber) return payment.receiptNumber;
  
  // Generate a receipt number based on payment ID and date
  const date = new Date(payment.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `RCPT-${payment.id.replace(/[^0-9]/g, '')}-${year}${month}${day}`;
};

/**
 * Prints the receipt using browser's print functionality
 * @param receiptElementId ID of the receipt element to print
 */
export const printReceipt = (receiptElementId: string): void => {
  const receiptElement = document.getElementById(receiptElementId);
  if (!receiptElement) {
    console.error('Receipt element not found');
    return;
  }
  
  const originalContents = document.body.innerHTML;
  const printContents = receiptElement.innerHTML;
  
  document.body.innerHTML = `
    <div class="print-only">${printContents}</div>
    <style>
      @media print {
        body { margin: 0; padding: 15mm; }
        .print-only { width: 100%; }
      }
    </style>
  `;
  
  window.print();
  document.body.innerHTML = originalContents;
  
  // Reload the page to restore all event listeners and state
  window.location.reload();
};

/**
 * Downloads the receipt as a PDF
 * @param receiptElementId ID of the receipt element to download
 * @param payment Payment record for naming the file
 */
export const downloadReceiptAsPDF = async (
  receiptElementId: string,
  payment: PaymentRecord
): Promise<void> => {
  const receiptElement = document.getElementById(receiptElementId);
  if (!receiptElement) {
    console.error('Receipt element not found');
    return;
  }
  
  try {
    // Set background color to white for better PDF rendering
    const originalBackground = receiptElement.style.backgroundColor;
    receiptElement.style.backgroundColor = 'white';
    
    // Capture the receipt as canvas
    const canvas = await html2canvas(receiptElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    // Restore original background
    receiptElement.style.backgroundColor = originalBackground;
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Calculate dimensions to fit the receipt in the PDF
    const imgWidth = 210; // A4 width in mm (portrait)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Generate filename
    const receiptNumber = getReceiptNumber(payment);
    const filename = `Receipt_${receiptNumber}.pdf`;
    
    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

/**
 * Downloads the receipt as an image
 * @param receiptElementId ID of the receipt element to download
 * @param payment Payment record for naming the file
 */
export const downloadReceiptAsImage = async (
  receiptElementId: string,
  payment: PaymentRecord
): Promise<void> => {
  const receiptElement = document.getElementById(receiptElementId);
  if (!receiptElement) {
    console.error('Receipt element not found');
    return;
  }
  
  try {
    // Set background color to white for better image rendering
    const originalBackground = receiptElement.style.backgroundColor;
    receiptElement.style.backgroundColor = 'white';
    
    // Capture the receipt as canvas
    const canvas = await html2canvas(receiptElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    // Restore original background
    receiptElement.style.backgroundColor = originalBackground;
    
    // Generate filename
    const receiptNumber = getReceiptNumber(payment);
    const filename = `Receipt_${receiptNumber}.png`;
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error generating image:', error);
  }
};
