// app/(public)/privacy-policy/page.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-center">Privacy Policy</h1>
      </div>

      <p className="text-center text-muted-foreground mb-8">
        Last updated: June 15, 2024
      </p>

      <div className='w-full bg-card/5 backdrop-blur-sm rounded-xl border p-4'>
        <Tabs defaultValue="overview" className="w-full">
          <div className="p-4 border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="collection">Data Collection</TabsTrigger>
                <TabsTrigger value="usage">Data Usage</TabsTrigger>
                <TabsTrigger value="rights">Your Rights</TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Privacy Policy Overview</h2>
                <p className="mb-4">
                  At 1Tech Academy, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our platform, or enroll in our courses.
                </p>
                <p className="mb-4">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">Key Points</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>We collect personal information that you voluntarily provide to us when you register on our platform, express interest in obtaining information about us or our products and services, or otherwise contact us.</li>
                  <li>We use cookies and similar tracking technologies to track activity on our platform and hold certain information to enhance your experience.</li>
                  <li>Your information may be shared with third-party service providers to help us operate our business, such as payment processors and email delivery services.</li>
                  <li>We implement appropriate security measures to protect your personal information.</li>
                  <li>You have the right to access, correct, or delete your personal information at any time.</li>
                </ul>

                <p className="mt-6">
                  By using our services, you consent to the collection, use, and disclosure of information in accordance with this privacy policy.
                </p>
              </TabsContent>

              <TabsContent value="collection" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>

                <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                <p className="mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Register for an account</li>
                  <li>Enroll in a course</li>
                  <li>Complete a profile</li>
                  <li>Participate in discussions or forums</li>
                  <li>Submit a contact form</li>
                  <li>Subscribe to newsletters</li>
                  <li>Make a payment</li>
                </ul>

                <p className="mb-4">
                  The personal information we collect may include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Name, email address, and contact details</li>
                  <li>Billing information and payment details</li>
                  <li>Educational background and professional information</li>
                  <li>Profile pictures and biographical information</li>
                  <li>Course progress and completion data</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Automatically Collected Information</h3>
                <p className="mb-4">
                  When you access our platform, we may automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Device information</li>
                  <li>Usage patterns and interactions</li>
                  <li>Time spent on pages</li>
                  <li>Referral sources</li>
                </ul>
              </TabsContent>

              <TabsContent value="usage" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>

                <p className="mb-4">
                  We use the information we collect for various purposes, including:
                </p>

                <h3 className="text-lg font-medium mb-3">Providing and Improving Our Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>To provide and maintain our platform</li>
                  <li>To process enrollments and payments</li>
                  <li>To deliver course content and track progress</li>
                  <li>To issue certificates upon course completion</li>
                  <li>To improve our platform and user experience</li>
                  <li>To develop new features and services</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Communication</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>To respond to inquiries and support requests</li>
                  <li>To send administrative information</li>
                  <li>To provide updates about courses and services</li>
                  <li>To send marketing and promotional communications (with your consent)</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Analytics and Research</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>To analyze usage patterns and trends</li>
                  <li>To measure the effectiveness of our content</li>
                  <li>To conduct research to improve our educational offerings</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Legal and Security</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>To comply with legal obligations</li>
                  <li>To enforce our terms and policies</li>
                  <li>To protect against unauthorized access</li>
                  <li>To prevent fraud and abuse</li>
                </ul>
              </TabsContent>

              <TabsContent value="rights" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Your Privacy Rights</h2>

                <p className="mb-6">
                  Depending on your location, you may have certain rights regarding your personal information. These may include:
                </p>

                <h3 className="text-lg font-medium mb-3">Access and Information</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request information about the personal data we hold about you and to access a copy of that information.
                </p>

                <h3 className="text-lg font-medium mb-3">Rectification</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request that we correct any inaccurate personal information we hold about you.
                </p>

                <h3 className="text-lg font-medium mb-3">Erasure</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request that we delete your personal information in certain circumstances, such as when the information is no longer necessary for the purposes for which it was collected.
                </p>

                <h3 className="text-lg font-medium mb-3">Restriction of Processing</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request that we restrict the processing of your personal information in certain circumstances.
                </p>

                <h3 className="text-lg font-medium mb-3">Data Portability</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to receive your personal information in a structured, commonly used, and machine-readable format.
                </p>

                <h3 className="text-lg font-medium mb-3">Objection</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to object to our processing of your personal information for direct marketing purposes or when the processing is based on our legitimate interests.
                </p>

                <h3 className="text-lg font-medium mb-3">Exercising Your Rights</h3>
                <p className="mb-4 text-muted-foreground">
                  To exercise any of these rights, please contact us at privacy@1techacademy.com. We will respond to your request within 30 days.
                </p>

                <Separator className="my-6" />

                <p className="text-sm text-muted-foreground">
                  Please note that we may ask you to verify your identity before responding to such requests. We may not be able to provide you with certain personal information if providing it would interfere with another's rights or if we are legally entitled to deal with the request in a different way.
                </p>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
