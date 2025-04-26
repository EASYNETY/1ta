// Project: 1Tech Academy - Landing Page app/page.tsx

'use client'

import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { ArrowRight, Fingerprint, Brain, Video, BarChart3, LayoutGrid, MessageCircle, GraduationCap, BadgeCheck, Users, Home } from "lucide-react"
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
import { NodeTestimonialSection } from "@/components/landing/node-testimonial-section"
import { useEffect } from "react"
import { fetchCourses } from "@/features/courses/store/course-slice"
import { useAppDispatch } from "@/store/hooks"

export default function LandingPage() {

  // --- Redux Hooks ---
  const dispatch = useAppDispatch()

  // --- Fetch courses on mount ---
  useEffect(() => {
    dispatch(fetchCourses())
  }, [])

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
                  Awaken Your Tech Future with 1Tech Academy.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
                  Empowering tomorrow’s tech leaders through real-world projects, professional certifications, and a transformative learning environment.
                </p>
                <div className="flex flex-row gap-4 pt-4">
                  <DyraneButton size="lg" asChild>
                    <Link href="/signup">
                      Enroll Now
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

        {/* Philosophy Section */}

        <section id="philosophy" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative text-center">
            <SectionHeader
              title="Our Philosophy"
              description="We are a launchpad into a world of endless possibilities. Our mission is simple: to empower students like you with the digital skills needed to thrive in today’s fast-paced, tech-driven world."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 grid-rows-1">
              <FeatureCard
                icon={<GraduationCap className="h-8 w-8" />}
                title="Professional Training"
                description="Expert-led programs designed to turn aspiring learners into industry-ready professionals."
              />
              <FeatureCard
                icon={<BadgeCheck className="h-8 w-8" />}
                title="Certifications"
                description="Earn certifications recognized across the tech industry to validate your skills."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Expert Trainers"
                description="Learn directly from professionals with real-world tech experience and mentorship."
              />
              <FeatureCard
                icon={<Home className="h-8 w-8" />}
                title="Conducive Learning Environment"
                description="Access world-class digital spaces designed for seamless, flexible, and collaborative learning."
              />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 grid-rows-1">
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
              {/* <FeatureCard
                icon={<LayoutGrid className="h-8 w-8" />}
                title="Course Builder"
                description="Drag & drop modules, resources, and tests with intuitive content management."
              />
              <FeatureCard
                icon={<MessageCircle className="h-8 w-8" />}
                title="Parent Communication"
                description="Guardian portals with attendance & grade reports, plus direct messaging."
              /> */}
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

        {/* Contact Us / Inquiry CTA */}
        <section id="contact-us" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <div className="max-w-md mx-auto">
              <SectionHeader
                title="Ready to Get in Touch?"
                description="Fill out the form below to request a demo, sign up, or ask a question."
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
              title="Get Started with onTech"
              description="Join in minutes and start unlocking your academic potential."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 grid-rows-1">
              <OnboardingStep
                number={1}
                title="Create Your Account"
                description="Sign up with your student ID or email in just a few taps."
              />
              <OnboardingStep
                number={2}
                title="Customize Your Dashboard"
                description="Tailor your learning experience to fit your courses and schedule."
              />
              <OnboardingStep
                number={3}
                title="Connect with Your Class"
                description="Instant access to classmates, group chats, and course materials."
              />
              <OnboardingStep
                number={4}
                title="Track Your Progress"
                description="See your attendance, feedback, and learning milestones in real-time."
              />
            </div>

            <div className="text-center mt-16">
              <DyraneButton size="lg" asChild>
                <Link href="/signup">
                  Join oneTech Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            </div>
          </div>
        </section>


        <SectionDivider />

        {/* Technologies Taught Section */}
        <section id="technologies" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-50 dark:opacity-40" />

          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Technologies We Teach"
              description="Master the tools and platforms shaping the future of tech."
            />

            <IntegrationLogos />
          </div>
        </section>

        <SectionDivider />

        {/* Testimonials & Case Studies */}
        <section id="testimonials" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="What Our Clients Say"
              description="Hear from students, educators, and partners who’ve transformed their learning journey with 1TechAcademy."
            />
            <NodeTestimonialSection />
            <TestimonialCarousel />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
