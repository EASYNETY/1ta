'use client'

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Mail, 
  Search, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
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
    title: 'Payment History', 
    href: '/help/payments/history',
    description: 'View and manage your payment records'
  },
  { 
    title: 'Course Enrollment', 
    href: '/help/courses/enrollment',
    description: 'Learn how to enroll in courses'
  },
];

export default function ReceiptsInvoicesHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Receipts and Invoices"
        icon={FileText}
        description="Learn how to access, download, and share payment documentation for your course purchases."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Payments', href: '/help/payments' },
          { label: 'Receipts and Invoices' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        After completing a payment for a course, you'll receive a receipt as proof of purchase.
        This guide explains how to access, download, and manage your receipts and invoices.
      </p>

      <HelpCallout type="note" title="Documentation Types">
        The platform primarily provides receipts for completed transactions. Invoices may be
        available for institutional or corporate purchases. This guide covers both types of
        payment documentation.
      </HelpCallout>

      {/* Understanding Receipts and Invoices */}
      <h2 id="understanding-documents" className="text-2xl font-bold mt-8">Understanding Receipts and Invoices</h2>
      <Separator className="my-2" />
      <p>
        Receipts and invoices serve as official records of your transactions on the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Receipts</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Provided immediately after a successful payment, confirming the transaction details and serving as proof of purchase.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Invoices</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Formal billing documents that may be required for institutional purchases or reimbursement claims.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Information Included in Receipts
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Transaction Details</strong>
              <p className="text-sm text-muted-foreground">Transaction ID, date, time, and payment method used.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Course Information</strong>
              <p className="text-sm text-muted-foreground">Course name, instructor, and any relevant course identifiers.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Payment Breakdown</strong>
              <p className="text-sm text-muted-foreground">Course price, any applicable taxes, and the total amount paid.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Buyer Information</strong>
              <p className="text-sm text-muted-foreground">Your name and email address as registered on the platform.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
            <div>
              <strong>Merchant Information</strong>
              <p className="text-sm text-muted-foreground">The institution's name, contact information, and any applicable tax identification numbers.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Accessing Receipts */}
      <h2 id="accessing-receipts" className="text-2xl font-bold mt-8">Accessing Receipts</h2>
      <Separator className="my-2" />
      <p>
        There are several ways to access your receipts on the platform.
      </p>

      <StepByStepGuide title="Accessing Your Receipts" description="Follow these steps to find and view your receipts:">
        <Step number={1} title="Email Confirmation">
          Immediately after purchase, a receipt is sent to your registered email address.
        </Step>
        <Step number={2} title="From Payment History">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Navigate to your payment history (Account → Payments)</li>
            <li>Find the transaction you need a receipt for</li>
            <li>Click "View Receipt" or a similar option</li>
          </ul>
        </Step>
        <Step number={3} title="From Course Dashboard">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Go to your enrolled courses</li>
            <li>Select the relevant course</li>
            <li>Look for a "Payment Information" or "Receipt" option</li>
          </ul>
        </Step>
        <Step number={4} title="From Account Settings">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Go to Account Settings</li>
            <li>Select "Billing" or "Purchase History"</li>
            <li>Find the transaction and click "View Receipt"</li>
          </ul>
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Email Search">
        If you can't find a receipt on the platform, search your email inbox for messages from
        the platform domain or with keywords like "receipt," "payment," or the course name.
      </HelpCallout>

      {/* Downloading and Printing */}
      <h2 id="downloading-printing" className="text-2xl font-bold mt-8">Downloading and Printing</h2>
      <Separator className="my-2" />
      <p>
        You can download and print your receipts for record-keeping or reimbursement purposes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Download as PDF</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Save the receipt as a PDF file for digital record-keeping or sharing.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Download as HTML</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Save the receipt as an HTML file that can be opened in any web browser.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Downloading a Receipt" description="Follow these steps to download your receipt:">
        <Step number={1} title="Access the Receipt">
          Find and open the receipt using one of the methods described earlier.
        </Step>
        <Step number={2} title="Click Download">
          Look for a download button or icon, typically represented by a downward arrow.
        </Step>
        <Step number={3} title="Select Format">
          Choose your preferred format (PDF or HTML) if prompted.
        </Step>
        <Step number={4} title="Save File">
          Select a location on your device to save the receipt.
        </Step>
      </StepByStepGuide>

      <StepByStepGuide title="Printing a Receipt" description="Follow these steps to print your receipt:">
        <Step number={1} title="Access the Receipt">
          Find and open the receipt using one of the methods described earlier.
        </Step>
        <Step number={2} title="Click Print">
          Look for a print button or icon, typically represented by a printer symbol.
        </Step>
        <Step number={3} title="Adjust Settings">
          In the print dialog, adjust any necessary settings such as paper size or orientation.
        </Step>
        <Step number={4} title="Complete Printing">
          Click "Print" to send the document to your printer.
        </Step>
      </StepByStepGuide>

      {/* Sharing Receipts */}
      <h2 id="sharing-receipts" className="text-2xl font-bold mt-8">Sharing Receipts</h2>
      <Separator className="my-2" />
      <p>
        You may need to share receipts with employers, educational institutions, or tax professionals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Email Receipt</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Send the receipt directly to an email address from within the platform.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Share Link</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a temporary link to the receipt that can be shared with others.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Sharing a Receipt" description="Follow these steps to share your receipt:">
        <Step number={1} title="Access the Receipt">
          Find and open the receipt using one of the methods described earlier.
        </Step>
        <Step number={2} title="Click Share">
          Look for a share button or icon, typically represented by an arrow or share symbol.
        </Step>
        <Step number={3} title="Choose Sharing Method">
          Select your preferred sharing method:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Email: Enter the recipient's email address</li>
            <li>Link: Generate a shareable link</li>
            <li>Download and share manually</li>
          </ul>
        </Step>
        <Step number={4} title="Add Message (Optional)">
          If sharing via email, you may have the option to add a personal message.
        </Step>
        <Step number={5} title="Complete Sharing">
          Click "Send" or "Share" to complete the process.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Link Expiration">
        If you share a receipt via a generated link, be aware that the link may expire after
        a certain period for security reasons. Download the receipt for permanent access.
      </HelpCallout>

      {/* Requesting Additional Documentation */}
      <h2 id="requesting-documentation" className="text-2xl font-bold mt-8">Requesting Additional Documentation</h2>
      <Separator className="my-2" />
      <p>
        In some cases, you may need additional or specialized payment documentation.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          When You Might Need Additional Documentation
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Corporate Reimbursement</strong>
              <p className="text-sm text-muted-foreground">Your employer may require specific invoice formats or additional details.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Tax Deductions</strong>
              <p className="text-sm text-muted-foreground">You may need detailed documentation for educational expense deductions.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Institutional Purchases</strong>
              <p className="text-sm text-muted-foreground">Educational institutions may require formal invoices with specific information.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Missing or Damaged Receipts</strong>
              <p className="text-sm text-muted-foreground">You may need to request a replacement for lost or unreadable receipts.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Requesting Additional Documentation" description="Follow these steps to request specialized documentation:">
        <Step number={1} title="Contact Support">
          Reach out to the platform's support team through the help or contact section.
        </Step>
        <Step number={2} title="Provide Transaction Details">
          Include the transaction ID, date, and course name in your request.
        </Step>
        <Step number={3} title="Specify Requirements">
          Clearly explain what type of documentation you need and why.
        </Step>
        <Step number={4} title="Include Additional Information">
          If applicable, provide any specific format requirements or additional details needed.
        </Step>
        <Step number={5} title="Allow Processing Time">
          Be aware that special documentation requests may take time to process.
        </Step>
      </StepByStepGuide>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting</h2>
      <Separator className="my-2" />
      <p>
        If you encounter issues with your receipts or invoices, here are some common problems and solutions.
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
              <td className="border px-4 py-2">Missing Receipt</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check your email, including spam/junk folders</li>
                  <li>Verify the transaction in your payment history</li>
                  <li>Allow up to 24 hours for receipt generation</li>
                  <li>Contact support with transaction details if still missing</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Incorrect Information</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Verify your account information is correct</li>
                  <li>Contact support with the specific corrections needed</li>
                  <li>Provide the transaction ID and details of the error</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Download/Print Errors</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Try using a different browser</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try a different download format</li>
                  <li>Check if you have the necessary software to open the file</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="important" title="Receipt Discrepancies">
        If you notice any discrepancies in your receipt, such as incorrect amounts or
        course information, contact support immediately for assistance.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, proper receipt management helps with educational expense tracking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Save receipts in an organized digital folder for easy access</li>
              <li>Check if your courses qualify for tax deductions in your jurisdiction</li>
              <li>Follow your employer's specific requirements if seeking reimbursement</li>
              <li>Keep receipts for the duration required by tax authorities in your region</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, understanding receipt processes helps you guide students:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be familiar with how receipts appear to help answer basic student questions</li>
              <li>Know the process for requesting specialized documentation</li>
              <li>Understand how course information appears on receipts</li>
              <li>Direct students to appropriate support channels for complex receipt issues</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you manage receipt and invoice generation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configure receipt templates and required information</li>
              <li>Set up automated receipt delivery systems</li>
              <li>Establish processes for handling specialized documentation requests</li>
              <li>Ensure compliance with tax and financial regulations for receipts</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Payment History",
          href: "/help/payments/history"
        }}
        nextArticle={{
          title: "Updating Your Profile",
          href: "/help/account/profile"
        }}
      />
    </article>
  );
}
