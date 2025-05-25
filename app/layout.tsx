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