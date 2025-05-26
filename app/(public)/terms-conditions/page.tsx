// app/(public)/terms-conditions/page.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-center">Terms & Conditions</h1>
      </div>

      <p className="text-center text-muted-foreground mb-8">
        Last updated: June 15, 2024
      </p>

      <div className='w-full bg-card/5 backdrop-blur-sm rounded-xl border p-4'>
        <Tabs defaultValue="agreement" className="w-full">
          <div className="p-4 border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="agreement">Agreement</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="liability">Liability</TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <TabsContent value="agreement" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Terms of Agreement</h2>
                <p className="mb-4">
                  Welcome to 1Tech Academy. These Terms and Conditions govern your use of our website, platform, and services. By accessing or using our services, you agree to be bound by these Terms and Conditions.
                </p>
                <p className="mb-4">
                  Please read these Terms and Conditions carefully before using our platform. If you do not agree with any part of these terms, you may not use our services.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">Acceptance of Terms</h3>
                <p className="mb-4 text-muted-foreground">
                  By creating an account, enrolling in a course, or otherwise using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
                </p>

                <h3 className="text-lg font-medium mb-3">Changes to Terms</h3>
                <p className="mb-4 text-muted-foreground">
                  We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our platform. Your continued use of our services after any changes indicates your acceptance of the modified terms.
                </p>

                <h3 className="text-lg font-medium mb-3">Eligibility</h3>
                <p className="mb-4 text-muted-foreground">
                  You must be at least 18 years old to create an account and use our services. If you are under 18, you may only use our services with the involvement and consent of a parent or guardian.
                </p>

                <h3 className="text-lg font-medium mb-3">Governing Law</h3>
                <p className="text-muted-foreground">
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law principles.
                </p>
              </TabsContent>

              <TabsContent value="accounts" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Account Terms</h2>

                <h3 className="text-lg font-medium mb-3">Account Creation</h3>
                <p className="mb-4 text-muted-foreground">
                  To access certain features of our platform, you must create an account. When creating an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>

                <h3 className="text-lg font-medium mb-3">Account Security</h3>
                <p className="mb-4 text-muted-foreground">
                  You are responsible for safeguarding your password and for restricting access to your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to comply with this section.
                </p>

                <h3 className="text-lg font-medium mb-3">Account Termination</h3>
                <p className="mb-4 text-muted-foreground">
                  We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason.
                </p>

                <h3 className="text-lg font-medium mb-3">User Content</h3>
                <p className="mb-4 text-muted-foreground">
                  You retain ownership of any content you submit, post, or display on or through our platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in any media.
                </p>

                <h3 className="text-lg font-medium mb-3">Prohibited Conduct</h3>
                <p className="text-muted-foreground">
                  You agree not to engage in any of the following prohibited activities: (1) copying, distributing, or disclosing any part of our platform; (2) using any automated system to access our platform; (3) attempting to interfere with the proper working of our platform; (4) uploading invalid data, viruses, or other harmful code; (5) collecting or harvesting any personally identifiable information from our platform; (6) impersonating another person or otherwise misrepresenting your affiliation with a person or entity.
                </p>
              </TabsContent>

              <TabsContent value="courses" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Course Policies</h2>

                <h3 className="text-lg font-medium mb-3">Enrolment and Access</h3>
                <p className="mb-4 text-muted-foreground">
                  Upon enrolling in a course and making the required payment, you will be granted access to the course materials for the specified duration. Some courses may offer lifetime access, while others may have a limited access period.
                </p>

                <h3 className="text-lg font-medium mb-3">Payment and Refunds</h3>
                <p className="mb-4 text-muted-foreground">
                  All payments are processed securely through our payment processors. Course fees are non-refundable except as provided in our Refund Policy. We offer a 7-day money-back guarantee for most courses if you are not satisfied with the content.
                </p>

                <h3 className="text-lg font-medium mb-3">Course Content</h3>
                <p className="mb-4 text-muted-foreground">
                  All course content, including videos, documents, and other materials, is owned by 1Tech Academy or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or publicly perform any course content.
                </p>

                <h3 className="text-lg font-medium mb-3">Certificates</h3>
                <p className="mb-4 text-muted-foreground">
                  Upon successful completion of a course, you may receive a certificate of completion. Certificates are issued at our discretion and may require meeting certain criteria, such as completing all course modules and assessments.
                </p>

                <h3 className="text-lg font-medium mb-3">Course Updates</h3>
                <p className="text-muted-foreground">
                  We strive to keep our course content up-to-date. We reserve the right to modify, update, or remove course content at any time. While we make efforts to notify students of significant changes, we are not obligated to do so.
                </p>
              </TabsContent>

              <TabsContent value="liability" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>

                <h3 className="text-lg font-medium mb-3">Disclaimer of Warranties</h3>
                <p className="mb-4 text-muted-foreground">
                  Our platform and services are provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the operation of our services or the information, content, or materials included therein.
                </p>

                <h3 className="text-lg font-medium mb-3">Limitation of Liability</h3>
                <p className="mb-4 text-muted-foreground">
                  To the fullest extent permitted by applicable law, in no event will 1Tech Academy, its affiliates, officers, directors, employees, agents, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use our services; (ii) any conduct or content of any third party on our services; (iii) any content obtained from our services; and (iv) unauthorized access, use, or alteration of your transmissions or content.
                </p>

                <h3 className="text-lg font-medium mb-3">Indemnification</h3>
                <p className="mb-4 text-muted-foreground">
                  You agree to defend, indemnify, and hold harmless 1Tech Academy, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms and Conditions or your use of our services.
                </p>

                <h3 className="text-lg font-medium mb-3">External Links</h3>
                <p className="mb-4 text-muted-foreground">
                  Our platform may contain links to third-party websites or services that are not owned or controlled by 1Tech Academy. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </p>

                <Separator className="my-6" />

                <p className="text-sm text-muted-foreground">
                  If you have any questions about these Terms and Conditions, please contact us at legal@1techacademy.com.
                </p>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
