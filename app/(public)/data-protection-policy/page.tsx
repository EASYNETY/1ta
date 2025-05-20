// app/(public)/data-protection-policy/page.tsx
'use client';

import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DataProtectionPolicyPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-8">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-center">Data Protection Policy</h1>
      </div>

      <p className="text-center text-muted-foreground mb-8">
        Last updated: June 15, 2024
      </p>

      <div className='w-full bg-card/5 backdrop-blur-sm rounded-xl border p-4'>
        <Tabs defaultValue="overview" className="w-full">
          <div className="p-4 border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className={cn(
                // Mobile first (scrollable)
                "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
                "gap-1", // Add gap between items for scrolling
                // SM breakpoint and up (grid)
                "sm:grid sm:w-full sm:grid-cols-4 sm:justify-center sm:gap-2"
              )}>
                <TabsTrigger value="overview" className="sm:flex-1">Overview</TabsTrigger>
                <TabsTrigger value="principles" className="sm:flex-1">Principles</TabsTrigger>
                <TabsTrigger value="measures" className="sm:flex-1">Security Measures</TabsTrigger>
                <TabsTrigger value="rights" className="sm:flex-1">Your Rights</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2 sm:hidden" />
            </ScrollArea>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Data Protection Policy Overview</h2>
                <p className="mb-4">
                  At 1Tech Academy, we are committed to protecting the privacy and security of your personal data. This Data Protection Policy outlines how we collect, use, store, and protect your personal information in compliance with applicable data protection laws.
                </p>
                <p className="mb-4">
                  This policy applies to all personal data processed by us, regardless of the media on which that data is stored or whether it relates to past or present students, employees, workers, or any other data subject.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">Scope and Purpose</h3>
                <p className="mb-4 text-muted-foreground">
                  This policy sets out how we handle the personal data of our students, employees, suppliers, and other third parties in connection with our services. It covers data processing across all our operations, including our website, learning platform, and administrative systems.
                </p>
                <p className="mb-4 text-muted-foreground">
                  The purpose of this policy is to ensure that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>We comply with data protection laws and follow good practices</li>
                  <li>We protect the rights of students, staff, and partners</li>
                  <li>We are transparent about how we store and process individuals' data</li>
                  <li>We protect ourselves from the risks of a data breach</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">Data Protection Officer</h3>
                <p className="text-muted-foreground">
                  We have appointed a Data Protection Officer (DPO) who is responsible for overseeing questions in relation to this policy and data protection matters. If you have any questions about this policy, including any requests to exercise your legal rights, please contact our DPO at dpo@1techacademy.com.
                </p>
              </TabsContent>

              <TabsContent value="principles" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Data Protection Principles</h2>
                <p className="mb-6 text-muted-foreground">
                  We adhere to the following principles when processing personal data:
                </p>

                <h3 className="text-lg font-medium mb-3">Lawfulness, Fairness, and Transparency</h3>
                <p className="mb-4 text-muted-foreground">
                  We process personal data lawfully, fairly, and in a transparent manner. We provide clear information to individuals about how their personal data is used through our Privacy Policy.
                </p>

                <h3 className="text-lg font-medium mb-3">Purpose Limitation</h3>
                <p className="mb-4 text-muted-foreground">
                  We collect personal data for specified, explicit, and legitimate purposes and do not process it in a manner that is incompatible with those purposes. We clearly state the purposes for which we process personal data in our Privacy Policy.
                </p>

                <h3 className="text-lg font-medium mb-3">Data Minimization</h3>
                <p className="mb-4 text-muted-foreground">
                  We ensure that personal data we process is adequate, relevant, and limited to what is necessary in relation to the purposes for which it is processed. We only collect the minimum amount of data needed for each specific purpose.
                </p>

                <h3 className="text-lg font-medium mb-3">Accuracy</h3>
                <p className="mb-4 text-muted-foreground">
                  We take reasonable steps to ensure personal data is accurate and, where necessary, kept up to date. We have processes in place to identify and address inaccurate data and keep records of when information was last updated.
                </p>

                <h3 className="text-lg font-medium mb-3">Storage Limitation</h3>
                <p className="mb-4 text-muted-foreground">
                  We keep personal data in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data is processed. We have a data retention policy that sets out the appropriate retention periods.
                </p>

                <h3 className="text-lg font-medium mb-3">Integrity and Confidentiality</h3>
                <p className="mb-4 text-muted-foreground">
                  We process personal data in a manner that ensures appropriate security, including protection against unauthorized or unlawful processing and against accidental loss, destruction, or damage, using appropriate technical and organizational measures.
                </p>

                <h3 className="text-lg font-medium mb-3">Accountability</h3>
                <p className="text-muted-foreground">
                  We take responsibility for complying with data protection principles and have appropriate measures and records in place to demonstrate compliance. This includes maintaining documentation of our data processing activities, implementing appropriate security measures, and conducting data protection impact assessments where necessary.
                </p>
              </TabsContent>

              <TabsContent value="measures" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Security Measures</h2>
                <p className="mb-6 text-muted-foreground">
                  We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
                </p>

                <h3 className="text-lg font-medium mb-3">Technical Measures</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li><strong>Encryption:</strong> We use encryption for data in transit and at rest, including SSL/TLS for all web traffic and encrypted databases.</li>
                  <li><strong>Access Controls:</strong> We implement strict access controls based on the principle of least privilege, ensuring that employees only have access to the data they need to perform their job functions.</li>
                  <li><strong>Network Security:</strong> We use firewalls, intrusion detection systems, and regular security scans to protect our networks and systems.</li>
                  <li><strong>Backup and Recovery:</strong> We maintain regular backups of data and have procedures in place for timely recovery in the event of a physical or technical incident.</li>
                  <li><strong>Software Updates:</strong> We ensure that all software, including operating systems and applications, is kept up to date with the latest security patches.</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Organizational Measures</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li><strong>Staff Training:</strong> All employees receive regular training on data protection and information security.</li>
                  <li><strong>Policies and Procedures:</strong> We have documented policies and procedures for data handling, incident response, and breach notification.</li>
                  <li><strong>Data Protection Impact Assessments:</strong> We conduct assessments for high-risk processing activities to identify and mitigate risks.</li>
                  <li><strong>Vendor Management:</strong> We ensure that third-party service providers who process personal data on our behalf provide sufficient guarantees to implement appropriate technical and organizational measures.</li>
                  <li><strong>Physical Security:</strong> We implement physical security measures to protect our premises and equipment, including access controls and surveillance.</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Data Breach Response</h3>
                <p className="mb-4 text-muted-foreground">
                  We have procedures in place to detect, report, and investigate personal data breaches. In the event of a breach that is likely to result in a risk to the rights and freedoms of individuals, we will notify the appropriate supervisory authority within 72 hours of becoming aware of the breach, where feasible.
                </p>
                <p className="text-muted-foreground">
                  We will also notify affected individuals without undue delay when a personal data breach is likely to result in a high risk to their rights and freedoms.
                </p>
              </TabsContent>

              <TabsContent value="rights" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Data Subject Rights</h2>
                <p className="mb-6 text-muted-foreground">
                  We respect and uphold the rights of individuals under data protection laws. These rights include:
                </p>

                <h3 className="text-lg font-medium mb-3">Right to be Informed</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to be informed about the collection and use of your personal data. We provide this information through our Privacy Policy and specific notices at the point of data collection.
                </p>

                <h3 className="text-lg font-medium mb-3">Right of Access</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request a copy of the personal data we hold about you and to check that we are lawfully processing it. We will provide this information within one month of your request, subject to verification of your identity.
                </p>

                <h3 className="text-lg font-medium mb-3">Right to Rectification</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request that inaccurate personal data be corrected, or incomplete data be completed. We will respond to such requests within one month.
                </p>

                <h3 className="text-lg font-medium mb-3">Right to Erasure</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request the deletion of your personal data in certain circumstances, such as when the data is no longer necessary for the purposes for which it was collected, or when you withdraw consent.
                </p>

                <h3 className="text-lg font-medium mb-3">Right to Restrict Processing</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request the restriction of processing of your personal data in certain circumstances, such as when you contest the accuracy of the data or when the processing is unlawful.
                </p>

                <h3 className="text-lg font-medium mb-3">Right to Data Portability</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to request that we transfer your personal data to you or to a third party in a structured, commonly used, machine-readable format, where technically feasible.
                </p>

                <h3 className="text-lg font-medium mb-3">Right to Object</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right to object to the processing of your personal data in certain circumstances, including processing for direct marketing purposes or processing based on legitimate interests.
                </p>

                <h3 className="text-lg font-medium mb-3">Rights Related to Automated Decision Making</h3>
                <p className="mb-4 text-muted-foreground">
                  You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.
                </p>

                <h3 className="text-lg font-medium mb-3">How to Exercise Your Rights</h3>
                <p className="mb-4 text-muted-foreground">
                  To exercise any of these rights, please contact our Data Protection Officer at dpo@1techacademy.com. We may need to request specific information from you to help us confirm your identity and ensure your right to access your personal data (or to exercise any of your other rights).
                </p>

                <Separator className="my-6" />

                <p className="text-sm text-muted-foreground">
                  If you have any concerns about how we handle your personal data, you have the right to make a complaint to the data protection authority in your country. However, we would appreciate the chance to deal with your concerns before you approach the authority, so please contact us in the first instance.
                </p>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
