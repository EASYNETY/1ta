"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  heading: React.ReactNode
  subheading?: React.ReactNode
  actions?: React.ReactNode
  breadcrumbs?: boolean
  className?: string
}

export function PageHeader({ heading, subheading, actions, breadcrumbs = true, className }: PageHeaderProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = () => {
    if (!breadcrumbs) return null

    const segments = pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => {
        // Handle dynamic routes with [param]
        if (segment.startsWith("[") && segment.endsWith("]")) {
          return {
            name: segment.replace(/\[|\]/g, "").replace(/-/g, " "),
            path: segment,
            isDynamic: true,
          }
        }
        return {
          name: segment.replace(/-/g, " "),
          path: segment,
          isDynamic: false,
        }
      })

    return segments
  }

  const breadcrumbItems = generateBreadcrumbs()

  // Build the breadcrumb paths
  const getBreadcrumbPath = (index: number) => {
    return (
      "/" +
      breadcrumbItems
        ?.slice(0, index + 1)
        .map((item) => item.path)
        .join("/")
    )
  }

  return (
    <div className={cn("space-y-2 mb-4", className)}>
      {breadcrumbs && breadcrumbItems && breadcrumbItems.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
          </Link>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link
                href={getBreadcrumbPath(index)}
                className={cn(
                  "capitalize hover:text-foreground transition-colors",
                  index === breadcrumbItems.length - 1 && "font-medium text-foreground",
                )}
              >
                {item.isDynamic ? <span className="italic opacity-70">{item.name} ID</span> : item.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {typeof heading === "string" ? <h1 className="text-2xl font-bold tracking-tight">{heading}</h1> : heading}
          {subheading && <div className="text-muted-foreground">{subheading}</div>}
        </div>
        {actions && <div className="flex-shrink-0 ml-auto">{actions}</div>}
      </div>
    </div>
  )
}
