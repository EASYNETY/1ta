'use client'

import React from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  FileText, 
  AlertCircle, 
  HelpCircle, 
  Eye, 
  ChevronRight 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  ArticleHeader, 
  ArticleFooter, 
  HelpCallout, 
  RelatedTopics, 
  RoleContent,
  StepByStepGuide,
  Step,
  HelpImage,
  TableOfContents
} from '@/components/help';

// Define related topics for this help article
const relatedTopics = [
  { 
    title: 'Payment Methods', 
    href: '/help/payments/methods',
    description: 'Learn about available payment options'
  },
  { 
    title: 'Receipts and Invoices', 
    href: '/help/payments/receipts',
    description: 'Access and download payment documentation'
  },
  { 
    title: 'Course Enrollment', 
    href: '/help/courses/enrollment',
    description: 'Learn how to enrol in courses'
  },
];

export default function PaymentHistoryHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Payment History"
        icon={ClipboardList}
        description="Learn how to view, search, and manage your payment records."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Payments', href: '/help/payments' },
          { label: 'Payment History' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Your payment history provides a comprehensive record of all transactions you've made on the platform.
        This guide explains how to access, search, and manage your payment records.
      </p>

      <HelpCallout type="note" title="Record Keeping">
        Payment records are maintained for all transactions, providing transparency and documentation
        for your educational expenses. These records can be useful for personal budgeting, reimbursement
        claims, or tax purposes.
      </HelpCallout>

      {/* Accessing Payment History */}
      <h2 id="accessing-history" className="text-2xl font-bold mt-8">Accessing Payment History</h2>
      <Separator className="my-2" />
      <p>
        You can access your payment history through your account settings or the payments section.
      </p>

      <StepByStepGuide title="Accessing Your Payment History" description="Follow these steps to view your payment records:">
        <Step number={1} title="Navigate to Account">
          Click on your profile picture in the top-right corner to open the account menu.
        </Step>
        <Step number={2} title="Select Payments">
          Click on "Payments" or "Payment History" in the dropdown menu.
        </Step>
        <Step number={3} title="View History">
          The payment history page displays all your transactions, with the most recent at the top.
        </Step>
        <Step number={4} title="Alternative Access">
          You can also access payment history from the "Billing" or "Payments" section in your account settings.
        </Step>
      </StepByStepGuide>

      {/* Understanding Payment Records */}
      <h2 id="understanding-records" className="text-2xl font-bold mt-8">Understanding Payment Records</h2>
      <Separator className="my-2" />
      <p>
        Each payment record contains specific information about the transaction.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Payment Record Details
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Transaction ID</strong>
              <p className="text-sm text-muted-foreground">A unique identifier for the transaction, useful for reference in support inquiries.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Date and Time</strong>
              <p className="text-sm text-muted-foreground">When the transaction was processed.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Description</strong>
              <p className="text-sm text-muted-foreground">What the payment was for, typically the course name.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Amount</strong>
              <p className="text-sm text-muted-foreground">The payment amount and currency.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
            <div>
              <strong>Payment Method</strong>
              <p className="text-sm text-muted-foreground">The method used for payment (e.g., credit card, bank transfer).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">6</div>
            <div>
              <strong>Status</strong>
              <p className="text-sm text-muted-foreground">The current status of the transaction (e.g., successful, pending, refunded).</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Searching and Filtering */}
      <h2 id="searching-filtering" className="text-2xl font-bold mt-8">Searching and Filtering</h2>
      <Separator className="my-2" />
      <p>
        You can search and filter your payment history to find specific transactions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Search by Keyword</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the search bar to find transactions by course name, transaction ID, or other keywords.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Filter by Date</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the date filter to view transactions from a specific time period.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Filter by Status</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Filter transactions by their status (successful, pending, refunded, etc.).
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Filter by Amount</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Sort or filter transactions by amount to find specific payments.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Searching Your Payment History" description="Follow these steps to find specific transactions:">
        <Step number={1} title="Access Payment History">
          Navigate to your payment history page as described earlier.
        </Step>
        <Step number={2} title="Use Search Bar">
          Enter keywords in the search bar at the top of the payment history page.
        </Step>
        <Step number={3} title="Apply Filters">
          Click on the filter icon to access filtering options:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Select a date range using the calendar picker</li>
            <li>Choose transaction status from the dropdown menu</li>
            <li>Select payment method if needed</li>
          </ul>
        </Step>
        <Step number={4} title="Apply and Reset">
          Click "Apply Filters" to see filtered results or "Reset" to clear all filters.
        </Step>
      </StepByStepGuide>

      {/* Viewing Transaction Details */}
      <h2 id="transaction-details" className="text-2xl font-bold mt-8">Viewing Transaction Details</h2>
      <Separator className="my-2" />
      <p>
        You can view detailed information about each transaction in your payment history.
      </p>

      <StepByStepGuide title="Viewing Transaction Details" description="Follow these steps to see detailed information about a transaction:">
        <Step number={1} title="Find the Transaction">
          Locate the transaction you want to view in your payment history list.
        </Step>
        <Step number={2} title="Click View Details">
          Click on the "View Details" button or the transaction row itself to open the detailed view.
        </Step>
        <Step number={3} title="Review Information">
          The transaction details page shows comprehensive information about the payment:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Complete transaction details</li>
            <li>Payment processor information</li>
            <li>Course details</li>
            <li>Billing information</li>
          </ul>
        </Step>
        <Step number={4} title="Access Receipt">
          From the details page, you can also download or view the receipt for the transaction.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Transaction References">
        When contacting support about a payment issue, always include the Transaction ID
        from your payment history to help them locate and address your concern quickly.
      </HelpCallout>

      {/* Downloading Payment Records */}
      <h2 id="downloading-records" className="text-2xl font-bold mt-8">Downloading Payment Records</h2>
      <Separator className="my-2" />
      <p>
        You can download your payment history for record-keeping or financial tracking purposes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Download Individual Receipts</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Download receipts for individual transactions from the transaction details page.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Export Payment History</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your entire payment history or filtered results in CSV or PDF format.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Exporting Payment History" description="Follow these steps to export your payment records:">
        <Step number={1} title="Access Payment History">
          Navigate to your payment history page.
        </Step>
        <Step number={2} title="Apply Filters (Optional)">
          If you only want to export specific transactions, apply the relevant filters first.
        </Step>
        <Step number={3} title="Click Export">
          Click the "Export" or "Download" button, usually located at the top of the payment history page.
        </Step>
        <Step number={4} title="Select Format">
          Choose your preferred export format:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>CSV - For importing into spreadsheet software</li>
            <li>PDF - For a formatted document suitable for printing</li>
          </ul>
        </Step>
        <Step number={5} title="Save File">
          Select a location on your device to save the exported file.
        </Step>
      </StepByStepGuide>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting</h2>
      <Separator className="my-2" />
      <p>
        If you encounter issues with your payment history, here are some common problems and solutions.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Issue</th>
              <th className="border px-4 py-2 text-left">Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Missing Transaction</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check if you're logged into the correct account</li>
                  <li>Try clearing filters and searching by date</li>
                  <li>Allow up to 24 hours for recent transactions to appear</li>
                  <li>Contact support with transaction details if still missing</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Incorrect Transaction Status</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Refresh the page to see the latest status</li>
                  <li>Check your email for payment confirmations</li>
                  <li>Allow time for status updates to process</li>
                  <li>Contact support if status remains incorrect</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Export Errors</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Try a different browser</li>
                  <li>Export smaller date ranges</li>
                  <li>Check your download settings</li>
                  <li>Try a different export format</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="important" title="Payment Discrepancies">
        If you notice any discrepancies in your payment history, such as incorrect amounts or
        duplicate charges, contact support immediately with the transaction details.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, your payment history helps you track your educational expenses:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Regularly review your payment history to ensure all transactions are accurate</li>
              <li>Download receipts for courses that qualify for tax deductions or reimbursements</li>
              <li>Use payment history to track your educational spending over time</li>
              <li>Keep transaction IDs handy when contacting support about payment issues</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, understanding payment history can help you assist students:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Familiarize yourself with how payment records appear to help guide students</li>
              <li>Direct students to the appropriate support channels for payment history issues</li>
              <li>Understand how course enrollments relate to payment records</li>
              <li>Be aware of the institution's policies regarding payment verification</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you have additional tools for managing payment records:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access comprehensive payment reports across all users</li>
              <li>Configure payment history retention policies</li>
              <li>Set up automated payment reconciliation processes</li>
              <li>Establish procedures for handling payment disputes and discrepancies</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Payment Methods",
          href: "/help/payments/methods"
        }}
        nextArticle={{
          title: "Receipts and Invoices",
          href: "/help/payments/receipts"
        }}
      />
    </article>
  );
}
