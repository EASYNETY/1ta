import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { ArrowRight, Fingerprint, Brain, Video, BarChart3, LayoutGrid, MessageCircle } from "lucide-react"
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel"
import { FeatureCard } from "@/components/landing/feature-card"
import { ComparisonGrid } from "@/components/landing/comparison-grid"
import { OnboardingStep } from "@/components/landing/onboarding-step"
import { HeroAnimation } from "@/components/landing/hero-animation"
import { IntegrationLogos } from "@/components/landing/integration-logos"
import { DemoRequestForm } from "@/components/landing/demo-request-form"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SmartEdu
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#why-us" className="text-sm font-medium hover:text-primary transition-colors">
              Why Choose Us
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
            <Link href="#integrations" className="text-sm font-medium hover:text-primary transition-colors">
              Integrations
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block"
            >
              Log in
            </Link>
            <DyraneButton asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </DyraneButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden flex items-center justify-center" >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 -z-10" />
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Empowering Institutions with Smart, Real-Time, Engaging Education.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  Attendance. Learning. Engagement. Analytics. — All in One Platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <DyraneButton size="lg" asChild>
                    <Link href="#demo-request">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </DyraneButton>
                  <DyraneButton variant="outline" size="lg" asChild>
                    <Link href="#features">Learn More</Link>
                  </DyraneButton>
                </div>
              </div>
              <div className="relative h-[400px] lg:h-[500px]">
                <HeroAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Overview */}
        <section id="features" className="py-20 bg-muted/50 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform offers a comprehensive suite of tools designed to transform education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Fingerprint className="h-8 w-8" />}
                title="Fingerprint Attendance"
                description="Biometric student check-ins, fully automated with real-time reporting and absence notifications."
              />
              <FeatureCard
                icon={<Brain className="h-8 w-8" />}
                title="AI-enhanced Learning Paths"
                description="Suggests content based on real-time engagement & progress, adapting to each student's needs."
              />
              <FeatureCard
                icon={<Video className="h-8 w-8" />}
                title="Real-Time Classrooms"
                description="Video, chat, whiteboard, attendance auto-logging with seamless integration."
              />
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8" />}
                title="Smart Analytics"
                description="Attendance, grades, and behavioral heatmaps to identify trends and improve outcomes."
              />
              <FeatureCard
                icon={<LayoutGrid className="h-8 w-8" />}
                title="Course Builder"
                description="Drag & drop modules, resources, and tests with intuitive content management."
              />
              <FeatureCard
                icon={<MessageCircle className="h-8 w-8" />}
                title="Parent Communication"
                description="Guardian portals with attendance & grade reports, plus direct messaging."
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="why-us" className="py-20 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how SmartEdu compares to traditional learning management systems.
              </p>
            </div>

            <ComparisonGrid />
          </div>
        </section>

        {/* Demo Request / Sign Up CTA */}
        <section id="demo-request" className="py-20 bg-muted/50 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Institution?</h2>
                <p className="text-muted-foreground">Request a demo or sign up to get started with SmartEdu today.</p>
              </div>

              <DyraneCard>
                <DemoRequestForm />
              </DyraneCard>
            </div>
          </div>
        </section>

        {/* Onboarding Teaser Section */}
        <section className="py-20 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Getting Started is Easy</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our streamlined onboarding process gets you up and running quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <OnboardingStep
                number={1}
                title="Register Your Institution"
                description="Create your account and set up your institution profile."
              />
              <OnboardingStep
                number={2}
                title="Select Learning Modules"
                description="Choose the features and tools that fit your needs."
              />
              <OnboardingStep
                number={3}
                title="Set up Attendance Devices"
                description="Configure biometric devices or mobile check-ins."
              />
              <OnboardingStep
                number={4}
                title="Invite Students"
                description="Add students and faculty to your platform."
              />
            </div>

            <div className="text-center mt-12">
              <DyraneButton size="lg" asChild>
                <Link href="/signup">
                  Start Your Smart Campus Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            </div>
          </div>
        </section>

        {/* Integrations & Partners */}
        <section id="integrations" className="py-20 bg-muted/50 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrations & Partners</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                SmartEdu seamlessly integrates with your favorite tools and services.
              </p>
            </div>

            <IntegrationLogos />
          </div>
        </section>

        {/* Testimonials & Case Studies */}
        <section id="testimonials" className="py-20 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hear from institutions that have transformed their educational experience with SmartEdu.
              </p>
            </div>

            <TestimonialCarousel />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  SmartEdu
                </span>
              </Link>
              <p className="text-muted-foreground mb-4">
                Empowering institutions with smart, real-time, engaging education solutions.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SmartEdu. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <DyraneButton variant="ghost" size="sm">
                English (US)
              </DyraneButton>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
