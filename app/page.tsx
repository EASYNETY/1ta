// Project: 1Tech Academy - Landing Page app/page.tsx

'use client'

import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { ArrowRight, Fingerprint, Brain, Video, BarChart3, LayoutGrid, MessageCircle, GraduationCap, BadgeCheck, Users, Home, Telescope, LinkedinIcon, TwitterIcon, InstagramIcon, Phone, Building } from "lucide-react"
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel"
import { FeatureCard } from "@/components/landing/feature-card"
import { ComparisonGrid } from "@/components/landing/comparison-grid"
import { OnboardingStep } from "@/components/landing/onboarding-step"
import { HeroAnimation } from "@/components/landing/hero-animation"

import { DemoRequestForm } from "@/components/landing/demo-request-form"
import NavBar from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AbstractBackground } from "@/components/layout/abstract-background"
import { ScrollIndicator } from "@/components/layout/scroll-indicator"
import { SectionDivider } from "@/components/layout/section-divider"
import { SectionHeader } from "@/components/layout/section-header"
import { BarcodeScannerSection } from "@/components/landing/barcode-scanner-section"
// import { CoursesSection } from "@/components/landing/course-section"
import { CoursesSection } from "@/components/landing/public-course-section"
import { NodeTestimonialSection } from "@/components/landing/node-testimonial-section"
import { useEffect } from "react"
// import { fetchCourses } from "@/features/courses/store/course-slice"
import { fetchCourses } from "@/features/public-course/store/public-course-slice"
import { useAppDispatch } from "@/store/hooks"
import { Card } from "@/components/cards/FeatureCard"
import { Envelope, Eye, FacebookLogo, MapPin, Target, TiktokLogo, YoutubeLogo } from "phosphor-react"
import { whatWeDoFeatureData, whoWeAreFeatureData } from "@/data/landing-data"
import { StandOutSlideshowSimple } from "@/components/landing/stand-out-slideshow-simple"
import { EnhancedTechnologyIcons } from "@/components/landing/EnhancedTechnologyIcons"

export default function LandingPage() {

  // --- Redux Hooks ---
  const dispatch = useAppDispatch()

  // --- Fetch courses on mount ---
  useEffect(() => {
    dispatch(fetchCourses())
  }, [])

  // Define content for Mission and Vision FeatureCards
  const missionContent = {
    title: "Our Mission",
    subtitle: "Empowering Africa's Tech Leaders",
    imageSrc: "https://images.pexels.com/photos/7689856/pexels-photo-7689856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Replace with relevant image
    imageAlt: "Students collaborating on a tech project",
    modalContent: {
      bio: "At 1Tech Academy, our mission is to empower Africa’s next generation of tech leaders by delivering world-class, hands-on training through in-person mentorship, global expertise, and an uncompromising standard of excellence.",
    },
    icon: Target,
  };

  const visionContent = {
    title: "Our Vision",
    subtitle: "Shaping the Future of Tech in Africa",
    imageSrc: "https://img.freepik.com/free-photo/black-woman-experiencing-virtual-reality-with-vr-headset_53876-137559.jpg?t=st=1745919842~exp=1745923442~hmac=8f8854025973efa823ba857549a70fe3ff1fa013ad4c0225e4e81e97bc847092&w=740",
    // imageSrc: "./vision.png",
    imageAlt: "Abstract representation of digital transformation in Africa",
    modalContent: {
      bio: "To shape Africa’s next generation of tech leaders by combining global expertise with local excellence — in a space built for bold ambition and real transformation.",
    },
    icon: Eye,
  };

  return (
    <div className="flex flex-col min-h-screen w-full relative">
      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Header */}
      <NavBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden flex items-center justify-center min-h-[80vh]">
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
                    <Link href="#courses">Learn More</Link>
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

        {/* About Us Section */}

        <section id="about_us" className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative text-center">
            <SectionHeader
              title="About 1Tech Academy"
              description="We are a community where creativity thrives, innovation takes shape, and transformation begins. Here, you'll build problem-solving skills, grow your professional network, and gain the confidence to turn ideas into reality." />

            {/* Grid for Vision & Mission Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mx-auto mb-16 lg:mb-20">
              {/* Vision Card */}
              <Card
                title={visionContent.title}
                subtitle={visionContent.subtitle}
                imageSrc={visionContent.imageSrc}
                imageAlt={visionContent.imageAlt}
                modalContent={visionContent.modalContent}
                icon={<visionContent.icon className="h-8 w-8" />}
                className="h-full"
              />
              {/* Mission Card */}
              <Card
                title={missionContent.title}
                subtitle={missionContent.subtitle}
                imageSrc={missionContent.imageSrc}
                imageAlt={missionContent.imageAlt}
                modalContent={missionContent.modalContent}
                icon={<missionContent.icon className="h-8 w-8" />}
                className="h-full"
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 grid-rows-1">
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
            </div> */}
          </div>
        </section>

        <SectionDivider />

        {/* Core Features Overview */}
        {/* <section id="features" className="py-24 relative overflow-hidden">
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

        <SectionDivider /> */}

        {/* Barcode Scanner Section */}
        {/* <section id="barcode-scanner" className="py-24 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="container px-4 md:px-6 relative">
            <BarcodeScannerSection />
          </div>
        </section>

        <SectionDivider /> */}
        {/* === UPDATED Why Choose Us Section === */}
        <section id="why_us" className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-60 dark:opacity-50" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Why Choose 1Tech Academy"
              description="At 1Tech Academy, you're not just learning, you're joining a network of like-minded professionals, industry leaders, and tech enthusiasts. Our alumni work at top companies, and our career-focused approach ensures that you're job-ready from day one. Take the first step with 1Tech Academy and unlock limitless opportunities in the tech industry."
            />

            {/* Static Cards: Who We Are & What We Do */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-10 md:mb-14">
              {/* **** Use imported data **** */}
              <FeatureCard
                icon={whoWeAreFeatureData.icon}
                title={whoWeAreFeatureData.title}
                description={whoWeAreFeatureData.description}
              />
              <FeatureCard
                icon={whatWeDoFeatureData.icon}
                title={whatWeDoFeatureData.title}
                description={whatWeDoFeatureData.description}
              />
            </div>

            {/* Dynamic Slideshow: Why We Stand Out */}
            <SectionHeader
              title="Why We Stand Out "
              description="What sets our programs apart."
            />
            {/* **** Slideshow component imports its own data **** */}
            <StandOutSlideshowSimple />
          </div>
        </section>
        {/* === END UPDATED Why Choose Us Section === */}

        <SectionDivider />


        {/* Commented out "Explore Our Category" section as requested
        <section id="courses" className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Explore Our Courses"
              description="Unlock your potential with industry-leading tech courses taught by experts."
            />
            <CoursesSection />
          </div>
        </section>
*/}


        {/* <SectionDivider /> */}

        {/* Onboarding Teaser Section */}
        <section className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />
          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Get Started with 1Tech Academy"
              description="Follow these simple steps to begin your learning journey with us."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 grid-rows-1">
              <OnboardingStep
                number={1}
                title="Sign Up"
                description="Create your account with your email address to join our learning platform."
              />
              <OnboardingStep
                number={2}
                title="Explore Courses"
                description="Browse our catalog of professional courses and select the ones that match your goals."
              />
              <OnboardingStep
                number={3}
                title="Enroll in Session"
                description="Choose an available session with open seats that fits your schedule."
              />
              <OnboardingStep
                number={4}
                title="Learn"
                description="Access course materials, participate in discussions, and track your progress."
              />
            </div>

            <div className="text-center mt-16">
              <DyraneButton size="lg" asChild>
                <Link href="/signup">
                  Join 1Tech Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </DyraneButton>
            </div>
          </div>
        </section>


        <SectionDivider />

        {/* Technologies Taught Section */}
        <section id="technologies" className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-50 dark:opacity-40" />

          <div className="px-4 md:px-6 relative">
            <SectionHeader
              title="Technologies We Teach"
              description="Master the tools and platforms shaping the future of tech."
            />

            <EnhancedTechnologyIcons />
          </div>
        </section>

        <SectionDivider />

        {/* Testimonials & Case Studies */}
        <section id="testimonials" className="py-16 relative overflow-hidden">
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


        <SectionDivider />

        {/* Contact Us / Inquiry CTA */}
        <section id="contact-us" className="py-16 relative overflow-hidden">
          <AbstractBackground className="opacity-90 dark:opacity-80" />

          <div className="px-4 md:px-6 relative">
            <div className="mx-auto grid md:grid-cols-2 gap-10 items-start">
              {/* Left: Header + Info */}
              <div className="space-y-8">
                {/* Section Heading */}
                <SectionHeader
                  title="Ready to Get in Touch?"
                  description="Fill out the form or reach out directly through any of the following methods."
                  className="text-center md:text-left"
                />

                {/* Contact Info */}
                <div className="space-y-3 text-muted-foreground w-full flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center md: items-start gap-2">
                    <MapPin size={20} />
                    <span><strong>Address:</strong> 17 Aje Street, Sabo Yaba Lagos.</span>
                  </div>
                  <div className="flex items-center md: items-start gap-2">
                    <Phone size={20} />
                    <span>
                      <strong>Phone:</strong>{" "}
                      <a href="tel:+2347074693513">
                        +2347074693513
                      </a>
                    </span>
                  </div>
                  <div className="flex items-center md: items-start gap-2">
                    <Envelope size={20} />
                    <span>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:info@1techacademy.com">
                        info@1techacademy.com
                      </a>
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center md:justify-start w-full space-x-4 pt-4">
                  <a href="https://www.facebook.com/share/162ZNuWcgu/?mibextid=wwXIfr" aria-label="Facebook" className="hover:text-primary transition-colors">
                    <FacebookLogo size={24} weight="bold" />
                  </a>
                  <a href="https://www.linkedin.com/company/1tech-academy/?viewAsMember=true" aria-label="LinkedIn" className="hover:text-primary transition-colors">
                    <LinkedinIcon />
                  </a>
                  <a href="https://www.instagram.com/1tech_academy?igsh=ZmptMDJyemtjZ2lm&utm_source=qr" aria-label="Instagram" className="hover:text-primary transition-colors">
                    <InstagramIcon />
                  </a>
                  <a href="https://www.tiktok.com/@1tech.academy?_t=ZM-8vuaPPKBpLR&_r=1" aria-label="Tiktok" className="hover:text-primary transition-colors">
                    <TiktokLogo size={24} weight="bold" />
                  </a>
                  <a href="https://www.youtube.com/@1techAcademy" aria-label="YouTube" className="hover:text-primary transition-colors">
                    <YoutubeLogo size={24} weight="bold" />
                  </a>
                </div>
              </div>
              {/* Right: Form */}
              <DyraneCard>
                <DemoRequestForm />
              </DyraneCard>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
