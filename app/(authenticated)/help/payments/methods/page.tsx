'use client'

import React from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  HelpCircle, 
  ChevronsRight, 
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
    title: 'Payment History', 
    href: '/help/payments/history',
    description: 'View and manage your payment records'
  },
  { 
    title: 'Receipts and Invoices', 
    href: '/help/payments/receipts',
    description: 'Access and download payment documentation'
  },
  { 
    title: 'Course Enrolment', 
    href: '/help/courses/enrolment',
    description: 'Learn how to enrol in courses'
  },
];

export default function PaymentMethodsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Payment Methods"
        icon={CreditCard}
        description="Learn about the available payment options for courses and how to use them securely."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Payments', href: '/help/payments' },
          { label: 'Payment Methods' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        The platform uses Paystack as the payment processor to handle course payments securely.
        This guide explains the available payment methods, how to use them, and answers common
        payment-related questions.
      </p>

      <HelpCallout type="note" title="Per-Course Payments">
        The platform charges per course rather than using a subscription model. You only pay for
        the specific courses you want to enrol in, with no recurring charges.
      </HelpCallout>

      {/* Available Payment Methods */}
      <h2 id="available-methods" className="text-2xl font-bold mt-8">Available Payment Methods</h2>
      <Separator className="my-2" />
      <p>
        Paystack supports several payment methods to accommodate different preferences and banking options.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Credit/Debit Cards</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Pay using Visa, Mastercard, or Verve cards issued by any bank.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Bank Transfers</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Make direct transfers from your bank account to complete payment.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChevronsRight className="h-5 w-5 text-primary" />
            <h4 className="font-medium">USSD Payments</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use bank USSD codes to make payments directly from your mobile phone.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Mobile Money</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Pay using mobile money services where available.
          </p>
        </div>
      </div>

      {/* Making a Payment */}
      <h2 id="making-payment" className="text-2xl font-bold mt-8">Making a Payment</h2>
      <Separator className="my-2" />
      <p>
        The payment process is straightforward and secure. Here's how to make a payment for a course.
      </p>

      <StepByStepGuide title="Making a Course Payment" description="Follow these steps to pay for a course:">
        <Step number={1} title="Select a Course">
          Browse the available courses and click on the one you want to enrol in.
        </Step>
        <Step number={2} title="Review Course Details">
          Check the course description, schedule, and price to ensure it meets your needs.
        </Step>
        <Step number={3} title="Click Enrol">
          Click the "Enrol Now" or "Add to Cart" button to proceed to checkout.
        </Step>
        <Step number={4} title="Review Cart">
          Review your cart to confirm the course selection and total amount.
        </Step>
        <Step number={5} title="Proceed to Checkout">
          Click "Proceed to Checkout" to begin the payment process.
        </Step>
        <Step number={6} title="Enter Payment Details">
          Select your preferred payment method and enter the required information.
        </Step>
        <Step number={7} title="Complete Payment">
          Follow the prompts to complete your payment through the Paystack secure gateway.
        </Step>
        <Step number={8} title="Confirmation">
          Once payment is successful, you'll receive a confirmation message and receipt.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Save Payment Method">
        You can save your payment method securely for future transactions by checking the
        "Save this card for future payments" option during checkout.
      </HelpCallout>

      {/* Card Payment Details */}
      <h2 id="card-payments" className="text-2xl font-bold mt-8">Card Payment Details</h2>
      <Separator className="my-2" />
      <p>
        When paying with a credit or debit card, you'll need to provide specific information to complete the transaction.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Required Card Information
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Card Number</strong>
              <p className="text-sm text-muted-foreground">The 16-digit number on the front of your card.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Expiration Date</strong>
              <p className="text-sm text-muted-foreground">The month and year your card expires (MM/YY).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>CVV/Security Code</strong>
              <p className="text-sm text-muted-foreground">The 3-digit code on the back of your card (or 4 digits on the front for American Express).</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Cardholder Name</strong>
              <p className="text-sm text-muted-foreground">The name as it appears on your card.</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="important" title="Card Verification">
        For security purposes, you may be required to complete additional verification steps,
        such as entering an OTP (One-Time Password) sent to your registered phone number or email.
      </HelpCallout>

      {/* Payment Security */}
      <h2 id="payment-security" className="text-2xl font-bold mt-8">Payment Security</h2>
      <Separator className="my-2" />
      <p>
        The platform prioritizes the security of your payment information and transactions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Encryption</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            All payment data is encrypted using industry-standard SSL/TLS protocols.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h4 className="font-medium">PCI Compliance</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Paystack is PCI-DSS compliant, ensuring secure handling of card information.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Fraud Protection</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Advanced fraud detection systems monitor transactions for suspicious activity.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Secure Storage</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            The platform never stores your complete card details on its servers.
          </p>
        </div>
      </div>

      {/* Troubleshooting Payment Issues */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting Payment Issues</h2>
      <Separator className="my-2" />
      <p>
        If you encounter problems during the payment process, here are some common issues and solutions.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Issue</th>
              <th className="border px-4 py-2 text-left">Possible Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Payment Declined</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Verify your card has sufficient funds</li>
                  <li>Check that your card details are entered correctly</li>
                  <li>Ensure your card is enabled for online transactions</li>
                  <li>Contact your bank to authorize the transaction</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Transaction Timeout</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Refresh the page and try again</li>
                  <li>Try a different payment method</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">OTP Not Received</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check that your phone number is correct with your bank</li>
                  <li>Wait a few minutes and request a new OTP</li>
                  <li>Check your email for the OTP (if applicable)</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Charged But No Confirmation</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check your email for a payment receipt</li>
                  <li>Verify if the course appears in your enrolled courses</li>
                  <li>Contact support with your transaction reference</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="tip" title="Payment Support">
        If you continue to experience payment issues, please contact our support team with
        details of the problem, including any error messages and the transaction reference
        number if available.
      </HelpCallout>

      {/* Frequently Asked Questions */}
      <h2 id="faqs" className="text-2xl font-bold mt-8">Frequently Asked Questions</h2>
      <Separator className="my-2" />
      <p>
        Here are answers to common questions about payments on the platform.
      </p>

      <div className="space-y-4 mt-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Is there a subscription fee?
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            No, the platform charges per course rather than using a subscription model. You only pay
            for the specific courses you want to enrol in.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Can I get a refund if I change my mind about a course?
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            Refund policies vary by course. Please check the specific course's refund policy before
            enrolling. Generally, refunds are available within a limited time period after enrolment
            and before completing a certain percentage of the course.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Is my payment information stored securely?
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            Yes, all payment information is handled securely by Paystack, which is PCI-DSS compliant.
            The platform itself does not store your complete card details.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Can I pay in installments?
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            Currently, the platform does not offer installment payment options. Full payment is
            required to enrol in a course.
          </p>
        </div>
      </div>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, understanding payment options helps you enrol in courses smoothly:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep your payment methods up to date to avoid enrolment delays</li>
              <li>Save your payment receipts for your records and potential tax purposes</li>
              <li>Check course prices and payment requirements before attempting to enrol</li>
              <li>Contact support promptly if you encounter any payment issues</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, understanding the payment process helps you support your students:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Familiarize yourself with the payment process to assist students with basic questions</li>
              <li>Direct students with complex payment issues to the appropriate support channels</li>
              <li>Ensure your course description clearly states the price and what's included</li>
              <li>Be aware of the refund policy for your courses</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you oversee the payment system configuration:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor payment gateway performance and transaction success rates</li>
              <li>Configure payment notification settings for students and finance staff</li>
              <li>Establish clear refund policies and procedures</li>
              <li>Ensure proper documentation of all payment-related processes</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Communication Guidelines",
          href: "/help/discussions/etiquette"
        }}
        nextArticle={{
          title: "Payment History",
          href: "/help/payments/history"
        }}
      />
    </article>
  );
}
