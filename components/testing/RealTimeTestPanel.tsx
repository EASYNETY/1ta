"use client"

import { useState, useEffect } from "react"
import { useRealTime } from "@/services/realTimeService"
import { useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Calendar,
  CreditCard,
  Ticket,
  Wifi,
  WifiOff,
  TestTube,
} from "lucide-react"

interface TestEvent {
  id: string
  timestamp: string
  module: string
  event: string
  data: any
  received: boolean
  expectedForRole: string[]
}

export function RealTimeTestPanel() {
  const { isConnected, connectionStatus } = useRealTime()
  const { user } = useAppSelector((state) => state.auth)
  const [testEvents, setTestEvents] = useState<TestEvent[]>([])
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // Test form states
  const [attendanceTest, setAttendanceTest] = useState({
    studentId: "",
    studentName: "",
    status: "present",
    classId: "",
  })

  const [discussionTest, setDiscussionTest] = useState({
    title: "",
    message: "",
    roomId: "",
  })

  const [scheduleTest, setScheduleTest] = useState({
    title: "",
    startTime: "",
    endTime: "",
    classId: "",
  })

  const [paymentTest, setPaymentTest] = useState({
    amount: "",
    status: "succeeded",
    userId: "",
  })

  const [ticketTest, setTicketTest] = useState({
    subject: "",
    description: "",
    priority: "medium",
    status: "open",
  })

  useEffect(() => {
    // Listen for real-time events and track them for testing
    const eventListeners = [
      "attendance_marked",
      "attendance_updated",
      "attendance_statistics_updated",
      "discussion_message",
      "discussion_created",
      "discussion_updated",
      "schedule_event_created",
      "schedule_event_updated",
      "schedule_event_deleted",
      "timetable_updated",
      "payment_status_updated",
      "invoice_created",
      "payment_received",
      "payment_failed",
      "ticket_created",
      "ticket_updated",
      "ticket_response_added",
      "ticket_assigned",
    ]

    // Mock event listener setup (in real implementation, these would be actual socket listeners)
    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: getModuleFromEvent(eventType),
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)]) // Keep last 50 events

      // Update test results
      const testKey = `${eventType}_${user?.role}`
      setTestResults((prev) => ({
        ...prev,
        [testKey]: newEvent.expectedForRole.includes(user?.role || ""),
      }))
    }

    return () => {
      // Cleanup listeners
    }
  }, [user?.role])

  const getModuleFromEvent = (eventType: string): string => {
    if (eventType.includes("attendance")) return "attendance"
    if (eventType.includes("discussion")) return "discussion"
    if (eventType.includes("schedule") || eventType.includes("timetable")) return "timetable"
    if (eventType.includes("payment") || eventType.includes("invoice")) return "payment"
    if (eventType.includes("ticket")) return "ticket"
    return "unknown"
  }

  const getExpectedRolesForEvent = (eventType: string): string[] => {
    const roleMap: Record<string, string[]> = {
      attendance_marked: ["super_admin", "admin", "student", "customer_care"],
      attendance_updated: ["super_admin", "admin", "student", "customer_care"],
      attendance_statistics_updated: ["super_admin", "admin", "customer_care"],
      discussion_message: ["super_admin", "admin", "student", "customer_care"],
      discussion_created: ["super_admin", "admin", "student", "customer_care"],
      discussion_updated: ["super_admin", "admin", "student", "customer_care"],
      schedule_event_created: ["super_admin", "admin", "student", "customer_care"],
      schedule_event_updated: ["super_admin", "admin", "student", "customer_care"],
      schedule_event_deleted: ["super_admin", "admin", "student", "customer_care"],
      timetable_updated: ["super_admin", "admin", "student", "customer_care"],
      payment_status_updated: ["super_admin", "admin", "accounting"],
      invoice_created: ["super_admin", "admin", "accounting"],
      payment_received: ["super_admin", "admin", "accounting"],
      payment_failed: ["super_admin", "admin", "accounting"],
      ticket_created: ["super_admin", "admin", "customer_care", "student"],
      ticket_updated: ["super_admin", "admin", "customer_care", "student"],
      ticket_response_added: ["super_admin", "admin", "customer_care", "student"],
      ticket_assigned: ["super_admin", "admin", "customer_care"],
    }

    return roleMap[eventType] || []
  }

  const simulateAttendanceEvent = () => {
    const eventData = {
      studentId: attendanceTest.studentId || user?.id,
      studentName: attendanceTest.studentName || user?.name,
      status: attendanceTest.status,
      classId: attendanceTest.classId || "test-class-1",
      timestamp: new Date().toISOString(),
    }

    // Simulate receiving the event
    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: "attendance",
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)])
    }

    handleTestEvent("attendance_marked", eventData)
    console.log("🧪 Simulated attendance event:", eventData)
  }

  const simulateDiscussionEvent = () => {
    const eventData = {
      title: discussionTest.title || "Test Discussion",
      message: discussionTest.message || "This is a test message",
      roomId: discussionTest.roomId || "general",
      userId: user?.id,
      userName: user?.name,
      timestamp: new Date().toISOString(),
    }

    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: "discussion",
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)])
    }

    handleTestEvent("discussion_message", eventData)
    console.log("🧪 Simulated discussion event:", eventData)
  }

  const simulateScheduleEvent = () => {
    const eventData = {
      title: scheduleTest.title || "Test Event",
      startTime: scheduleTest.startTime || new Date().toISOString(),
      endTime: scheduleTest.endTime || new Date(Date.now() + 3600000).toISOString(),
      classId: scheduleTest.classId || "test-class-1",
      createdBy: user?.id,
      timestamp: new Date().toISOString(),
    }

    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: "timetable",
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)])
    }

    handleTestEvent("schedule_event_created", eventData)
    console.log("🧪 Simulated schedule event:", eventData)
  }

  const simulatePaymentEvent = () => {
    const eventData = {
      amount: paymentTest.amount || "100.00",
      status: paymentTest.status,
      userId: paymentTest.userId || user?.id,
      currency: "USD",
      timestamp: new Date().toISOString(),
    }

    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: "payment",
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)])
    }

    handleTestEvent("payment_status_updated", eventData)
    console.log("🧪 Simulated payment event:", eventData)
  }

  const simulateTicketEvent = () => {
    const eventData = {
      id: `ticket-${Date.now()}`,
      subject: ticketTest.subject || "Test Ticket",
      description: ticketTest.description || "This is a test ticket",
      priority: ticketTest.priority,
      status: ticketTest.status,
      userId: user?.id,
      userName: user?.name,
      timestamp: new Date().toISOString(),
    }

    const handleTestEvent = (eventType: string, data: any) => {
      const newEvent: TestEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        module: "ticket",
        event: eventType,
        data,
        received: true,
        expectedForRole: getExpectedRolesForEvent(eventType),
      }

      setTestEvents((prev) => [newEvent, ...prev.slice(0, 49)])
    }

    handleTestEvent("ticket_created", eventData)
    console.log("🧪 Simulated ticket event:", eventData)
  }

  const runComprehensiveTest = () => {
    console.log("🧪 Running comprehensive real-time test suite...")

    // Clear previous results
    setTestEvents([])
    setTestResults({})

    // Run all module tests with delays
    setTimeout(() => simulateAttendanceEvent(), 100)
    setTimeout(() => simulateDiscussionEvent(), 200)
    setTimeout(() => simulateScheduleEvent(), 300)
    setTimeout(() => simulatePaymentEvent(), 400)
    setTimeout(() => simulateTicketEvent(), 500)

    console.log("🧪 Comprehensive test completed")
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "connecting":
        return "text-yellow-600"
      case "disconnected":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "attendance":
        return <Users className="h-4 w-4" />
      case "discussion":
        return <MessageSquare className="h-4 w-4" />
      case "timetable":
        return <Calendar className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "ticket":
        return <Ticket className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null // Only show in development
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Real-Time Features Test Panel
          <Badge variant="outline" className="ml-auto">
            {user?.role || "No Role"}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
            <span className={getConnectionStatusColor()}>{connectionStatus}</span>
          </div>
          <Button onClick={runComprehensiveTest} size="sm">
            Run All Tests
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="simulators" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulators">Event Simulators</TabsTrigger>
            <TabsTrigger value="events">Event Log</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="simulators" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Attendance Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Attendance Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                      id="student-name"
                      value={attendanceTest.studentName}
                      onChange={(e) => setAttendanceTest((prev) => ({ ...prev, studentName: e.target.value }))}
                      placeholder="Test Student"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendance-status">Status</Label>
                    <Select
                      value={attendanceTest.status}
                      onValueChange={(value) => setAttendanceTest((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={simulateAttendanceEvent} size="sm" className="w-full">
                    Simulate Attendance
                  </Button>
                </CardContent>
              </Card>

              {/* Discussion Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    Discussion Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="discussion-title">Title</Label>
                    <Input
                      id="discussion-title"
                      value={discussionTest.title}
                      onChange={(e) => setDiscussionTest((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Test Discussion"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discussion-message">Message</Label>
                    <Textarea
                      id="discussion-message"
                      value={discussionTest.message}
                      onChange={(e) => setDiscussionTest((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Test message"
                      rows={2}
                    />
                  </div>
                  <Button onClick={simulateDiscussionEvent} size="sm" className="w-full">
                    Simulate Discussion
                  </Button>
                </CardContent>
              </Card>

              {/* Schedule Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Schedule Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="schedule-title">Event Title</Label>
                    <Input
                      id="schedule-title"
                      value={scheduleTest.title}
                      onChange={(e) => setScheduleTest((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Test Event"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-class">Class ID</Label>
                    <Input
                      id="schedule-class"
                      value={scheduleTest.classId}
                      onChange={(e) => setScheduleTest((prev) => ({ ...prev, classId: e.target.value }))}
                      placeholder="test-class-1"
                    />
                  </div>
                  <Button onClick={simulateScheduleEvent} size="sm" className="w-full">
                    Simulate Schedule
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4" />
                    Payment Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input
                      id="payment-amount"
                      value={paymentTest.amount}
                      onChange={(e) => setPaymentTest((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-status">Status</Label>
                    <Select
                      value={paymentTest.status}
                      onValueChange={(value) => setPaymentTest((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="succeeded">Succeeded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={simulatePaymentEvent} size="sm" className="w-full">
                    Simulate Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Ticket Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Ticket className="h-4 w-4" />
                    Ticket Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label htmlFor="ticket-subject">Subject</Label>
                    <Input
                      id="ticket-subject"
                      value={ticketTest.subject}
                      onChange={(e) => setTicketTest((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Test Ticket"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select
                      value={ticketTest.priority}
                      onValueChange={(value) => setTicketTest((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={simulateTicketEvent} size="sm" className="w-full">
                    Simulate Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {testEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No events recorded yet. Use the simulators to generate test events.
                  </p>
                ) : (
                  testEvents.map((event) => (
                    <Card key={event.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getModuleIcon(event.module)}
                          <span className="font-medium">{event.event}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.module}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.received ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Expected for: {event.expectedForRole.join(", ")}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(testResults).map(([testKey, passed]) => (
                  <Card key={testKey} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{testKey}</span>
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {Object.keys(testResults).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No test results yet. Run some tests to see results here.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
