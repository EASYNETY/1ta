// src/data/landing-data.ts
import React from 'react';
import {
  Users,
  Target,
  Briefcase,
  Award,
  Clock,
  GraduationCap,
  Lightbulb,
  Network,
  Handshake,
  TrendingUp,
  Eye,
} from 'lucide-react';

// ==========================
// Who We Are & What We Do
// ==========================

export const whoWeAreFeatureData = {
  icon: "/images/icons/Who we are-01-01.png",
  title: "Who We Are",
  description:
    "In today’s digital world, technology is the backbone of innovation. At 1Tech Academy, we cultivate future-ready professionals who thrive in the evolving digital landscape.",
};

export const whatWeDoFeatureData = {
  icon: "/images/icons/What we do-01-01.png",
  title: "What We Do",
  description:
    "Join a network of professionals, leaders, and tech enthusiasts. Our career-focused approach ensures you’re job-ready from day one, unlocking limitless opportunities.",
};

// ==========================
// Why Choose Us - StandOut Points
// ==========================

interface StandOutPoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const standOutPointsData: StandOutPoint[] = [
  {
    icon: <Users className="h-10 w-10" />,
    title: "World-Class Instructors",
    description:
      "Learn from top-tier industry experts and international tutors with real-world experience.",
  },
  {
    icon: <Briefcase className="h-10 w-10" />,
    title: "Tailored for Professionals",
    description:
      "Programs designed for professionals in Banking, Telecoms, FMCG, Health, Oil & Gas, Tech, and beyond.",
  },
  {
    icon: <Target className="h-10 w-10" />,
    title: "Hands-On, Practical Learning",
    description:
      "Graduate with immediately usable skills and project experience.",
  },
  {
    icon: <Award className="h-10 w-10" />,
    title: "Global Certification & Standards",
    description:
      "Courses aligned with international standards offering globally recognized certifications.",
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: "Flexible Learning Options",
    description:
      "Intensive onsite programs and virtual courses fitting your schedule.",
  },
  {
    icon: <GraduationCap className="h-10 w-10" />,
    title: "Career Transition Support",
    description:
      "Personalized mentorship, career advisory, and placement support.",
  },
  {
    icon: <Lightbulb className="h-10 w-10" />,
    title: "Innovative Curriculum",
    description:
      "Consistently updated curriculum matching the latest trends and best practices.",
  },
  {
    icon: <Network className="h-10 w-10" />,
    title: "Strong Alumni Network",
    description:
      "Access a powerful network of tech professionals and corporate leaders.",
  },
  {
    icon: <Handshake className="h-10 w-10" />,
    title: "Corporate Partnerships",
    description:
      "Customized tech training collaborations with top organizations.",
  },
  {
    icon: <TrendingUp className="h-10 w-10" />,
    title: "Transformative Impact",
    description:
      "Results-driven education that transforms lives and careers.",
  },
];

// ==========================
// Example: Hero Section / Onboarding (Optional)
// ==========================

// export const heroSectionData = {
//   title: "Awaken Your Tech Future with 1Tech Academy.",
//   subtitle:
//     "Empowering tomorrow’s tech leaders through real-world projects, professional certifications, and a transformative learning environment.",
//   ctaPrimary: { text: "Enrol now", href: "/signup" },
//   ctaSecondary: { text: "Learn More", href: "#why_us" },
// };

// export const onboardingStepsData = [
//   { number: 1, title: "Create Account", description: "Sign up easily." },
//   { number: 2, title: "Customize", description: "Tailor your dashboard." },
//   // ...
// ];
