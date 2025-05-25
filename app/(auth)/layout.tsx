// app/(auth)/layout.tsx
'use client'

import type React from "react"
import NavBar from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AbstractBackground } from "@/components/layout/abstract-background"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 flex items-center justify-center relative min-h-screen">
      <AbstractBackground className="opacity-90 dark:opacity-80" />
        <div className="w-full max-w-md relative z-10 py-12 px-4">
          <div className="flex items-center justify-center mb-8">
            {mounted && currentTheme && (
              <Image
                src="/images/logos/1tech-academy-no-bg.png"
                alt="1techacademy Logo"
                className={cn(
                  "h-10 w-auto",
                  currentTheme === "dark" && "bg-white/90 rounded-sm px-2"
                )}
                priority
                width={120}
                height={40}
              />
            )}
            {(!mounted || !currentTheme) && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>} {/* Adjusted skeleton */}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
