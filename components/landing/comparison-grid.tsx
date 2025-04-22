"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle } from "lucide-react"
import { MotionTokens } from "@/lib/motion.tokens"

interface ComparisonItem {
  feature: string
  smartEdu: boolean
  legacy: boolean
  description: string
}

const comparisonData: ComparisonItem[] = [
  {
    feature: "Biometric Attendance",
    smartEdu: true,
    legacy: false,
    description: "Automated attendance tracking with fingerprint or facial recognition",
  },
  {
    feature: "AI Learning Paths",
    smartEdu: true,
    legacy: false,
    description: "Personalized learning recommendations based on student performance",
  },
  {
    feature: "Real-time Analytics",
    smartEdu: true,
    legacy: false,
    description: "Instant insights into student engagement and performance",
  },
  {
    feature: "Parent Communication",
    smartEdu: true,
    legacy: true,
    description: "Direct messaging and updates for parents and guardians",
  },
  {
    feature: "Course Management",
    smartEdu: true,
    legacy: true,
    description: "Tools for creating and managing course content",
  },
  {
    feature: "Mobile Accessibility",
    smartEdu: true,
    legacy: false,
    description: "Full-featured mobile experience for on-the-go access",
  },
]

export function ComparisonGrid() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const tableRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (item: ComparisonItem, e: React.MouseEvent<HTMLTableRowElement>) => {
    setHoveredItem(item.feature)

    // Get the position of the hovered row relative to the table container
    const row = e.currentTarget
    const rect = row.getBoundingClientRect()
    const tableRect = tableRef.current?.getBoundingClientRect() || { top: 0, left: 0 }

    setTooltipPosition({
      top: rect.top - tableRect.top,
      left: rect.left - tableRect.left,
      width: rect.width,
      height: rect.height,
    })
  }

  return (
    <DyraneCard className="overflow-hidden">
      <div className="overflow-x-auto relative" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Feature</TableHead>
              <TableHead className="text-center">SmartEdu</TableHead>
              <TableHead className="text-center">Legacy LMS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map((item) => (
              <TableRow
                key={item.feature}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <TableCell className="font-medium">{item.feature}</TableCell>
                <TableCell className="text-center">
                  {item.smartEdu ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.legacy ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Tooltip positioned absolutely relative to the table container */}
        {hoveredItem && (
          <motion.div
            className="absolute bg-primary/5 flex items-center justify-center pointer-events-none"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: tooltipPosition.width,
              height: tooltipPosition.height,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: MotionTokens.duration.fast,
              ease: MotionTokens.ease.easeOut,
            }}
          >
            <div className="px-4 py-2 bg-background/90 backdrop-blur-sm rounded-md shadow-sm max-w-md">
              <p className="text-sm">{comparisonData.find((item) => item.feature === hoveredItem)?.description}</p>
            </div>
          </motion.div>
        )}
      </div>
    </DyraneCard>
  )
}
