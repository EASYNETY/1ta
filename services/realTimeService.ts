"use client"

// services/realTimeService.ts - Comprehensive Real-time Service for All Modules
import { io, type Socket } from "socket.io-client"
import { store } from "@/store"

// Import all the slice actions for real-time updates
import { messageReceived, userJoined, userLeft, connectionStatusChanged } from "@/features/chat/store/chatSlice"

class RealTimeService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private currentUser: any = null
  private connectedRooms: Set<string> = new Set()

  initialize(user: any) {
    if (this.socket?.connected) {
      this.disconnect()
    }

    this.currentUser = user

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || "https://api.onetechacademy.com", {
      transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      forceNew: true,
      query: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
      },
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on("connect", () => {
      console.log("🔌 Connected to real-time server")
      this.reconnectAttempts = 0
      store.dispatch(connectionStatusChanged({ status: "connected", timestamp: Date.now() }))

      // Authenticate user
      this.socket!.emit("authenticate", {
        userId: this.currentUser.id,
        userName: this.currentUser.name || this.currentUser.email,
        userEmail: this.currentUser.email,
        userRole: this.currentUser.role,
      })

      // Join role-based rooms for real-time updates
      this.joinRoleBasedRooms()
    })

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from real-time server:", reason)
      store.dispatch(connectionStatusChanged({ status: "disconnected", timestamp: Date.now() }))

      if (reason === "io server disconnect") {
        this.handleReconnect()
      }
    })

    this.socket.on("connect_error", (error) => {
      console.error("🚨 Connection error:", error)
      store.dispatch(
        connectionStatusChanged({
          status: "error",
          error: error.message,
          timestamp: Date.now(),
        }),
      )
      this.handleReconnect()
    })

    this.setupAttendanceListeners()
    this.setupDiscussionListeners()
    this.setupTimetableListeners()
    this.setupPaymentListeners()
    this.setupTicketListeners()
    this.setupChatListeners()
  }

  private setupAttendanceListeners() {
    if (!this.socket) return

    // Attendance real-time events
    this.socket.on("attendance_marked", (data) => {
      console.log("📊 Attendance marked:", data)
      // Dispatch to attendance slice
      store.dispatch({
        type: "attendance/attendanceMarked",
        payload: data,
      })

      // Show notification for relevant users
      if (this.shouldShowAttendanceNotification(data)) {
        this.showNotification("Attendance Update", `${data.studentName} marked as ${data.status}`)
      }
    })

    this.socket.on("attendance_updated", (data) => {
      console.log("📊 Attendance updated:", data)
      store.dispatch({
        type: "attendance/attendanceUpdated",
        payload: data,
      })
    })

    this.socket.on("attendance_statistics_updated", (data) => {
      console.log("📈 Attendance statistics updated:", data)
      store.dispatch({
        type: "attendance/statisticsUpdated",
        payload: data,
      })
    })
  }

  private setupDiscussionListeners() {
    if (!this.socket) return

    // Discussion room real-time events
    this.socket.on("discussion_message", (data) => {
      console.log("💬 Discussion message:", data)
      store.dispatch({
        type: "discussions/messageReceived",
        payload: data,
      })
    })

    this.socket.on("discussion_created", (data) => {
      console.log("🆕 Discussion created:", data)
      store.dispatch({
        type: "discussions/discussionCreated",
        payload: data,
      })

      if (this.shouldShowDiscussionNotification(data)) {
        this.showNotification("New Discussion", `${data.title} created by ${data.createdBy}`)
      }
    })

    this.socket.on("discussion_updated", (data) => {
      console.log("📝 Discussion updated:", data)
      store.dispatch({
        type: "discussions/discussionUpdated",
        payload: data,
      })
    })
  }

  private setupTimetableListeners() {
    if (!this.socket) return

    // Timetable real-time events
    this.socket.on("schedule_event_created", (data) => {
      console.log("📅 Schedule event created:", data)
      store.dispatch({
        type: "schedule/eventCreated",
        payload: data,
      })

      if (this.shouldShowScheduleNotification(data)) {
        this.showNotification("Schedule Update", `New event: ${data.title}`)
      }
    })

    this.socket.on("schedule_event_updated", (data) => {
      console.log("📅 Schedule event updated:", data)
      store.dispatch({
        type: "schedule/eventUpdated",
        payload: data,
      })
    })

    this.socket.on("schedule_event_deleted", (data) => {
      console.log("🗑️ Schedule event deleted:", data)
      store.dispatch({
        type: "schedule/eventDeleted",
        payload: data,
      })
    })

    this.socket.on("timetable_updated", (data) => {
      console.log("📋 Timetable updated:", data)
      store.dispatch({
        type: "schedule/timetableUpdated",
        payload: data,
      })
    })
  }

  private setupPaymentListeners() {
    if (!this.socket) return

    // Payment real-time events
    this.socket.on("payment_status_updated", (data) => {
      console.log("💳 Payment status updated:", data)
      store.dispatch({
        type: "payments/statusUpdated",
        payload: data,
      })

      if (this.shouldShowPaymentNotification(data)) {
        this.showNotification("Payment Update", `Payment ${data.status}: ${data.amount}`)
      }
    })

    this.socket.on("invoice_created", (data) => {
      console.log("🧾 Invoice created:", data)
      store.dispatch({
        type: "payments/invoiceCreated",
        payload: data,
      })
    })

    this.socket.on("payment_received", (data) => {
      console.log("💰 Payment received:", data)
      store.dispatch({
        type: "payments/paymentReceived",
        payload: data,
      })

      if (this.shouldShowPaymentNotification(data)) {
        this.showNotification("Payment Received", `Payment of ${data.amount} received`)
      }
    })

    this.socket.on("payment_failed", (data) => {
      console.log("❌ Payment failed:", data)
      store.dispatch({
        type: "payments/paymentFailed",
        payload: data,
      })

      if (data.userId === this.currentUser.id) {
        this.showNotification("Payment Failed", "Your payment could not be processed")
      }
    })
  }

  private setupTicketListeners() {
    if (!this.socket) return

    // Support ticket real-time events
    this.socket.on("ticket_created", (data) => {
      console.log("🎫 Ticket created:", data)
      store.dispatch({
        type: "support/ticketCreated",
        payload: data,
      })

      if (this.shouldShowTicketNotification(data)) {
        this.showNotification("New Ticket", `Ticket #${data.id}: ${data.subject}`)
      }
    })

    this.socket.on("ticket_updated", (data) => {
      console.log("🎫 Ticket updated:", data)
      store.dispatch({
        type: "support/ticketUpdated",
        payload: data,
      })

      if (this.shouldShowTicketNotification(data)) {
        this.showNotification("Ticket Update", `Ticket #${data.id} status: ${data.status}`)
      }
    })

    this.socket.on("ticket_response_added", (data) => {
      console.log("💬 Ticket response added:", data)
      store.dispatch({
        type: "support/responseAdded",
        payload: data,
      })

      if (this.shouldShowTicketNotification(data)) {
        this.showNotification("Ticket Response", `New response on ticket #${data.ticketId}`)
      }
    })

    this.socket.on("ticket_assigned", (data) => {
      console.log("👤 Ticket assigned:", data)
      store.dispatch({
        type: "support/ticketAssigned",
        payload: data,
      })

      if (data.assignedTo === this.currentUser.id) {
        this.showNotification("Ticket Assigned", `You have been assigned ticket #${data.ticketId}`)
      }
    })
  }

  private setupChatListeners() {
    if (!this.socket) return

    // Chat events (existing functionality)
    this.socket.on("newMessage", (message) => {
      console.log("📩 New message received:", message)
      store.dispatch(
        messageReceived({
          ...message,
          timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
          isDelivered: true,
          deliveredAt: new Date().toISOString(),
        }),
      )
    })

    this.socket.on("userJoined", (data) => {
      console.log("👋 User joined:", data)
      store.dispatch(userJoined(data))
    })

    this.socket.on("userLeft", (data) => {
      console.log("👋 User left:", data)
      store.dispatch(userLeft(data))
    })
  }

  private joinRoleBasedRooms() {
    if (!this.socket || !this.currentUser) return

    const userRole = this.currentUser.role

    // Join global room for all users
    this.socket.emit("joinRoom", { roomId: "global", userId: this.currentUser.id })

    // Join role-specific rooms
    this.socket.emit("joinRoom", { roomId: `role_${userRole}`, userId: this.currentUser.id })

    // Join module-specific rooms based on role permissions
    const moduleRooms = this.getModuleRoomsForRole(userRole)
    moduleRooms.forEach((room) => {
      this.socket!.emit("joinRoom", { roomId: room, userId: this.currentUser.id })
    })
  }

  private getModuleRoomsForRole(role: string): string[] {
    const rooms: string[] = []

    switch (role) {
      case "super_admin":
        rooms.push(
          "attendance_updates",
          "discussion_updates",
          "timetable_updates",
          "payment_updates",
          "ticket_updates",
          "admin_notifications",
        )
        break

      case "admin":
        rooms.push(
          "attendance_updates",
          "discussion_updates",
          "timetable_updates",
          "ticket_updates",
          "admin_notifications",
        )
        break

      case "customer_care":
        rooms.push(
          "attendance_updates",
          "discussion_updates",
          "timetable_updates",
          "ticket_updates",
          "support_notifications",
        )
        break

      case "student":
        rooms.push(
          "attendance_updates",
          "discussion_updates",
          "timetable_updates",
          "ticket_updates",
          "student_notifications",
        )
        break

      case "accounting":
        rooms.push("payment_updates", "accounting_notifications")
        break

      default:
        rooms.push("general_updates")
    }

    return rooms
  }

  // Notification permission checks
  private shouldShowAttendanceNotification(data: any): boolean {
    const userRole = this.currentUser.role

    // Show to admins and customer care for all attendance
    if (["super_admin", "admin", "customer_care"].includes(userRole)) {
      return true
    }

    // Show to students only for their own attendance
    if (userRole === "student" && data.studentId === this.currentUser.id) {
      return true
    }

    return false
  }

  private shouldShowDiscussionNotification(data: any): boolean {
    // Show discussion notifications to all roles
    return true
  }

  private shouldShowScheduleNotification(data: any): boolean {
    // Show schedule notifications to all roles
    return true
  }

  private shouldShowPaymentNotification(data: any): boolean {
    const userRole = this.currentUser.role

    // Show to admins and accounting for all payments
    if (["super_admin", "admin", "accounting"].includes(userRole)) {
      return true
    }

    // Show to users only for their own payments
    if (data.userId === this.currentUser.id) {
      return true
    }

    return false
  }

  private shouldShowTicketNotification(data: any): boolean {
    const userRole = this.currentUser.role

    // Show to support staff for all tickets
    if (["super_admin", "admin", "customer_care"].includes(userRole)) {
      return true
    }

    // Show to users only for their own tickets
    if (data.userId === this.currentUser.id || data.assignedTo === this.currentUser.id) {
      return true
    }

    return false
  }

  private showNotification(title: string, message: string) {
    // Check if notifications are supported and permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
      })
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("🚫 Max reconnect attempts reached")
      return
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    this.reconnectAttempts++

    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    this.reconnectTimeout = setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect()
      }
    }, delay)
  }

  // Public methods for manual event emission
  emitAttendanceUpdate(data: any) {
    if (this.socket?.connected) {
      this.socket.emit("attendance_update", data)
    }
  }

  emitDiscussionUpdate(data: any) {
    if (this.socket?.connected) {
      this.socket.emit("discussion_update", data)
    }
  }

  emitScheduleUpdate(data: any) {
    if (this.socket?.connected) {
      this.socket.emit("schedule_update", data)
    }
  }

  emitPaymentUpdate(data: any) {
    if (this.socket?.connected) {
      this.socket.emit("payment_update", data)
    }
  }

  emitTicketUpdate(data: any) {
    if (this.socket?.connected) {
      this.socket.emit("ticket_update", data)
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getConnectionStatus() {
    if (!this.socket) return "disconnected"
    if (this.socket.connected) return "connected"
    if (this.socket.connecting) return "connecting"
    return "disconnected"
  }

  disconnect() {
    console.log("🔌 Disconnecting from real-time server")

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.connectedRooms.clear()

    if (this.socket) {
      this.socket.disconnect()
      this.socket.removeAllListeners()
      this.socket = null
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return Notification.permission === "granted"
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService()

// React hook for using real-time service
import { useEffect } from "react"
import { useAppSelector } from "@/store/hooks"

export const useRealTime = () => {
  const currentUser = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (currentUser && !realTimeService.isConnected()) {
      realTimeService.initialize(currentUser)

      // Request notification permission
      realTimeService.requestNotificationPermission()
    }

    return () => {
      // Don't disconnect on unmount as we want persistent connection
    }
  }, [currentUser])

  return {
    isConnected: realTimeService.isConnected(),
    connectionStatus: realTimeService.getConnectionStatus(),
    emitAttendanceUpdate: realTimeService.emitAttendanceUpdate.bind(realTimeService),
    emitDiscussionUpdate: realTimeService.emitDiscussionUpdate.bind(realTimeService),
    emitScheduleUpdate: realTimeService.emitScheduleUpdate.bind(realTimeService),
    emitPaymentUpdate: realTimeService.emitPaymentUpdate.bind(realTimeService),
    emitTicketUpdate: realTimeService.emitTicketUpdate.bind(realTimeService),
    requestNotificationPermission: realTimeService.requestNotificationPermission.bind(realTimeService),
  }
}
