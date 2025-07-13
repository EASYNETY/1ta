// src/data/landing-data.ts
import React from 'react';

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
    icon: <img src="/icons/why/World-Class Instructors.png" alt="World-Class Instructors" className="h-10 w-10" />,
    title: "World-Class Instructors",
    description:
      "Learn from top-tier industry experts and international tutors with real-world experience.",
  },
  {
    icon: <img src="/icons/why/Tailored for Professionals..png" alt="Tailored for Professionals" className="h-10 w-10" />,
    title: "Tailored for Professionals",
    description:
      "Programs designed for professionals in Banking, Telecoms, FMCG, Health, Oil & Gas, Tech, and beyond.",
  },
  {
    icon: <img src="/icons/why/Hands-On Practical Learning.png" alt="Hands-On, Practical Learning" className="h-10 w-10" />,
    title: "Hands-On, Practical Learning",
    description:
      "Graduate with immediately usable skills and project experience.",
  },
  {
    icon: <img src="/icons/why/Global Certification  Standard.png" alt="Global Certification & Standards" className="h-10 w-10" />,
    title: "Global Certification & Standards",
    description:
      "Courses aligned with international standards offering globally recognized certifications.",
  },
  {
    icon: <img src="/icons/why/Flexible Learning Options.png" alt="Flexible Learning Options" className="h-10 w-10" />,
    title: "Flexible Learning Options",
    description:
      "Intensive onsite programs and virtual courses fitting your schedule.",
  },
  {
    icon: <img src="/icons/why/Career Transition Support.png" alt="Career Transition Support" className="h-10 w-10" />,
    title: "Career Transition Support",
    description:
      "Personalized mentorship, career advisory, and placement support.",
  },
  {
    icon: <img src="/icons/why/Innovative Curriculum.png" alt="Innovative Curriculum" className="h-10 w-10" />,
    title: "Innovative Curriculum",
    description:
      "Consistently updated curriculum matching the latest trends and best practices.",
  },
  {
    icon: <img src="/icons/why/Strong Alumni Network.png" alt="Strong Alumni Network" className="h-10 w-10" />,
    title: "Strong Alumni Network",
    description:
      "Access a powerful network of tech professionals and corporate leaders.",
  },
  {
    icon: <img src="/icons/why/Corporate Partnerships.png" alt="Corporate Partnerships" className="h-10 w-10" />,
    title: "Corporate Partnerships",
    description:
      "Customized tech training collaborations with top organizations.",
  },
  {
    icon: <img src="/icons/why/Transformative Impact.png" alt="Transformative Impact" className="h-10 w-10" />,
    title: "Transformative Impact",
    description:
      "Results-driven education that transforms lives and careers.",
  },
  
  {
    icon: <img src="/icons/why/Free Tech Career Consultation -01.png" alt="Free Tech Career Consultation" className="h-10 w-10" />,
    title: "Free Tech Career Consultation",
    description:
      "Free Tech Career Consultation",
  },
  {
    icon: <img src="/icons/why/24 hours uninterrupted power supply-01-01.png" alt="24/7 Power Supply" className="h-10 w-10" />,
    title: "24/7 Power Supply",
    description: "Enjoy uninterrupted learning with constant power supply at our facilities.",
  },
  {
    icon: <img src="/icons/why/Secured Car Space-01.png" alt="Secured Car Space" className="h-10 w-10" />,
    title: "Secured Car Space",
    description: "Safe and convenient parking for all our students and staff.",
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
