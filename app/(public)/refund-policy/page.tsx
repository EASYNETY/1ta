// app/(public)/refund-policy/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Refund Policy | 1Tech Academy',
  description: 'Learn about our refund policy, eligibility criteria, and process for course refunds at 1Tech Academy.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Refund Policy</h1>
              <p className="text-muted-foreground mt-1">
                Understanding our refund terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Please read this refund policy carefully before enrolling in any course. 
              By completing your enrollment, you acknowledge that you have read and agree to these terms.
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At 1Tech Academy, we strive to provide high-quality training programs that meet your professional development needs. 
                We understand that circumstances may change, and we have established this refund policy to address various scenarios 
                while maintaining fairness for all parties involved.
              </p>
              <p>
                This policy applies to all courses, training programs, and certification programs offered by 1Tech Academy, 
                whether delivered online, in-person, or in a hybrid format.
              </p>
            </CardContent>
          </Card>

          {/* Refund Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Refund Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">Full Refund (100%)</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Cancellation within 48 hours of enrollment and before course commencement</li>
                  <li>Course cancellation by 1Tech Academy due to insufficient enrollment</li>
                  <li>Technical issues preventing course access for more than 7 consecutive days</li>
                  <li>Duplicate payment or billing errors</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-600 mb-3">Partial Refund (50%)</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Withdrawal within the first week of course commencement</li>
                  <li>Medical emergency with proper documentation</li>
                  <li>Job relocation requiring course withdrawal (with documentation)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-3">No Refund</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Withdrawal after completing more than 25% of the course</li>
                  <li>Violation of the Student Code of Conduct resulting in termination</li>
                  <li>Failure to attend classes without prior notification</li>
                  <li>Completion of the course regardless of satisfaction level</li>
                  <li>Corporate training programs (separate terms apply)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Refund Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">How to Request a Refund</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Submit a written refund request to <strong>refunds@1techacademy.com</strong></li>
                <li>Include your full name, course name, enrollment date, and reason for refund</li>
                <li>Provide supporting documentation if applicable (medical certificates, job letters, etc.)</li>
                <li>Allow 5-7 business days for review and response</li>
                <li>If approved, refunds will be processed within 10-14 business days</li>
              </ol>

              <h3 className="text-lg font-semibold mt-6">Required Information</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Student ID or enrollment confirmation number</li>
                <li>Original payment method details</li>
                <li>Course completion status</li>
                <li>Detailed reason for refund request</li>
              </ul>
            </CardContent>
          </Card>

          {/* Special Circumstances */}
          <Card>
            <CardHeader>
              <CardTitle>Special Circumstances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <h3 className="text-lg font-semibold">Corporate Training</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate training programs have separate refund terms outlined in the corporate agreement. 
                  Please refer to your corporate contract for specific refund conditions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Certification Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Certification programs may have different refund terms due to third-party certification body requirements. 
                  Specific terms will be communicated during enrollment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Payment Plans</h3>
                <p className="text-sm text-muted-foreground">
                  For students on payment plans, refunds will be calculated based on payments made and course completion status. 
                  Outstanding balances may be waived depending on the refund eligibility.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processing Times */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Review Period</h4>
                  <p className="text-sm text-muted-foreground">5-7 business days</p>
                </div>
                <div>
                  <h4 className="font-semibold">Processing Time</h4>
                  <p className="text-sm text-muted-foreground">10-14 business days after approval</p>
                </div>
                <div>
                  <h4 className="font-semibold">Bank Transfer</h4>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                </div>
                <div>
                  <h4 className="font-semibold">Card Refunds</h4>
                  <p className="text-sm text-muted-foreground">5-10 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                For refund requests or questions about this policy, please contact:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> refunds@1techacademy.com</p>
                <p><strong>Phone:</strong> +234 (0) 123 456 7890</p>
                <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM WAT</p>
                <p><strong>Address:</strong> 17 Aje Street, Sabo Yaba Lagos, Nigeria</p>
              </div>
            </CardContent>
          </Card>

          <Separator />
          
          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Last updated: January 2025</p>
            <p className="mt-2">
              <Link href="/terms-conditions" className="text-primary hover:underline">
                Terms & Conditions
              </Link>
              {' | '}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' | '}
              <Link href="/student-code-of-conduct" className="text-primary hover:underline">
                Student Code of Conduct
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
