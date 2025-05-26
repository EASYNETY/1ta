'use client'

import React from 'react'
import Image from 'next/image'

interface SleekLogoLoaderProps {
  className?: string
}

export function SleekLogoLoader({
  className = ""
}: SleekLogoLoaderProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        {/* Logo with simple pulse animation */}
        {/* Use /logo_dark.png for larger screens and icon.png for small screens */}
        <div className="w-32 h-32 animate-pulse mx-auto">
          {/* Large screens - use logo_dark.png */}
          <Image
            src="/logo_dark.png"
            alt="1Tech Academy"
            width={128}
            height={128}
            className="hidden md:block w-full h-full object-contain"
            priority
          />
          {/* Small screens - use icon.png */}
          <Image
            src="/icon.png"
            alt="1Tech Academy"
            width={128}
            height={128}
            className="block md:hidden w-full h-full object-contain"
            priority
          />
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        {/* <p className="mt-4" style={{ color: "goldenrod" }}>Initializing...</p> */}
      </div>
    </div>
  )
}

