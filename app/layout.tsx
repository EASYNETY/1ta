import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/providers";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- VIEWPORT EXPORT (Add this if it's missing) ---
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9FAFB' }, // Example light background
    { media: '(prefers-color-scheme: dark)', color: '#1F2937' },  // Example dark background (adjust colors)
  ],
  width: 'device-width',
  initialScale: 1,
};

// Define metadata - Next.js handles injecting the correct tags
export const metadata: Metadata = {
  // --- Basic Metadata ---
  title: {
    default: "SmartEdu Platform", // Default title for layout
    template: "%s | SmartEdu", // Template for nested pages (e.g., "Dashboard | SmartEdu")
  },
  description: "A modern platform for online learning and course management.",

  // --- PWA / Theme Metadata ---
  manifest: "/manifest.json",

  // --- Icons ---
  icons: {
    icon: [
      // Provide different icon sizes/types
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" }, // Standard favicon
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png", // Apple touch icon
    // Add 'shortcut' or 'other' icons if needed
  },

  // --- Optional: Open Graph / Twitter for Social Sharing ---
  // openGraph: {
  //   title: 'SmartEdu Platform',
  //   description: 'A modern platform for online learning...',
  //   url: 'https://your-smartedu-url.com', // Your production URL
  //   siteName: 'SmartEdu',
  //   images: [
  //     {
  //       url: 'https://your-smartedu-url.com/og-image.png', // Path to your OG image
  //       width: 1200,
  //       height: 630,
  //     },
  //   ],
  //   locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'SmartEdu Platform',
  //   description: 'A modern platform for online learning...',
  //   images: ['https://your-smartedu-url.com/twitter-image.png'], // Path to your Twitter image
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
