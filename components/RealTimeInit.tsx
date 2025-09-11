"use client"

import { useEffect } from "react"
import { useRealTime } from "@/services/realTimeService"

export default function RealTimeInit() {
  const { isConnected, connectionStatus, requestNotificationPermission } = useRealTime()

  useEffect(() => {
    // Request notification permission when component mounts
    requestNotificationPermission()
  }, [requestNotificationPermission])

  // Optional: Show connection status in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔌 Real-time connection status: ${connectionStatus}`)
    }
  }, [connectionStatus])

  return null // nothing visual
}
