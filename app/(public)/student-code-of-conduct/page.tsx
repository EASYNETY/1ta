// app/(public)/student-code-of-conduct/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Student Code of Conduct | 1Tech Academy',
  description: 'Guidelines and expectations for student behavior and academic integrity at 1Tech Academy.',
};

export default function StudentCodeOfConductPage() {
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
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Student Code of Conduct</h1>
              <p className="text-muted-foreground mt-1">
                Guidelines for academic excellence and professional behavior
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At 1Tech Academy, we are committed to maintaining a professional, respectful, and inclusive learning environment. 
                This Student Code of Conduct outlines the expectations for all students enrolled in our programs.
              </p>
              <p>
                By enrolling in any course or program at 1Tech Academy, you agree to abide by these guidelines and understand 
                that violations may result in disciplinary action, including course suspension or termination.
              </p>
            </CardContent>
          </Card>

          {/* Academic Integrity */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Integrity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Expectations</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Submit original work and properly cite all sources</li>
                <li>Do not engage in plagiarism, cheating, or academic dishonesty</li>
                <li>Collaborate appropriately when group work is assigned</li>
                <li>Respect intellectual property rights</li>
                <li>Complete assignments and assessments independently unless otherwise specified</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-6">Prohibited Actions</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Copying work from other students or external sources without attribution</li>
                <li>Sharing assignment solutions or exam answers</li>
                <li>Using unauthorized materials during assessments</li>
                <li>Falsifying attendance or participation records</li>
              </ul>
            </CardContent>
          </Card>

          {/* Professional Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Professional Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Communication Standards</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Communicate respectfully with instructors, staff, and fellow students</li>
                <li>Use professional language in all written and verbal communications</li>
                <li>Respond to emails and messages in a timely manner</li>
                <li>Participate constructively in class discussions and group activities</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Attendance and Participation</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Attend all scheduled classes and training sessions</li>
                <li>Arrive on time and be prepared for each session</li>
                <li>Notify instructors in advance of any absences</li>
                <li>Actively participate in learning activities</li>
                <li>Complete assignments and projects by specified deadlines</li>
              </ul>
            </CardContent>
          </Card>

          {/* Technology and Platform Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Technology and Platform Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Use learning platforms and technology resources responsibly</li>
                <li>Protect your account credentials and do not share login information</li>
                <li>Report technical issues promptly to support staff</li>
                <li>Respect bandwidth and system resources during online sessions</li>
                <li>Follow guidelines for recording and sharing of class content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disciplinary Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Disciplinary Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Violations of this code of conduct may result in the following disciplinary actions:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-yellow-600">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    Formal notification of policy violation with opportunity for correction
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-600">Probation</h4>
                  <p className="text-sm text-muted-foreground">
                    Continued enrollment with specific conditions and monitoring
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-600">Suspension</h4>
                  <p className="text-sm text-muted-foreground">
                    Temporary removal from course or program
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-700">Termination</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanent removal from course or program without refund
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Questions or Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                If you have questions about this code of conduct or need to report a violation, 
                please contact our Student Affairs team:
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Email:</strong> studentaffairs@1techacademy.com</p>
                <p><strong>Phone:</strong> +234 (0) 123 456 7890</p>
                <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM WAT</p>
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
              <Link href="/refund-policy" className="text-primary hover:underline">
                Refund Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
