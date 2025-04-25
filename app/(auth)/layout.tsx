// app/(auth)/layout.tsx

import type React from "react"
import NavBar from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AbstractBackground } from "@/components/layout/abstract-background"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 flex items-center justify-center relative">
        <AbstractBackground className="opacity-70" />
        <div className="w-full max-w-md relative z-10 py-12 px-4">
          <h1 className="mb-8 text-center text-4xl font-bold">1TechAcademy</h1>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
