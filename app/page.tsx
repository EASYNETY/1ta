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
import NavBar from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AbstractBackground } from "@/components/layout/abstract-background"
import { ScrollIndicator } from "@/components/layout/scroll-indicator"
import { SectionDivider } from "@/components/layout/section-divider"
import { SectionHeader } from "@/components/layout/section-header"
import { BarcodeScannerSection } from "@/components/landing/barcode-scanner-section"
import { CoursesSection } from "@/components/landing/course-section"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full relative">
      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Header */}
      <NavBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 relative overflow-hidden flex items-center justify-center min-h-[90vh]">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="container px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
                  Empowering Institutions with Smart, Real-Time, Engaging Education.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  Attendance. Learning. Engagement. Analytics. — All in One Platform.
                </p>
                <div className="flex flex-row gap-4 pt-4">
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

        <SectionDivider />

        {/* Core Features Overview */}
        <section id="features" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Core Features"
              description="Our platform offers a comprehensive suite of tools designed to transform education."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        <SectionDivider />

        {/* Barcode Scanner Section */}
        <section id="barcode-scanner" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="container px-4 md:px-6 relative">
            <BarcodeScannerSection />
          </div>
        </section>

        <SectionDivider />

        {/* Courses Section */}
        <section id="courses" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Explore Our Courses"
              description="Unlock your potential with industry-leading tech courses taught by experts."
            />
            <CoursesSection />
          </div>
        </section>

        <SectionDivider />

        {/* Why Choose Us */}
        <section id="why-us" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Why Choose Us"
              description="See how 1TechAcademy compares to traditional learning management systems."
            />

            <ComparisonGrid />
          </div>
        </section>

        <SectionDivider />

        {/* Demo Request / Sign Up CTA */}
        <section id="demo-request" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <div className="max-w-md mx-auto">
              <SectionHeader
                title="Ready to Transform?"
                description="Request a demo or sign up to get started with 1TechAcademy today."
              />

              <DyraneCard>
                <DemoRequestForm />
              </DyraneCard>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Onboarding Teaser Section */}
        <section className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Getting Started is Easy"
              description="Our streamlined onboarding process gets you up and running quickly."
            />

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

            <div className="text-center mt-16">
              <DyraneButton size="lg" asChild>
                <Link href="/signup">
                  Start Your Smart Campus Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* --- 1Tech Academy Onboarding Steps --- */}
        <section className="py-24 relative overflow-hidden">
          {/* Assuming AbstractBackground or GridBackground component is used */}
          <AbstractBackground className="opacity-50 dark:opacity-40" /> {/* Example: Reduced opacity */}

          <div className="px-4 md:px-6 relative"> {/* Use container for consistent padding */}
            <SectionHeader
              title="Begin Your Tech Journey in Minutes" // More engaging title
              description="Our simple sign-up process gets you learning faster." // Focused description
              className="mb-12 md:mb-16" // Consistent spacing
            />

            {/* Responsive Grid for Onboarding Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {/* Step 1: Account Creation */}
              <OnboardingStep
                number={1}
                title="Create Your Account" // Changed from "Register Institution"
                description="Quickly sign up using your email or preferred social login." // Adjusted description
              />
              {/* Step 2: Course Selection/Browse */}
              <OnboardingStep
                number={2}
                title="Explore Courses" // Changed from "Select Modules"
                description="Browse our catalog and find the tech path that excites you." // Adjusted description
              />
              {/* Step 3: Profile Setup */}
              <OnboardingStep
                number={3}
                title="Complete Your Profile" // More relevant than device setup
                description="Add your details so we can personalize your learning experience." // Adjusted description
              />
              {/* Step 4: Start Learning */}
              <OnboardingStep
                number={4}
                title="Start Learning!" // Changed from "Invite Students"
                description="Dive into your first course and connect with instructors and peers." // Adjusted description
              />
            </div>

            {/* Call to Action Button */}
            <div className="text-center mt-16">
              <DyraneButton size="lg" asChild>
                <Link href="/signup">
                  {/* Updated CTA Text */}
                  Enroll at 1Tech Academy Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            </div>
          </div>
        </section>
        {/* --- End 1Tech Academy Onboarding Steps --- */}

        <SectionDivider />

        {/* Testimonials & Case Studies */}
        <section id="testimonials" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="What Our Clients Say"
              description="Hear from institutions that have transformed their educational experience with 1TechAcademy."
            />

            <TestimonialCarousel />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
