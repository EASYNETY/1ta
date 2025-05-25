'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RateLimitNoticeProps {
  isVisible: boolean
  message?: string
  retryAfterSeconds?: number
  onRetry?: () => void
  className?: string
}

export function RateLimitNotice({
  isVisible,
  message = "Too many requests. Please wait before trying again.",
  retryAfterSeconds = 30,
  onRetry,
  className
}: RateLimitNoticeProps) {
  const [timeLeft, setTimeLeft] = useState(retryAfterSeconds)
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(retryAfterSeconds)
      setCanRetry(false)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanRetry(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, retryAfterSeconds])

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Ready"
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800",
            "rounded-lg shadow-lg backdrop-blur-sm",
            "p-4 max-w-md w-full mx-4",
            className
          )}
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Rate Limit Reached
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {message}
              </p>

              {/* Countdown */}
              <div className="mt-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-mono text-amber-800 dark:text-amber-200">
                  {canRetry ? "Ready to retry" : `Wait: ${formatTime(timeLeft)}`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-1.5">
                <motion.div
                  className="bg-amber-600 dark:bg-amber-400 h-1.5 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ 
                    width: canRetry ? "100%" : `${((retryAfterSeconds - timeLeft) / retryAfterSeconds) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Retry button */}
              {canRetry && onRetry && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={onRetry}
                  className={cn(
                    "mt-3 inline-flex items-center space-x-2",
                    "px-3 py-1.5 text-sm font-medium",
                    "bg-amber-600 hover:bg-amber-700 text-white",
                    "rounded-md transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              💡 <strong>Tip:</strong> Rate limits help ensure fair usage. Try refreshing the page or waiting a moment.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to manage rate limit notices
export function useRateLimitNotice() {
  const [isVisible, setIsVisible] = useState(false)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(30)
  const [message, setMessage] = useState("")

  const showNotice = (errorMessage: string, retryAfter: number = 30) => {
    setMessage(errorMessage)
    setRetryAfterSeconds(retryAfter)
    setIsVisible(true)
  }

  const hideNotice = () => {
    setIsVisible(false)
  }

  const handleRetry = () => {
    setIsVisible(false)
    // You can add retry logic here or pass it as a callback
  }

  return {
    isVisible,
    message,
    retryAfterSeconds,
    showNotice,
    hideNotice,
    handleRetry
  }
}

// Utility to extract retry-after from error messages
export function extractRetryAfter(errorMessage: string): number {
  const match = errorMessage.match(/retry.*?(\d+).*?second/i)
  return match ? parseInt(match[1]) : 30
}
