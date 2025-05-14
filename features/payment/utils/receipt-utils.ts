// features/payment/utils/receipt-utils.ts

import type { PaymentRecord } from "../types/payment-types";

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
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
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
		return new Intl.DateTimeFormat("en-NG", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	} catch {
		return dateString || "N/A";
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
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `RCPT-${payment.id.replace(/[^0-9]/g, "")}-${year}${month}${day}`;
};

/**
 * Prints the receipt using browser's print functionality
 * @param receiptElementId ID of the receipt element to print
 */
export const printReceipt = (receiptElementId: string): void => {
	const receiptElement = document.getElementById(receiptElementId);
	if (!receiptElement) {
		console.error("Receipt element not found");
		return;
	}

	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		console.error("Could not open print window");
		return;
	}

	printWindow.document.write(`
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt-container { max-width: 800px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .mt-6 { margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${receiptElement.innerHTML}
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);

	printWindow.document.close();
};

/**
 * Downloads the receipt as a PDF using html2pdf library
 * @param receiptElementId ID of the receipt element
 * @param payment Payment record for naming the file
 */
export const downloadReceiptAsPDF = async (
	receiptElementId: string,
	payment: PaymentRecord
): Promise<void> => {
	const receiptElement = document.getElementById(receiptElementId);
	if (!receiptElement) {
		console.error("Receipt element not found");
		return;
	}

	try {
		// Dynamically import html2pdf.js
		const html2pdf = (await import("html2pdf.js")).default;

		const opt = {
			margin: 10,
			filename: `payment-receipt-${payment.id}.pdf`,
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2, useCORS: true },
			jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
		};

		// Create a clone of the receipt element to avoid modifying the original
		const clone = receiptElement.cloneNode(true) as HTMLElement;
		document.body.appendChild(clone);
		clone.style.position = "absolute";
		clone.style.left = "-9999px";
		clone.style.width = `${receiptElement.offsetWidth}px`;
		clone.style.background = "white";

		await html2pdf().from(clone).set(opt).save();

		// Clean up the clone
		document.body.removeChild(clone);
	} catch (error) {
		console.error("Error generating PDF:", error);
		throw new Error("Failed to generate PDF");
	}
};

/**
 * Downloads the receipt as an image using dom-to-image
 * @param receiptElementId ID of the receipt element
 * @param payment Payment record for naming the file
 */
export const downloadReceiptAsImage = async (
	receiptElementId: string,
	payment: PaymentRecord
): Promise<void> => {
	const receiptElement = document.getElementById(receiptElementId);
	if (!receiptElement) {
		console.error("Receipt element not found");
		return;
	}

	try {
		// Dynamically import dom-to-image
		const domtoimage = (await import("dom-to-image")).default;

		// Create a clone of the receipt element to avoid modifying the original
		const clone = receiptElement.cloneNode(true) as HTMLElement;
		document.body.appendChild(clone);

		// Set styles for the clone to ensure proper rendering
		clone.style.position = "absolute";
		clone.style.left = "-9999px";
		clone.style.width = `${receiptElement.offsetWidth}px`;
		clone.style.background = "white";

		// Generate PNG blob
		const dataUrl = await domtoimage.toPng(clone, {
			quality: 1,
			bgcolor: "white",
			style: {
				transform: "scale(2)", // Increase quality
			},
			filter: (node: Node) => {
				return true; // Keep all nodes
			},
		});

		// Clean up the clone
		document.body.removeChild(clone);

		// Create download link
		const link = document.createElement("a");
		link.download = `payment-receipt-${payment.id}.png`;
		link.href = dataUrl;
		link.click();
	} catch (error) {
		console.error("Error generating image:", error);
		throw new Error("Failed to generate image");
	}
};
