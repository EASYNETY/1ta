"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { TechnologyCourseModal } from "@/components/modals/TechnologyCourseModal"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getCourseIcon } from "@/utils/course-icon-mapping"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { selectAllCourses, fetchCourses } from "@/features/public-course/store/public-course-slice"
import { getProxiedImageUrl } from "@/utils/imageProxy"
import { PublicCourseCard } from "@/components/cards/PublicCourseCard"
import { SectionHeader } from "@/components/layout/section-header"

// Types
export interface CourseListing {
  id: string
  name: string
  description?: string
  category: "current" | "future"
  isIsoCertification?: boolean
  waitlistCount: number
  imageUrl?: string
  iconUrl?: string
  tags?: string[]
  available_for_enrolment?: boolean
  gradientColors?: {
    from: string
    to: string
  }
}

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  image: string;
  previewVideoUrl?: string;
  instructor: {
    name: string;
    title?: string;
  };
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  tags?: string[];
  priceUSD: number;
  discountPriceUSD?: number;
  learningOutcomes?: string[];
  prerequisites?: string[];
  modules?: {
    title: string;
    duration: string;
    lessons?: {
      title: string;
      duration: string;
      isPreview?: boolean;
    }[];
  }[];
  lessonCount: number;
  moduleCount: number;
  totalVideoDuration?: string | null;
  language?: string;
  certificate?: boolean;
  accessType?: "Lifetime" | "Limited";
  supportType?: "Instructor" | "Community" | "Both" | "None";
}

// Fallback data in case API fails
const fallbackListings: CourseListing[] = [
  {
    id: "1",
    name: "PMP® Certification Training",
    description: "35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholders/pmp-hero.png",
    tags: ["Project Management", "Certification", "Leadership"],
    gradientColors: {
      to: "to-green-600",
      from: "from-emerald-500"
    }
  },
  {
    id: "iso-9001",
    name: "ISO 9001 Quality Management",
    description: "Master Quality Management Systems (QMS) to enhance customer satisfaction and operational efficiency.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 0,
    imageUrl: "/images/future/ISO 9001.jpeg",
    iconUrl: "/images/future/ISO 9001.jpeg",
    gradientColors: {
      to: "to-gray-600",
      from: "from-slate-500"
    }
  },
  {
    id: "iso-27001",
    name: "ISO 27001 Information Security",
    description: "Implement and manage an Information Security Management System (ISMS) based on the ISO 27001 standard.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 0,
    imageUrl: "/images/future/ISO 27001.jpeg",
    iconUrl: "/images/future/ISO 27001.jpeg",
    gradientColors: {
      to: "to-gray-600",
      from: "from-slate-500"
    }
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Master data analysis, visualization, and machine learning techniques to extract valuable insights from complex datasets.",
    category: "future",
    waitlistCount: 0,
    imageUrl: "/images/future/DATA SCIENCE.jpeg",
    iconUrl: "/images/future/DATA SCIENCE.jpeg",
    gradientColors: {
      to: "to-blue-600",
      from: "from-cyan-500"
    }
  },
  {
    id: "devops",
    name: "DevOps Engineering",
    description: "Learn to streamline development and operations with automation, CI/CD pipelines, and infrastructure as code.",
    category: "future",
    waitlistCount: 0,
    imageUrl: "/images/future/DEVOPS ENGINEERING.jpeg",
    iconUrl: "/images/future/DEVOPS ENGINEERING.jpeg",
    gradientColors: {
      to: "to-orange-600",
      from: "from-amber-500"
    }
  },
  {
    id: "iso-20000",
    name: "ISO 20000 – IT Service Management",
    description: "Develop expertise in managing IT services",
    category: "future",
    waitlistCount: 0,
    imageUrl: "/images/future/ISO 20000.jpeg",
    iconUrl: "/images/future/ISO 20000.jpeg",
    gradientColors: {
      to: "to-red-600",
      from: "from-rose-500"
    }
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Explore the frontiers of Artificial Intelligence. Build intelligent systems with advanced ML algorithms and neural networks.",
    category: "future",
    waitlistCount: 0,
    imageUrl: "/images/future/AI_ MACHINE LEARNING.jpeg",
    iconUrl: "/images/future/AI_ MACHINE LEARNING.jpeg",
    gradientColors: {
      to: "to-violet-600",
      from: "from-purple-500"
    }
  }
];

// Fallback public course data
const fallbackPublicCourses: PublicCourse[] = [
  {
    id: "1",
    slug: "pmp-certification-training",
    title: "PMP® Certification Training",
    subtitle: "PMP® Certification Training",
    description: "<p>35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.</p><p>Aligned with the Latest PMI Standards: Training based on the updated PMBOK® Guide and the latest PMP® exam content outline.</p>",
    category: "Project Management",
    image: "/placeholder.svg",
    previewVideoUrl: "https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
    instructor: {
      name: "Expert Instructor",
      title: "Project Management"
    },
    level: "Advanced",
    tags: ["PMP® Certification Training"],
    priceUSD: 0,
    learningOutcomes: [
      "Gain a comprehensive understanding of project management principles and best practices.",
      "Learn all concepts and knowledge areas outlined in the PMBOK® Guide",
      "Develop skills in initiating, planning, executing, monitoring, controlling, and closing projects",
      "Acquire the knowledge needed to pass the PMP certification exam"
    ],
    prerequisites: [
      "Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.",
      "Live, online classroom training by top instructors and practitioners",
      "Lifetime access to high-quality self-paced eLearning content curated by industry experts",
      "Learner support and assistance available 24/7"
    ],
    modules: [
      {
        title: "Assessments & Quizzes",
        duration: "5 lessons",
        lessons: [
          {
            title: "Mock Test-1",
            duration: "(quiz)",
            isPreview: false
          },
          {
            title: "Mock Test-2",
            duration: "(quiz)",
            isPreview: false
          }
        ]
      },
      {
        title: "Core Training Modules",
        duration: "8 lessons",
        lessons: [
          {
            title: "PMP Training Day 1",
            duration: "04:00:00",
            isPreview: false
          },
          {
            title: "PMP Training Day 2",
            duration: "03:27:24",
            isPreview: false
          }
        ]
      }
    ],
    lessonCount: 14,
    moduleCount: 3,
    totalVideoDuration: "Approx. 29.2 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Community"
  }
];

// API endpoints
const LISTINGS_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/publiclistings`
  : "https://api.onetechacademy/api/publiclistings"

const COURSES_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public_courses`
  : "https://api.onetechacademy/api/public_courses"

// Animation Variants

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.4
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    borderColor: "rgba(var(--primary), 0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
      ease: [0.22, 1, 0.36, 1] // Custom bezier curve for smooth animation
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
}

// No duplicate animation variants needed

// Advanced Icon Queue Management System with Performance Optimizations and Anti-Duplication
class IconQueueManager {
  private usedIcons = new Set<string>();
  private iconQueue: string[] = [];
  private queueIndex = 0;
  private iconCache = new Map<string, string>(); // Cache course name -> icon URL
  private iconUsageCount = new Map<string, number>(); // Track how many times each icon has been used
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    assignmentTime: 0,
    validationTime: 0,
    lastResetTime: 0
  };
  private loggedCacheHits = new Set<string>(); // Track which cache hits we've already logged
  private verboseLogging = false; // Control verbose logging - disabled by default to reduce noise

  constructor() {
    this.initializeQueue();
    this.performanceMetrics.lastResetTime = performance.now();
  }

  private initializeQueue() {
    // Comprehensive icon pool with strategic ordering for maximum diversity
    this.iconQueue = [
      // Tier 1: Most recognizable and diverse technologies
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Docker_%28container_engine%29_logo.svg/512px-Docker_%28container_engine%29_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/512px-Node.js_logo.svg.png',

      // Tier 2: Popular frameworks and tools
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/512px-Angular_full_color_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/512px-Vue.js_Logo_2.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Tensorflow_logo.svg/512px-Tensorflow_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/512px-Kubernetes_logo_without_workmark.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Git-logo.svg/512px-Git-logo.svg.png',

      // Tier 3: Cloud platforms and databases
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/512px-Microsoft_Azure.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/512px-Google_Cloud_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/512px-MongoDB_Logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/512px-Postgresql_elephant.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/MySQL_textlogo.svg/512px-MySQL_textlogo.svg.png',

      // Tier 4: Web technologies and languages
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/512px-HTML5_logo_and_wordmark.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/512px-CSS3_logo_and_wordmark.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/512px-JavaScript-logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/512px-ISO_C%2B%2B_Logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Csharp_Logo.png/512px-Csharp_Logo.png',

      // Tier 5: Specialized tools and frameworks
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/512px-Laravel.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Django_logo.svg/512px-Django_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Flask_logo.svg/512px-Flask_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Jenkins_logo.svg/512px-Jenkins_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Terraform_Logo.svg/512px-Terraform_Logo.svg.png',

      // Tier 6: Business and certification icons
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Project_Management_Institute_logo.svg/512px-Project_Management_Institute_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Kali-dragon-icon.svg/512px-Kali-dragon-icon.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Cisco_logo.svg/512px-Cisco_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/ISO_logo_%28Red_square%29.svg/512px-ISO_logo_%28Red_square%29.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/512px-Adobe_Photoshop_CC_icon.svg.png',

      // Tier 7: Additional diversity (VS Code placed strategically in middle-end)
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/512px-Android_robot.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Certificate_icon.svg/512px-Certificate_icon.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Business_icon.svg/512px-Business_icon.svg.png'
    ];

    console.log(`🎯 Icon Queue initialized with ${this.iconQueue.length} diverse icons`);
  }

  isIconAvailable(iconUrl: string): boolean {
    return !this.usedIcons.has(iconUrl);
  }

  reserveIcon(iconUrl: string): string {
    this.usedIcons.add(iconUrl);

    // Track usage count for anti-duplication analysis
    const currentCount = this.iconUsageCount.get(iconUrl) || 0;
    this.iconUsageCount.set(iconUrl, currentCount + 1);

    const iconName = iconUrl.split('/').pop()?.replace('.svg.png', '').replace('.png', '');
    if (this.verboseLogging) {
      console.log(`🔒 Reserved: ${iconName} (${this.usedIcons.size}/${this.iconQueue.length}) [usage: ${currentCount + 1}]`);
    }

    return iconUrl;
  }

  // Get least used available icons for better distribution
  getLeastUsedAvailableIcons(): string[] {
    const availableIcons = this.iconQueue.filter(icon => this.isIconAvailable(icon));

    // Sort by usage count (ascending) to prefer least used icons
    return availableIcons.sort((a, b) => {
      const usageA = this.iconUsageCount.get(a) || 0;
      const usageB = this.iconUsageCount.get(b) || 0;
      return usageA - usageB;
    });
  }

  getNextAvailableIcon(): string {
    const startTime = performance.now();

    // First, try to get the least used available icon for better distribution
    const leastUsedIcons = this.getLeastUsedAvailableIcons();

    if (leastUsedIcons.length > 0) {
      const selectedIcon = leastUsedIcons[0]; // Take the least used
      const endTime = performance.now();
      this.performanceMetrics.assignmentTime += (endTime - startTime);
      const usageCount = this.iconUsageCount.get(selectedIcon) || 0;
      if (this.verboseLogging) {
        console.log(`📋 Least-used assigned: ${selectedIcon.split('/').pop()?.replace('.svg.png', '').replace('.png', '')} [previous usage: ${usageCount}] [${(endTime - startTime).toFixed(2)}ms]`);
      }
      return this.reserveIcon(selectedIcon);
    }

    // Fallback to original queue logic if no icons available
    let attempts = 0;
    while (attempts < this.iconQueue.length) {
      const currentIcon = this.iconQueue[this.queueIndex];
      this.queueIndex = (this.queueIndex + 1) % this.iconQueue.length;

      if (this.isIconAvailable(currentIcon)) {
        const endTime = performance.now();
        this.performanceMetrics.assignmentTime += (endTime - startTime);
        console.log(`📋 Queue assigned: ${currentIcon.split('/').pop()?.replace('.svg.png', '').replace('.png', '')} (position ${this.queueIndex - 1}/${this.iconQueue.length}) [${(endTime - startTime).toFixed(2)}ms]`);
        return this.reserveIcon(currentIcon);
      }

      attempts++;
    }

    // Enhanced emergency handling - expand the icon pool dynamically
    console.warn('⚠️ All primary queue icons exhausted, expanding icon pool...');

    // Emergency icon pool with additional unique icons
    const emergencyIcons = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/512px-PHP-logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/512px-Octicons-mark-github.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Scrum_process.svg/512px-Scrum_process.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sql_data_base_with_logo.png/512px-Sql_data_base_with_logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Colaboratory_SVG_Logo.svg/512px-Google_Colaboratory_SVG_Logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/PyCharm_Icon.svg/512px-PyCharm_Icon.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/IntelliJ_IDEA_Icon.svg/512px-IntelliJ_IDEA_Icon.svg.png'
    ];

    // Try emergency icons
    for (const emergencyIcon of emergencyIcons) {
      if (this.isIconAvailable(emergencyIcon)) {
        console.log(`🚨 Emergency icon assigned: ${emergencyIcon.split('/').pop()?.replace('.svg.png', '').replace('.png', '')}`);
        return this.reserveIcon(emergencyIcon);
      }
    }

    // Final fallback with unique timestamp to ensure uniqueness
    const timestamp = Date.now();
    console.error(`🔴 CRITICAL: All icons exhausted! Using timestamped fallback (${timestamp})`);
    const fallbackIcon = `https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png?t=${timestamp}`;
    return this.reserveIcon(fallbackIcon);
  }

  // Check if course already has a cached icon (with performance tracking)
  getCachedIcon(courseName: string): string | null {
    const result = this.iconCache.get(courseName) || null;
    if (result) {
      this.performanceMetrics.cacheHits++;
    } else {
      this.performanceMetrics.cacheMisses++;
    }
    return result;
  }

  // Check if we should log this cache hit (to reduce noise)
  shouldLogCacheHit(courseName: string): boolean {
    if (!this.verboseLogging) return false;

    // Only log each course's cache hit once per session
    if (this.loggedCacheHits.has(courseName)) {
      return false;
    }

    this.loggedCacheHits.add(courseName);
    return true;
  }

  // Enable/disable verbose logging
  setVerboseLogging(enabled: boolean): void {
    this.verboseLogging = enabled;
    if (!enabled) {
      console.log('🔇 Icon cache verbose logging disabled');
    } else {
      console.log('🔊 Icon cache verbose logging enabled');
    }
  }

  // Get verbose logging status
  isVerboseLogging(): boolean {
    return this.verboseLogging;
  }

  // Cache an icon for a course
  setCachedIcon(courseName: string, iconUrl: string): void {
    this.iconCache.set(courseName, iconUrl);
  }

  reset() {
    const startTime = performance.now();

    // Log usage distribution before reset for analysis (only in verbose mode)
    if (this.verboseLogging && this.iconUsageCount.size > 0) {
      const usageStats = Array.from(this.iconUsageCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5 most used

      console.log(`📊 Icon Usage Distribution (top 5):`, usageStats.map(([icon, count]) =>
        `${icon.split('/').pop()?.replace('.svg.png', '').replace('.png', '')}: ${count}`
      ).join(', '));
    }

    this.usedIcons.clear();
    this.queueIndex = 0;
    this.iconCache.clear(); // Clear cache on reset
    this.iconUsageCount.clear(); // Clear usage tracking
    this.loggedCacheHits.clear(); // Clear logged cache hits to allow fresh logging

    // Reset performance metrics (only log in verbose mode)
    const totalTime = startTime - this.performanceMetrics.lastResetTime;
    const cacheHitRate = this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100;

    if (this.verboseLogging) {
      console.log(`🔄 Icon Queue Manager reset - fresh distribution cycle`);
      console.log(`⚡ Performance Summary: ${this.performanceMetrics.cacheHits} cache hits, ${this.performanceMetrics.cacheMisses} misses (${cacheHitRate.toFixed(1)}% hit rate)`);
      console.log(`⏱️ Timing: Assignment ${this.performanceMetrics.assignmentTime.toFixed(2)}ms, Validation ${this.performanceMetrics.validationTime.toFixed(2)}ms, Total cycle ${totalTime.toFixed(2)}ms`);
    }

    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      assignmentTime: 0,
      validationTime: 0,
      lastResetTime: performance.now()
    };
  }

  // Validate system for any duplications (with performance tracking)
  validateDeduplication(): { isValid: boolean; duplicates: string[]; report: string } {
    const startTime = performance.now();
    const iconCounts = new Map<string, number>();
    const duplicates: string[] = [];

    // Count occurrences of each cached icon
    for (const [, iconUrl] of this.iconCache.entries()) {
      const count = iconCounts.get(iconUrl) || 0;
      iconCounts.set(iconUrl, count + 1);

      if (count === 1) { // Second occurrence detected
        duplicates.push(iconUrl);
      }
    }

    const endTime = performance.now();
    this.performanceMetrics.validationTime += (endTime - startTime);

    const isValid = duplicates.length === 0;
    const report = isValid
      ? `✅ Deduplication validation passed - ${this.iconCache.size} courses, all unique icons [${(endTime - startTime).toFixed(2)}ms]`
      : `❌ Deduplication validation failed - ${duplicates.length} duplicate icons detected [${(endTime - startTime).toFixed(2)}ms]`;

    return { isValid, duplicates, report };
  }

  getUsageStats() {
    const validation = this.validateDeduplication();
    const cacheHitRate = this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100;

    // Calculate usage distribution statistics
    const usageValues = Array.from(this.iconUsageCount.values());
    const maxUsage = usageValues.length > 0 ? Math.max(...usageValues) : 0;
    const minUsage = usageValues.length > 0 ? Math.min(...usageValues) : 0;
    const avgUsage = usageValues.length > 0 ? (usageValues.reduce((a, b) => a + b, 0) / usageValues.length) : 0;

    return {
      used: this.usedIcons.size,
      total: this.iconQueue.length,
      available: this.iconQueue.length - this.usedIcons.size,
      utilizationRate: ((this.usedIcons.size / this.iconQueue.length) * 100).toFixed(1),
      cached: this.iconCache.size,
      deduplicationValid: validation.isValid,
      validationReport: validation.report,
      distribution: {
        maxUsage,
        minUsage,
        avgUsage: avgUsage.toFixed(2),
        variance: maxUsage - minUsage,
        evenDistribution: maxUsage - minUsage <= 1 // Good distribution if variance <= 1
      },
      performance: {
        cacheHits: this.performanceMetrics.cacheHits,
        cacheMisses: this.performanceMetrics.cacheMisses,
        cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate.toFixed(1),
        totalAssignmentTime: this.performanceMetrics.assignmentTime.toFixed(2),
        totalValidationTime: this.performanceMetrics.validationTime.toFixed(2),
        avgAssignmentTime: this.performanceMetrics.cacheMisses > 0 ? (this.performanceMetrics.assignmentTime / this.performanceMetrics.cacheMisses).toFixed(2) : '0'
      }
    };
  }
}

// Global icon queue manager instance
const iconManager = new IconQueueManager();

// Function to reset icon usage (called when component re-renders)
const resetIconUsage = () => {
  iconManager.reset();
};

// Global functions for controlling icon logging (for debugging)
const enableIconLogging = () => iconManager.setVerboseLogging(true);
const disableIconLogging = () => iconManager.setVerboseLogging(false);

// Add to window object for easy debugging access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).iconDebug = {
    enableLogging: enableIconLogging,
    disableLogging: disableIconLogging,
    getStats: () => iconManager.getUsageStats(),
    reset: resetIconUsage
  };
}

// Intelligent Technology Icon Mapping System - LLM-like semantic analysis with deduplication
const getTechnologyIcon = (name: string): string => {
  const startTime = performance.now();

  // Check cache first - if icon already assigned, return it immediately
  const cachedIcon = iconManager.getCachedIcon(name);
  if (cachedIcon) {
    const endTime = performance.now();
    // Only log cache hits once per course to reduce noise
    if (iconManager.shouldLogCacheHit(name)) {
      console.log(`💾 Cache hit: "${name}" → ${cachedIcon.split('/').pop()?.replace('.svg.png', '').replace('.png', '')} [${(endTime - startTime).toFixed(2)}ms]`);
    }
    return cachedIcon;
  }

  // Pre-compute lowercase for efficiency
  const lowerName = name.toLowerCase();

  // Debug logging to see what course names we're processing (only in verbose mode)
  if (iconManager.isVerboseLogging()) {
    console.log('🤖 AI Icon Mapper analyzing:', name);
  }

  // Helper function to check if icon is available (not used)
  const isIconAvailable = (iconUrl: string): boolean => {
    return iconManager.isIconAvailable(iconUrl);
  };

  // Helper function to reserve an icon
  const reserveIcon = (iconUrl: string): string => {
    return iconManager.reserveIcon(iconUrl);
  };

  // Advanced semantic analysis patterns
  const semanticPatterns = {
    // Project Management & Business
    projectManagement: {
      keywords: ['pmp', 'project management', 'scrum', 'agile', 'kanban', 'waterfall', 'pmbok'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Project_Management_Institute_logo.svg/512px-Project_Management_Institute_logo.svg.png',
      confidence: 0.95
    },

    // Security & Cybersecurity
    is02000: {
      keywords: ['IT', 'security', 'services', 'management', 'role', 'users', 'workspace', 'firewall', 'programs'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Kali-dragon-icon.svg/512px-Kali-dragon-icon.svg.png',
      confidence: 0.9
    },

    // Data Science & Analytics
    dataScience: {
      keywords: ['data', 'analytics', 'science', 'pandas', 'numpy', 'matplotlib', 'jupyter', 'statistics', 'visualization'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png',
      confidence: 0.85
    },

    // Machine Learning & AI
    machineLearning: {
      keywords: ['machine learning', 'artificial intelligence', 'neural network', 'deep learning', 'tensorflow', 'pytorch', 'sklearn', 'nlp', 'computer vision'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Tensorflow_logo.svg/512px-Tensorflow_logo.svg.png',
      confidence: 0.9
    },

    // Cloud Computing
    cloudComputing: {
      keywords: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'lambda', 'ec2', 's3', 'kubernetes', 'microservices'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png',
      confidence: 0.85
    },

    // Web Development
    webDevelopment: {
      keywords: ['web development', 'frontend', 'backend', 'full stack', 'html', 'css', 'javascript', 'responsive', 'spa'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png',
      confidence: 0.8
    },

    // Mobile Development
    mobileDevelopment: {
      keywords: ['mobile', 'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'app development'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/512px-Android_robot.svg.png',
      confidence: 0.85
    },

    // DevOps & Infrastructure
    devops: {
      keywords: ['devops', 'ci/cd', 'jenkins', 'docker', 'kubernetes', 'terraform', 'ansible', 'monitoring', 'deployment'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Docker_%28container_engine%29_logo.svg/512px-Docker_%28container_engine%29_logo.svg.png',
      confidence: 0.8
    },

    // Database & Storage
    database: {
      keywords: ['database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'data modeling'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sql_data_base_with_logo.png/512px-Sql_data_base_with_logo.png',
      confidence: 0.8
    },

    // Quality & Testing
    qualityAssurance: {
      keywords: ['quality', 'testing', 'qa', 'automation', 'selenium', 'unit test', 'integration', 'performance'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/ISO_logo_%28Red_square%29.svg/512px-ISO_logo_%28Red_square%29.svg.png',
      confidence: 0.75
    },

    // Design & UX
    design: {
      keywords: ['design', 'ui', 'ux', 'user experience', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator'],
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/512px-Adobe_Photoshop_CC_icon.svg.png',
      confidence: 0.8
    }
  };

  // Intelligent pattern matching with confidence scoring
  let bestMatch = null;
  let highestConfidence = 0;

  for (const [category, pattern] of Object.entries(semanticPatterns)) {
    let matchScore = 0;
    let keywordMatches = 0;

    for (const keyword of pattern.keywords) {
      if (lowerName.includes(keyword)) {
        keywordMatches++;
        // Weight longer keywords more heavily
        matchScore += keyword.length * 0.1;
      }
    }

    // Calculate confidence based on keyword matches and pattern confidence
    const confidence = (keywordMatches / pattern.keywords.length) * pattern.confidence;

    if (confidence > highestConfidence && confidence > 0.3) { // Minimum confidence threshold
      highestConfidence = confidence;
      bestMatch = { category, pattern, confidence };
    }
  }

  if (bestMatch) {
    const primaryIcon = bestMatch.pattern.icon;
    if (isIconAvailable(primaryIcon)) {
      if (iconManager.isVerboseLogging()) {
        console.log(`🎯 AI Match: "${name}" → ${bestMatch.category} (confidence: ${(bestMatch.confidence * 100).toFixed(1)}%)`);
      }
      const assignedIcon = reserveIcon(primaryIcon);
      iconManager.setCachedIcon(name, assignedIcon);
      return assignedIcon;
    } else {
      if (iconManager.isVerboseLogging()) {
        console.log(`⚠️ Primary icon taken for "${name}" → ${bestMatch.category}, finding alternative...`);
      }
      // Continue to next matching system
    }
  }

  // Advanced contextual analysis for specific technologies
  const contextualAnalysis = {
    // Programming Languages
    languages: {
      'javascript': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/512px-JavaScript-logo.png',
      'python': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png',
      'java': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/512px-ISO_C%2B%2B_Logo.svg.png',
      'c#': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Csharp_Logo.png/512px-Csharp_Logo.png',
      'php': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/512px-PHP-logo.svg.png'
    },

    // Frameworks & Libraries
    frameworks: {
      'react': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png',
      'angular': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/512px-Angular_full_color_logo.svg.png',
      'vue': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/512px-Vue.js_Logo_2.svg.png',
      'node': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/512px-Node.js_logo.svg.png',
      'laravel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/512px-Laravel.svg.png',
      'django': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Django_logo.svg/512px-Django_logo.svg.png',
      'flask': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Flask_logo.svg/512px-Flask_logo.svg.png'
    },

    // Cloud Platforms
    cloud: {
      'aws': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png',
      'azure': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/512px-Microsoft_Azure.svg.png',
      'gcp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/512px-Google_Cloud_logo.svg.png'
    },

    // Databases
    databases: {
      'mongodb': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/512px-MongoDB_Logo.svg.png',
      'postgresql': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/512px-Postgresql_elephant.svg.png',
      'mysql': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/MySQL_textlogo.svg/512px-MySQL_textlogo.svg.png'
    },

    // DevOps Tools
    devops: {
      'docker': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Docker_%28container_engine%29_logo.svg/512px-Docker_%28container_engine%29_logo.svg.png',
      'kubernetes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/512px-Kubernetes_logo_without_workmark.svg.png',
      'jenkins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Jenkins_logo.svg/512px-Jenkins_logo.svg.png',
      'terraform': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Terraform_Logo.svg/512px-Terraform_Logo.svg.png',
      'git': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Git-logo.svg/512px-Git-logo.svg.png'
    }
  };

  // Check for specific technology mentions with deduplication and priority weighting
  const techMatches: { tech: string; icon: string; category: string; priority: number }[] = [];

  for (const [category, technologies] of Object.entries(contextualAnalysis)) {
    for (const [tech, icon] of Object.entries(technologies)) {
      if (lowerName.includes(tech)) {
        // Calculate priority based on specificity and current usage
        const specificity = tech.length; // Longer matches are more specific
        const currentUsage = iconManager.isIconAvailable(icon) ? 0 : 1; // Penalize already used icons
        const priority = specificity - (currentUsage * 10); // Heavy penalty for used icons

        techMatches.push({ tech, icon, category, priority });
      }
    }
  }

  // Sort by priority (highest first) and take the best available match
  techMatches.sort((a, b) => b.priority - a.priority);

  for (const match of techMatches) {
    if (isIconAvailable(match.icon)) {
      if (iconManager.isVerboseLogging()) {
        console.log(`🔧 Tech Match: "${name}" → ${match.tech} (${match.category}) [priority: ${match.priority}]`);
      }
      const assignedIcon = reserveIcon(match.icon);
      iconManager.setCachedIcon(name, assignedIcon);
      return assignedIcon;
    }
  }

  // Intelligent ISO certification analysis
  const isoPatterns = [
    { pattern: /iso\s*9001|quality\s+management/i, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/ISO_logo_%28Red_square%29.svg/512px-ISO_logo_%28Red_square%29.svg.png', type: 'Quality Management' },
    { pattern: /iso\s*27001|information\s+security/i, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Kali-dragon-icon.svg/512px-Kali-dragon-icon.svg.png', type: 'Information Security' },
    { pattern: /iso\s*20000|it\s+service\s+management/i, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Cisco_logo.svg/512px-Cisco_logo.svg.png', type: 'IT Service Management' },
    { pattern: /iso/i, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/ISO_logo_%28Red_square%29.svg/512px-ISO_logo_%28Red_square%29.svg.png', type: 'ISO Standard' }
  ];

  for (const { pattern, icon, type } of isoPatterns) {
    if (pattern.test(name) && isIconAvailable(icon)) {
      console.log(`📋 ISO Match: "${name}" → ${type}`);
      const assignedIcon = reserveIcon(icon);
      iconManager.setCachedIcon(name, assignedIcon);
      return assignedIcon;
    }
  }

  // Intelligent contextual fallback system
  const intelligentFallback = () => {
    // Analyze course characteristics for smarter fallback selection
    const courseCharacteristics = {
      isCertification: /certification|certified|cert/i.test(name),
      isTraining: /training|course|bootcamp|workshop/i.test(name),
      isManagement: /management|manager|lead|admin/i.test(name),
      isTechnical: /development|programming|coding|software|tech/i.test(name),
      isDesign: /design|ui|ux|creative|visual/i.test(name),
      isAnalytics: /analytics|analysis|data|statistics/i.test(name),
      isNetwork: /network|infrastructure|system|server/i.test(name),
      isSecurity: /security|secure|protection|safety/i.test(name)
    };

    // Smart fallback mapping based on course characteristics with deduplication
    const characteristicMappings = [
      { condition: courseCharacteristics.isCertification, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Certificate_icon.svg/512px-Certificate_icon.svg.png', type: 'Certification' },
      { condition: courseCharacteristics.isManagement, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Business_icon.svg/512px-Business_icon.svg.png', type: 'Management' },
      { condition: courseCharacteristics.isDesign, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/512px-Adobe_Photoshop_CC_icon.svg.png', type: 'Design' },
      { condition: courseCharacteristics.isAnalytics, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png', type: 'Analytics' },
      { condition: courseCharacteristics.isNetwork, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Cisco_logo.svg/512px-Cisco_logo.svg.png', type: 'Network' },
      { condition: courseCharacteristics.isSecurity, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Kali-dragon-icon.svg/512px-Kali-dragon-icon.svg.png', type: 'Security' },
      { condition: courseCharacteristics.isTechnical, icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png', type: 'Technical' }
    ];

    for (const { condition, icon, type } of characteristicMappings) {
      if (condition && isIconAvailable(icon)) {
        if (iconManager.isVerboseLogging()) {
          console.log(`🎯 Characteristic Match: "${name}" → ${type}`);
        }
        const assignedIcon = reserveIcon(icon);
        iconManager.setCachedIcon(name, assignedIcon);
        return assignedIcon;
      }
    }

    // Use the queue manager for final fallback - ensures even distribution
    if (iconManager.isVerboseLogging()) {
      console.log(`🎯 Using queue manager for final assignment: "${name}"`);
    }
    const queueIcon = iconManager.getNextAvailableIcon();
    iconManager.setCachedIcon(name, queueIcon);
    return queueIcon;
  };

  const fallbackIcon = intelligentFallback();
  if (iconManager.isVerboseLogging()) {
    console.log(`🧠 Intelligent Fallback: "${name}" → Smart analysis complete`);
  }

  // The fallback icon is already reserved and cached by the queue manager
  return fallbackIcon;
};

export function AppleTechnologyDisplay() {
  const [listings, setListings] = useState<CourseListing[]>(fallbackListings)
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>(fallbackPublicCourses)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [selectedPublicCourse, setSelectedPublicCourse] = useState<PublicCourse | null>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current')

  // Redux hooks
  const dispatch = useAppDispatch()
  const reduxPublicCourses = useAppSelector(selectAllCourses)

  // Check if screen is small (mobile)
  const isSmallScreen = useMediaQuery("(max-width: 640px)")

  // Helper function to convert PublicCourse to CourseListing format
  const convertPublicCourseToListing = (publicCourse: PublicCourse): CourseListing => {
    return {
      id: publicCourse.id,
      name: publicCourse.title,
      description: publicCourse.description,
      category: "current" as const, // All courses from Redux store are current courses
      isIsoCertification: false,
      waitlistCount: 0,
      imageUrl: publicCourse.image,
      iconUrl: getCourseIcon(publicCourse.title, publicCourse.id),
      tags: publicCourse.tags,
      available_for_enrolment: true, // Default to true for Redux courses
      gradientColors: {
        from: 'from-primary/20',
        to: 'to-primary/10'
      }
    }
  }

  // Fetch public courses from Redux store
  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  // Fetch course data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch listings with timeout and error handling
        const listingsPromise = fetch(LISTINGS_ENDPOINT)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Listings API request failed with status ${response.status}`)
            }
            return response.json()
          })
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              return data.data
            }
            throw new Error('Invalid listings API response format')
          })

        // Fetch public courses with timeout and error handling
        const coursesPromise = fetch(COURSES_ENDPOINT)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Courses API request failed with status ${response.status}`)
            }
            return response.json()
          })
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              return data.data
            }
            throw new Error('Invalid courses API response format')
          })

        // Add timeout to both promises
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )

        // Race against timeout
        const [listingsData, coursesData] = await Promise.all([
          Promise.race([listingsPromise, timeoutPromise]).catch(err => {
            console.warn('Listings fetch error:', err)
            return null
          }),
          Promise.race([coursesPromise, timeoutPromise]).catch(err => {
            console.warn('Courses fetch error:', err)
            return null
          })
        ])

        // Use data if available, otherwise keep fallback
        if (listingsData) {
          // Apply PNG icon mapping to listings
          const listingsWithIcons = listingsData.map((course: CourseListing) => ({
            ...course,
            iconUrl: getCourseIcon(course.name, course.id)
          }))
          setListings(listingsWithIcons)
        }

        if (coursesData) {
          // Apply PNG icon mapping to public courses
          const coursesWithIcons = coursesData.map((course: PublicCourse) => ({
            ...course,
            iconUrl: getCourseIcon(course.title, course.id)
          }))
          setPublicCourses(coursesWithIcons)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        // Fallback data is already set as initial state
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleIconClick = (course: CourseListing) => {
    setSelectedCourse(course)

    // Find matching public course if available
    const matchingPublicCourse = publicCourses.find(pc =>
      pc.title.toLowerCase().includes(course.name.toLowerCase()) ||
      course.name.toLowerCase().includes(pc.title.toLowerCase())
    )

    setSelectedPublicCourse(matchingPublicCourse || null)

    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden"
  }

  const handleCloseModal = () => {
    setSelectedCourse(null)
    setSelectedPublicCourse(null)
    // Restore body scroll when modal is closed
    document.body.style.overflow = "auto"
  }

  // Convert Redux public courses to CourseListing format
  const reduxCoursesAsListings = reduxPublicCourses.map(convertPublicCourseToListing)

  // Helper function to normalize strings for comparison
  const normalizeString = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  // Get current courses from API listings
  const apiCurrentCourses = listings.filter(course => course.category === "current" && !course.isIsoCertification)

  // Combine Redux courses with API current courses (avoid duplicates)
  // Redux courses take priority as they are the "real" current courses
  const allCurrentCourses = [
    ...reduxCoursesAsListings, // All courses from Redux store (current courses)
    ...apiCurrentCourses.filter((apiCourse: CourseListing) =>
      !reduxCoursesAsListings.some((reduxCourse: CourseListing) =>
        apiCourse.id === reduxCourse.id ||
        normalizeString(apiCourse.name) === normalizeString(reduxCourse.name)
      )
    )
  ]

  // Group courses by category
  const currentCourses = allCurrentCourses

  // Debug logging to help troubleshoot
  console.log('AppleTechnologyDisplay Debug:', {
    reduxPublicCoursesCount: reduxPublicCourses.length,
    reduxCoursesAsListingsCount: reduxCoursesAsListings.length,
    apiCurrentCoursesCount: apiCurrentCourses.length,
    allCurrentCoursesCount: allCurrentCourses.length,
    reduxCoursesTitles: reduxPublicCourses.map(c => c.title),
    currentCoursesTitles: currentCourses.map(c => c.name)
  })

  // Combine future courses and ISO certifications, with ISO certifications sorted in the specified order
  const futureCourses = [
    ...listings.filter(course => course.category === "future" && !course.isIsoCertification),
    ...listings.filter(course => course.isIsoCertification).sort((a, b) => {
      // Sort ISO certifications in the specified order
      const isoOrder = {
        "ISO 9001": 1,
        "ISO 27001": 2,
        "ISO 20000": 3
      }

      // Extract ISO number from name
      const aIsoNumber = a.name.match(/ISO\s+(\d+)/)?.[0] || ""
      const bIsoNumber = b.name.match(/ISO\s+(\d+)/)?.[0] || ""

      return (isoOrder[aIsoNumber as keyof typeof isoOrder] || 999) -
        (isoOrder[bIsoNumber as keyof typeof isoOrder] || 999)
    })
  ]

  // Enhanced pre-assignment with deduplication verification and performance optimization
  const preAssignIcons = (courses: CourseListing[]) => {
    const batchStartTime = performance.now();
    if (iconManager.isVerboseLogging()) {
      console.log(`🎯 Pre-assigning icons for ${courses.length} courses with deduplication...`);
    }

    const assignedIcons = new Set<string>();
    const duplicateDetection: { [key: string]: string[] } = {};
    let processedCount = 0;

    // Batch process courses for better performance
    const batchSize = 10;
    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);

      batch.forEach(course => {
        const assignedIcon = getTechnologyIcon(course.name);
        processedCount++;

        // Track duplicates for debugging
        if (assignedIcons.has(assignedIcon)) {
          if (!duplicateDetection[assignedIcon]) {
            duplicateDetection[assignedIcon] = [];
          }
          duplicateDetection[assignedIcon].push(course.name);
          console.warn(`⚠️ DUPLICATE DETECTED: ${assignedIcon.split('/').pop()?.replace('.svg.png', '')} assigned to multiple courses:`, duplicateDetection[assignedIcon]);
        } else {
          assignedIcons.add(assignedIcon);
        }
      });

      // Yield control to prevent blocking UI (micro-optimization)
      if (i + batchSize < courses.length) {
        // Small delay to prevent blocking
        setTimeout(() => { }, 0);
      }
    }

    const batchEndTime = performance.now();
    const stats = iconManager.getUsageStats();
    const uniqueIcons = assignedIcons.size;
    const duplicateCount = courses.length - uniqueIcons;

    if (iconManager.isVerboseLogging()) {
      console.log(`📊 Pre-assignment complete: ${stats.used}/${stats.total} icons assigned (${stats.utilizationRate}% utilization) [${(batchEndTime - batchStartTime).toFixed(2)}ms]`);
      console.log(`💾 Cache Status: ${stats.cached} courses cached (${stats.performance.cacheHitRate}% hit rate)`);
      console.log(`⚡ Performance: ${stats.performance.cacheHits} hits, ${stats.performance.cacheMisses} misses, avg ${stats.performance.avgAssignmentTime}ms per assignment`);
      console.log(`🎯 Deduplication Status: ${uniqueIcons} unique icons, ${duplicateCount} duplicates ${duplicateCount === 0 ? '✅' : '❌'}`);
      console.log(`📈 Distribution: max ${stats.distribution.maxUsage}, min ${stats.distribution.minUsage}, avg ${stats.distribution.avgUsage}, variance ${stats.distribution.variance} ${stats.distribution.evenDistribution ? '✅' : '⚠️'}`);
      console.log(stats.validationReport);
    }

    if (Object.keys(duplicateDetection).length > 0) {
      console.warn('🚨 Duplicate icons detected in assignment:', duplicateDetection);
    }

    if (!stats.deduplicationValid) {
      console.error('🔴 CRITICAL: Cache validation failed - system integrity compromised!');
    } else if (iconManager.isVerboseLogging()) {
      console.log('✅ Perfect deduplication achieved - all icons are unique!');
    }
  };

  // Reset icon usage when component re-renders or tab changes (optimized)
  useEffect(() => {
    const effectStartTime = performance.now();

    resetIconUsage();

    // Pre-assign icons for current tab to ensure stability
    const coursesToAssign = activeTab === 'current' ? currentCourses : futureCourses;

    // Only process if we have courses to avoid unnecessary work
    if (coursesToAssign.length > 0) {
      preAssignIcons(coursesToAssign);
    }

    const effectEndTime = performance.now();
    if (iconManager.isVerboseLogging()) {
      console.log(`🔄 useEffect completed in ${(effectEndTime - effectStartTime).toFixed(2)}ms`);
    }

  }, [activeTab, listings.length]); // Optimized dependencies - only re-run when tab or course count changes

  return (
    <div className={`space-y-8 ${isSmallScreen ? 'min-h-[20vh]' : 'min-h-[30vh]'}`}>
      {/* Apple-style segmented control */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-card/5 backdrop-blur-sm rounded-full p-1 border border-border/50">
          {/* <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'current'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('current')}
          >
            Current Courses
          </button> */}
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'future'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('future')}
          >
            {/* Future Courses */}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Technology display - Marquee on small screens, grid on larger screens */}
      <AnimatePresence mode="wait">
        {/* {activeTab === 'future' ? ( */}
        {/* Commented out current course grid, only show future courses */}
        {/*   <motion.div
            key="current-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-center items-center"
          >
            {currentCourses.map((course, index) => (
              <TechnologyCard
                key={`${course.id}-${index}`}
                course={course}
                onClick={() => handleIconClick(course)}
              />
            ))}
          </motion.div> */}
        {/* ) : ( */}
          <div>
            <SectionHeader
              title=""
              description=""
              //               title="Future Courses"
              // description="Upcoming courses that will be available soon"
            />
            {/* Mobile label for clarity */}
            <div className="block md:hidden text-center text-primary font-semibold mb-2 text-base">Tap a course to view details</div>
            <motion.div
              key="future-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6 pb-4"
            >
              {futureCourses.map((course, index) => {
                // Convert CourseListing to PublicCourse format for PublicCourseCard
                const publicCourseFormat = {
                  id: course.id,
                  slug: course.id.toLowerCase().replace(/\s+/g, '-'),
                  title: course.name,
                  description: course.description || "",
                  category: course.category,
                  image: course.imageUrl || "",
                  iconUrl: course.iconUrl,
                  instructor: {
                    name: "Expert Instructor",
                    title: ""
                  },
                  level: "All Levels" as const,
                  tags: course.tags,
                  priceUSD: 0,
                  lessonCount: 0,
                  moduleCount: 0,
                  available_for_enrolment: course.available_for_enrolment
                };
                
                return (
                  <motion.div
                    key={`future-${course.id}-${index}`}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                    className="pb-2 cursor-pointer rounded-xl shadow-md border border-primary/10 bg-white dark:bg-slate-900 transition-transform duration-200 hover:scale-[1.03] active:scale-95 focus-within:ring-2 focus-within:ring-primary/40"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleIconClick(course)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${course.name}`}
                  >
                    <PublicCourseCard 
                      course={publicCourseFormat} 
                      onClick={() => handleIconClick(course)} 
                      onClose={handleCloseModal} 
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        {/* )} */}
      </AnimatePresence>

      {/* Course Details Modal */}
      <TechnologyCourseModal
        isOpen={!!selectedCourse}
        onClose={handleCloseModal}
        techCourse={selectedCourse}
        publicCourse={selectedPublicCourse}
      />
    </div>
  )
}

interface TechnologyCardProps {
  course: CourseListing
  onClick: () => void
}

const TechnologyCard = React.memo(function TechnologyCard({ course, onClick }: TechnologyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Define animation variants for the reveal content
  const revealVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: 12,
      transition: {
        height: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1,
        },
        opacity: {
          duration: 0.2,
          ease: [0.34, 1.56, 0.64, 1]
        }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.1 },
        ease: [0.36, 0, 0.66, -0.56]
      }
    }
  }

  // Overlay animation that glides from top to bottom
  const overlayVariants = {
    hidden: { opacity: 0, backgroundPosition: "0% 0%" },
    visible: {
      opacity: 1,
      backgroundPosition: "0% 100%",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <motion.div
          onClick={onClick}
          className="flex flex-col items-center cursor-pointer group w-full"
          variants={iconVariants}
          whileHover="hover"
        >
          {/* Icon Container with gliding overlay - Responsive width */}
          <div className="relative overflow-hidden rounded-xl w-full">
            <div className={`w-full h-24 px-4 backdrop-blur-sm bg-card/5 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
              <div className="w-12 h-12 flex items-center justify-center">
                {course.iconUrl ? (
                  <img
                    src={course.iconUrl.includes('/images/future/') ? course.iconUrl : getProxiedImageUrl(course.iconUrl)}
                    alt={`${course.name} technology icon`}
                    className="w-12 h-12 object-contain rounded-md"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // Fallback to the old system if PNG fails
                      e.currentTarget.src = getTechnologyIcon(course.name);
                    }}
                  />
                ) : (
                  <img
                    src={getTechnologyIcon(course.name)}
                    alt={`${course.name} technology icon`}
                    className="w-12 h-12 object-contain rounded-md"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // Fallback to a diverse icon if image fails to load
                      const fallbackIcons = [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/512px-Node.js_logo.svg.png'
                      ];
                      const randomIndex = Math.floor(Math.random() * fallbackIcons.length);
                      e.currentTarget.src = fallbackIcons[randomIndex];
                    }}
                  />
                )}
              </div>
            </div>

            {/* Gliding overlay effect */}
            {isHovered && (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 backdrop-blur-sm"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                />

                {/* View icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 15
                    }
                  }}
                >
                  <div className="bg-primary/10 backdrop-blur-md p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Progressive Disclosure Content - Reveals below with auto width */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="overflow-hidden mt-0"
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center w-full px-2 py-3">
                  <p className="font-medium text-sm break-words hyphens-auto">{course.name}</p>
                  {course.category === "current" ? (
                    <Badge variant="outline" className="mt-2 bg-green-500/5 text-green-600 border-green-500/20 text-xs">
                      Enroling Now
                    </Badge>
                  ) : course.isIsoCertification ? (
                    <Badge variant="outline" className="mt-2 bg-blue-500/5 text-blue-600 border-blue-500/20 text-xs">
                      ISO Certification
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 bg-amber-500/5 text-amber-600 border-amber-500/20 text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
});
