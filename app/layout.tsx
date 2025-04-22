import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  themeColor: [
    // Provide light/dark theme colors
    { media: "(prefers-color-scheme: light)", color: "#ffffff" }, // Or your light theme bar color
    { media: "(prefers-color-scheme: dark)", color: "#111827" }, // Example dark theme bar color - ADJUST
  ],

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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
