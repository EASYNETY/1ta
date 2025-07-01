// app/(public)/certification-programs/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Award, BookOpen, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Certification Programs | 1Tech Academy',
  description: 'Industry-recognized certification programs to advance your career in technology.',
};

export default function CertificationProgramsPage() {
  const certifications = [
    {
      name: 'CompTIA Cloud Essentials+',
      level: 'Beginner',
      duration: '4 weeks',
      description: 'Foundational cloud computing knowledge for business professionals.',
      features: ['Business-focused curriculum', 'Vendor-neutral content', 'Globally recognized']
    },
    {
      name: 'Project Management Professional (PMP)',
      level: 'Advanced',
      duration: '8 weeks',
      description: 'Leading project management certification for experienced professionals.',
      features: ['PMI-approved curriculum', 'Exam preparation', '35 PDUs included']
    },
    {
      name: 'AWS Cloud Practitioner',
      level: 'Beginner',
      duration: '6 weeks',
      description: 'Entry-level AWS certification for cloud fundamentals.',
      features: ['Hands-on labs', 'Real-world scenarios', 'AWS exam voucher']
    },
    {
      name: 'Certified Scrum Master (CSM)',
      level: 'Intermediate',
      duration: '3 weeks',
      description: 'Agile project management and Scrum framework certification.',
      features: ['Interactive workshops', 'Scrum Alliance certified', 'Lifetime membership']
    }
  ];

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
            <Award className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Certification Programs</h1>
              <p className="text-muted-foreground mt-1">
                Industry-recognized certifications to advance your career
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Our Certification Programs?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our certification programs are designed to provide you with the knowledge, skills, and credentials 
                needed to excel in today's competitive technology landscape. Each program combines theoretical 
                learning with practical application to ensure you're job-ready upon completion.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Expert Instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Hands-on Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Exam Preparation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Career Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Flexible Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Industry Recognition</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certification Programs Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={cert.level === 'Beginner' ? 'secondary' : cert.level === 'Intermediate' ? 'default' : 'destructive'}>
                          {cert.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{cert.duration}</span>
                      </div>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Program Features:</h4>
                    <ul className="space-y-1">
                      {cert.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <Link href="/#courses">View Course Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Certification Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Career Advancement</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Increased earning potential</li>
                    <li>Better job opportunities</li>
                    <li>Professional credibility</li>
                    <li>Industry recognition</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Skill Development</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Up-to-date technical knowledge</li>
                    <li>Practical, hands-on experience</li>
                    <li>Problem-solving abilities</li>
                    <li>Best practices implementation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start Your Certification Journey?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Contact our certification team to learn more about our programs and find the right 
                certification path for your career goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/contact">Get Started Today</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="mailto:certifications@1techacademy.com">
                    Email: certifications@1techacademy.com
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
