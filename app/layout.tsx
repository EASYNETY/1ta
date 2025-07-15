// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/animations.css";
import { Providers } from "@/store/providers";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { MouseTrackerProvider } from "@/providers/MouseTrackerProvider";
import { ErrorBoundary } from "@/providers/error-boundary";
import { Toaster } from "sonner";
import { cacheManager } from "@/lib/cache-manager";
import { UpdateDetector } from "@/components/app/UpdateDetector";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  // themeColor: [ // You can uncomment and set specific theme colors if needed
  //   { media: '(prefers-color-scheme: light)', color: '#ffffff' }, // Example light
  //   { media: '(prefers-color-scheme: dark)', color: '#020817' }, // Example dark (slate-950)
  // ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "1Tech Academy Platform",
    template: "%s | 1 TechAcademy",
  },
  description: "A modern platform for online learning and course management.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enable cache debugging in development
  if (process.env.NODE_ENV === 'development') {
    cacheManager.enableCacheDebugging();
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning // Necessary for next-themes
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* Google Search Console Tag */}
        <meta name="google-site-verification" content="MiY5SQjDfoGiDXVac4bACOQ6yl3Aj8s9s0Qfi_zHvGs" />
        {/* Google Analytics Tag */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6C3HWK2X3H"></script>
        <script dangerouslySetInnerHTML={{__html:`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-6C3HWK2X3H');
        `}} />
        {/* Meta Pixel Code */}
        <script dangerouslySetInnerHTML={{__html:`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1982477292494082');
          fbq('track', 'PageView');
        `}} />
        <noscript>
          <img height="1" width="1" style={{display:'none'}} src="https://www.facebook.com/tr?id=1982477292494082&ev=PageView&noscript=1" />
        </noscript>
        {/* SEO Keywords */}
        <meta name="keywords" content="career tech center, tech school, tech schools near me, tech school in Lagos, project management cert, project management fundamentals, best project management software, tech skills, Digital skill, digital marketing skills, social media marketing, software development, software engineering, cloud computing, 1Techacademy, Data analytics tool, UX/UI, python(backend programming language)" />
        <meta name="title" content="How Tech Career Centers Changed Lives | The Tech School in Lagos That’s Changing Lives | Tech School Near Me|Affordable & Reliable | Top Tech School in Lagos for Professional | Get Certified in Project Management Today | Master Project Management Fundamentals Course as a Pro | Best Project Management Software tools in 2025 | Stand-out this 2025 by mastering the Right Tech Skill | Top 10 Best Digital Skill to Learn in 2025 | Why Digital Marketing Is the Top Skill to Learn in 2025 | Misconception of Skills like Social Media Marketing | Learn Software Development & Become a Pro in 2025 | What is Software Engineering? Careers path & Roadmap | Learn How Azure Boosts Your Cloud Career Growth | 1Techacademy-Where Tech Skills Meet Possibility | Top Data Analytics Tools to Learn in 2025 for Success | UI/UX Design: Build Creative Skills for Modern Digital Products | Python for Backend Development: Build Scalable Web Apps" />
        <meta name="description" content="Discover how tech career centers has changed lives in 2025 by offering skills, career growth, and new opportunities for a brighter, more secure future. This tech school in Lagos offers hands-on training to build skills, improve job prospects, and help learners achieve career success. Looking for an affordable, efficient tech school near you? 1Techacademy helps you break into tech with top-notch training and expert guidance. As a professional ready to level up, join a tech school in Lagos to gain future-proof skills and unlock new career opportunities in the digital world. Obtain your project management cert and boost your career at 1techacademy, Gain practical skills, industry recognition, and lead projects with confidence and clarity. Become a professional project manager. Learn essential skills to plan, lead, and deliver successful projects across any industry or role. Discover the top project management software tools in 2025. Boost productivity, streamline teamwork, and manage tasks like a pro with the right tools. Acquire the needful tech skills in 2025, stand out, boost your career, and stay ahead in the digital world. Don't wait for the perfect time! Discover the highest paying digital skill to learn in 2025. Acquire in-demand expertise and unlock better career opportunities in the current digital economy. Unravel the most in-demand digital marketing skills every professional needs to succeed in today’s competitive online landscape. Uncover the truth behind common misconceptions about social media marketing. Learn what really matters to grow your digital career in 2025. Are you passionate about software development and eager to become a pro? Discover the essential tools you'll need in 2025 to take your skills to the next level. Explore the world of software engineering, from fundamental skills to career opportunities and industry best practices. Discover  how Microsoft Azure can fast-track your cloud career growth with in-demand skills, certifications, and real-world opportunities. Empower your future. Learn top tech skills, earn globally recognized certifications, and transform your career with expert-led training at 1TechAcademy. Learn essential data analytics tools in 2025 to enhance your skills, stay competitive, and grow your career in a data world. Learn UI/UX design to craft user-friendly digital experiences, boost your creative skills, and open doors to exciting tech career opportunities. Learn Python as a backend programming language to build secure, scalable web applications and kickstart a successful career in software development." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "1Tech Academy",
        "image": "https://lh3.googleusercontent.com/p/AF1QipO6svsOLgrN4YG3u73ODmnUpF2w0CSpsA5LMqpq=s1360-w1360-h1020-rw",
        "@id": "",
        "url": "https://onetechacademy.com/",
        "telephone": "07074693513",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "17 Aje Road",
          "addressLocality": "Yaba",
          "postalCode": "101212",
          "addressCountry": "NG"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 6.5056578,
          "longitude": 3.3764399
        }
      }`}} />
      </head>
      <body>
        <Providers>
          {/* 👇 Ensure ThemeProvider wraps everything that needs theming */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"       // <-- Force default to dark
            enableSystem={false}      // <-- Do NOT sync with system preference
            disableTransitionOnChange // Prevent flash on theme change
          // storageKey="theme"     // <-- Optional: Keep default or customize. If user manually switches, it will be stored here. Remove this line if you NEVER want user choice saved.
          >
            <ErrorBoundary>
              <AuthProvider>
                <MouseTrackerProvider>
                  {/* Your main application content */}
                  {children}
                  {/* Toaster outside main content usually */}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    // Apply theme directly to Toaster if needed,
                    // or ensure its styles adapt via Tailwind dark: prefix
                    theme={"dark"}
                    toastOptions={{
                      classNames: {
                        toast: "rounded-lg", // Ensure your toast styles support dark mode
                      },
                    }}
                  />
                  {/* Simple, reliable update detection */}
                  <UpdateDetector />
                </MouseTrackerProvider>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}