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

	// Create a new style element with print-specific styles
	const printStyles = document.createElement("style");
	printStyles.textContent = `
    @media print {
      body * {
        visibility: hidden;
      }
      #${receiptElementId}, #${receiptElementId} * {
        visibility: visible;
      }
      #${receiptElementId} {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .rounded, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-full {
        border-radius: 0 !important;
      }
      .shadow, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl {
        box-shadow: none !important;
      }
    }
  `;

	// Add the style element to the document head
	document.head.appendChild(printStyles);

	// Print the document
	window.print();

	// Remove the style element after printing
	document.head.removeChild(printStyles);
};

/**
 * Creates a simplified version of the receipt for rendering
 * @param payment Payment record
 * @returns HTML string of the simplified receipt
 */
export const createSimplifiedReceipt = (payment: PaymentRecord): string => {
	const receiptNumber = getReceiptNumber(payment);
	const formattedDate = formatDate(payment.createdAt);

	// Helper for status badge
	const getStatusText = (status: PaymentRecord["status"]) => {
		switch (status) {
			case "succeeded":
				return "✓ Succeeded";
			case "pending":
				return "⟳ Pending";
			case "failed":
				return "✗ Failed";
			case "refunded":
				return "⚠ Refunded";
			default:
				return status;
		}
	};

	// Format items
	let itemsHtml = "";
	if (payment.receiptItems && payment.receiptItems.length > 0) {
		payment.receiptItems.forEach((item) => {
			itemsHtml += `
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 12px; text-align: left;">
            <div style="font-weight: 500;">${item.name}</div>
            ${item.description ? `<div style="font-size: 0.875rem; color: #64748b;">${item.description}</div>` : ""}
          </td>
          <td style="padding: 12px; text-align: right;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">${formatCurrency(item.unitPrice, payment.currency)}</td>
          <td style="padding: 12px; text-align: right;">${formatCurrency(item.totalPrice, payment.currency)}</td>
        </tr>
      `;
		});
	} else {
		itemsHtml = `
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left;">
          <div style="font-weight: 500;">${payment.description}</div>
        </td>
        <td style="padding: 12px; text-align: right;">1</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(payment.amount, payment.currency)}</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(payment.amount, payment.currency)}</td>
      </tr>
    `;
	}

	// Create billing details
	let billingDetailsHtml = "";
	if (payment.billingDetails) {
		billingDetailsHtml = `
      <p style="font-weight: 500;">${payment.billingDetails.name}</p>
      <p>${payment.billingDetails.email}</p>
      ${payment.billingDetails.phone ? `<p>${payment.billingDetails.phone}</p>` : ""}
      ${payment.billingDetails.address ? `<p>${payment.billingDetails.address}</p>` : ""}
    `;
	} else {
		billingDetailsHtml = `<p>${payment.userName || payment.userId}</p>`;
	}

	// Create the full HTML
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${payment.id}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: #1e293b;
          background-color: white;
          margin: 0;
          padding: 20px;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          border: 1px solid #e2e8f0;
          background-color: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .logo-container {
          display: flex;
          align-items: center;
		  border-radius: 9999px;
		  background-color: 'gold';
        }
        .logo {
          width: 48px;
          height: 48px;
          margin-right: 12px;
          background-color: #f1f5f9;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .separator {
          height: 1px;
          background-color: #e2e8f0;
          margin: 24px 0;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .details-section h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead {
          background-color: #f1f5f9;
        }
        th {
          padding: 8px 16px;
          text-align: left;
          font-size: 0.875rem;
        }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {
          text-align: right;
        }
        tfoot {
          background-color: #f8fafc;
        }
        tfoot td {
          padding: 8px 16px;
        }
        .footer {
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 24px;
        }
        .status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: #f1f5f9;
        }
        .status.succeeded { background-color: #dcfce7; color: #166534; }
        .status.pending { background-color: #fef9c3; color: #854d0e; }
        .status.failed { background-color: #fee2e2; color: #b91c1c; }
        .status.refunded { background-color: #f3f4f6; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="logo-container">
            <div class="logo">1T</div>
            <div>
              <h2 style="margin: 0; font-size: 1.25rem;">1Tech Academy</h2>
              <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Payment Receipt</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.875rem; font-weight: 500;">Receipt #: ${receiptNumber}</p>
            <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Date: ${formattedDate}</p>
          </div>
        </div>
        
        <div class="separator"></div>
        
        <div class="details-grid">
          <div class="details-section">
            <h3>Payment Information</h3>
            <p style="margin: 0; font-weight: 500;">Transaction ID: ${payment.providerReference}</p>
            <p style="margin: 0;">Payment Method: ${payment.provider} ${
							payment.cardType
								? `(${payment.cardType}${payment.last4 ? ` **** ${payment.last4}` : ""})`
								: ""
						}</p>
            <p style="margin: 0;">Status: <span class="status ${payment.status}">${getStatusText(payment.status)}</span></p>
          </div>
          
          <div class="details-section">
            <h3>Billing Details</h3>
            ${billingDetailsHtml}
          </div>
        </div>
        
        <div class="separator"></div>
        
        <div>
          <h3 style="font-size: 0.875rem; color: #64748b; margin-bottom: 8px;">Items</h3>
          
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td colspan="3" style="text-align: right; font-weight: 500; padding: 8px 16px;">Total</td>
                  <td style="text-align: right; font-weight: 700; padding: 8px 16px;">${formatCurrency(payment.amount, payment.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">Thank you for your payment!</p>
          <p style="margin: 0;">For any questions, please contact support@1techacademy.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Downloads the receipt as an image using a new window approach
 * @param payment Payment record
 */
export const downloadReceiptAsImage = async (
	payment: PaymentRecord
): Promise<void> => {
	try {
		// Create simplified HTML receipt
		const receiptHtml = createSimplifiedReceipt(payment);

		// Open a new window with the receipt
		const receiptWindow = window.open("", "_blank");
		if (!receiptWindow) {
			throw new Error(
				"Could not open receipt window. Please check if popup blocker is enabled."
			);
		}

		// Write the receipt HTML to the new window
		receiptWindow.document.write(receiptHtml);
		receiptWindow.document.close();

		// Add script to handle download in the new window
		receiptWindow.document.body.insertAdjacentHTML(
			"beforeend",
			`
      <script>
        // Wait for images to load
        window.onload = function() {
          // Add download instructions
          const instructions = document.createElement('div');
          instructions.style.position = 'fixed';
          instructions.style.bottom = '0';
          instructions.style.left = '0';
          instructions.style.right = '0';
          instructions.style.padding = '10px';
          instructions.style.backgroundColor = '#f0f9ff';
          instructions.style.borderTop = '1px solid #bae6fd';
          instructions.style.textAlign = 'center';
          instructions.style.zIndex = '9999';
          instructions.innerHTML = '<p style="margin: 0; font-weight: bold;">To save as image: Right-click anywhere on the receipt and select "Save as..." or take a screenshot.</p>';
          document.body.appendChild(instructions);
          
          // Add print button
          const printButton = document.createElement('button');
          printButton.innerText = 'Print Receipt';
          printButton.style.position = 'fixed';
          printButton.style.top = '10px';
          printButton.style.right = '10px';
          printButton.style.padding = '8px 16px';
          printButton.style.backgroundColor = '#0ea5e9';
          printButton.style.color = 'white';
          printButton.style.border = 'none';
          printButton.style.borderRadius = '4px';
          printButton.style.cursor = 'pointer';
          printButton.onclick = function() {
            instructions.style.display = 'none';
            printButton.style.display = 'none';
            window.print();
            setTimeout(() => {
              instructions.style.display = 'block';
              printButton.style.display = 'block';
            }, 1000);
          };
          document.body.appendChild(printButton);
        };
      </script>
    `
		);
	} catch (error) {
		console.error("Error generating receipt image:", error);
		throw error;
	}
};
