"use client"

import React, { useState, useEffect } from "react"
import { motion, useAnimationControls, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CourseListing } from "./AppleTechnologyDisplay" // Adjust path as needed
import { getCourseIcon } from "@/utils/course-icon-mapping"

interface TechnologyMarqueeProps {
  courses: CourseListing[]
  direction?: "left" | "right"
  speed?: number
  gap?: number
  onClick: (course: CourseListing) => void
}

// Calculate a suitable height for one row of items + padding
const ITEM_HEIGHT_PX = 80; // Corresponds to h-20
const VERTICAL_PADDING_PX = 16; // Corresponds to py-2 (8px top, 8px bottom) or similar single-side padding if you want py-4 total
const MARQUEE_CONTAINER_HEIGHT = ITEM_HEIGHT_PX + (VERTICAL_PADDING_PX * 2); // e.g., 80 + 32 = 112px (h-28)

export function TechnologyMarquee({
  courses,
  direction = "left",
  speed = 25,
  gap = 16,
  onClick
}: TechnologyMarqueeProps) {
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null)
  const controls = useAnimationControls()

  // Duplicate courses multiple times to ensure smooth looping
  const duplicatedCourses = courses.length > 0 ? [...courses, ...courses, ...courses, ...courses] : [];

  useEffect(() => {
    if (!duplicatedCourses || duplicatedCourses.length === 0) return;

    // Calculate the width of a single item including gap
    const itemWidth = ITEM_HEIGHT_PX + gap; // Square items (w-20 h-20) plus gap

    // Calculate the total width of one set of courses
    const singleSetWidth = itemWidth * courses.length;

    if (singleSetWidth === 0) return; // Avoid division by zero if courses is empty

    // Create animation definition
    const animationDefinition = {
      x: direction === "left" ? -singleSetWidth : singleSetWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop" as const,
          duration: singleSetWidth / speed, // Duration based on speed and distance
          ease: "linear",
        },
      },
    };

    // Start the animation with a slight delay to ensure layout is complete
    const animationTimer = setTimeout(() => {
      controls.start(animationDefinition);
    }, 50);

    // Clean up on unmount or when dependencies change
    return () => {
      clearTimeout(animationTimer);
      controls.stop();
    };
  }, [controls, courses, duplicatedCourses, direction, speed, gap]);


  const handleMouseEnter = (course: CourseListing) => {
    setHoveredCourseId(course.id);
    controls.stop();
  };

  const handleMouseLeave = () => {
    setHoveredCourseId(null);
    if (!duplicatedCourses || duplicatedCourses.length === 0) return;

    const approximateItemWidth = ITEM_HEIGHT_PX + gap;
    const singleSetWidth = approximateItemWidth * courses.length;

    if (singleSetWidth === 0) return;

    // Restart animation with a slight delay to ensure layout is complete
    setTimeout(() => {
      controls.start({
        x: direction === "left" ? -singleSetWidth : singleSetWidth,
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop" as const,
            duration: singleSetWidth / speed,
            ease: "linear",
          },
        },
      });
    }, 50);
  };

  if (!courses || courses.length === 0) {
    return <div className="text-center py-4">No technologies to display.</div>;
  }

  return (
    <div
      className="relative overflow-hidden w-full flex items-center justify-center"
      // Explicitly set height to contain only one row of items
      style={{ height: `${MARQUEE_CONTAINER_HEIGHT}px` }}
    >
      <motion.div
        // No ref needed here if animation is controlled by `animate` prop
        className="flex items-center whitespace-nowrap flex-nowrap" // Added flex-nowrap to prevent wrapping
        style={{
          gap: `${gap}px`,
          height: `${ITEM_HEIGHT_PX}px`,
          width: "max-content", // This is crucial to prevent wrapping
          display: "inline-flex" // Use inline-flex to ensure items stay in a row
        }}
        animate={controls}
      >
        {duplicatedCourses.map((course, index) => {
          const iconUrl = getCourseIcon(course.name, course.id);
          return (
            <div
              key={`${course.id}-${index}`}
              className="relative flex-shrink-0 inline-block" // Added inline-block to prevent wrapping
              style={{
                width: `${ITEM_HEIGHT_PX}px`,
                height: `${ITEM_HEIGHT_PX}px`,
                minWidth: `${ITEM_HEIGHT_PX}px`, // Enforce minimum width
                flexBasis: `${ITEM_HEIGHT_PX}px` // Set flex-basis to maintain width
              }}
              onMouseEnter={() => handleMouseEnter(course)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onClick(course)}
            >
              <motion.div
                className="w-full h-full backdrop-blur-sm bg-card/5 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={iconUrl}
                    alt={`${course.name} technology icon`}
                    className="w-10 h-10 object-contain rounded-md"
                    onError={(e) => {
                      // Fallback to default PNG icon if image fails to load
                      e.currentTarget.src = "/images/icons/Python for Beginners Certification-01-01.png";
                    }}
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                {hoveredCourseId === course.id && (
                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-20 min-w-max whitespace-normal" // Added whitespace-normal for tooltip text
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="bg-background/90 backdrop-blur-md px-3 py-2 rounded-md shadow-lg border border-border/50 text-center">
                      <p className="text-sm font-semibold whitespace-nowrap text-foreground">{course.name}</p>
                      {course.category === "current" ? (
                        <Badge variant="outline" className="mt-1 bg-green-500/5 text-green-600 border-green-500/20 text-xs">
                          Enrolling Now
                        </Badge>
                      ) : course.isIsoCertification ? (
                        <Badge variant="outline" className="mt-1 bg-blue-500/5 text-blue-600 border-blue-500/20 text-xs">
                          ISO Certification
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 bg-amber-500/5 text-amber-600 border-amber-500/20 text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </div>
  )
}