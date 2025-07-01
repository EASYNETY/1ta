// app/(public)/corporate-training/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Corporate Training | 1Tech Academy',
  description: 'Customized corporate training solutions to upskill your team and drive business growth.',
};

export default function CorporateTrainingPage() {
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
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Corporate Training</h1>
              <p className="text-muted-foreground mt-1">
                Customized training solutions for your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Transform Your Team with Professional Training</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                1Tech Academy offers comprehensive corporate training programs designed to enhance your team's 
                technical skills and drive business growth. Our expert instructors deliver customized training 
                solutions that align with your organization's specific needs and objectives.
              </p>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>On-site and remote training options</li>
                  <li>Flexible scheduling to fit your business needs</li>
                  <li>Group discounts for multiple participants</li>
                  <li>Customized curriculum based on skill levels</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Technical skills assessment</li>
                  <li>Personalized learning paths</li>
                  <li>Hands-on practical training</li>
                  <li>Progress tracking and reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certification Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Industry-recognized certifications</li>
                  <li>Exam preparation and support</li>
                  <li>Continuing education credits</li>
                  <li>Professional development tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consulting Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Technology strategy consulting</li>
                  <li>Digital transformation guidance</li>
                  <li>Process optimization</li>
                  <li>Best practices implementation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Contact our corporate training team to discuss your organization's training needs 
                and receive a customized proposal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/contact">Request Consultation</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="mailto:corporate@1techacademy.com">
                    Email: corporate@1techacademy.com
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
