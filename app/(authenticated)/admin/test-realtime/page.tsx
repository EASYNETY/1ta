"use client"

import { RealTimeTestPanel } from "@/components/testing/RealTimeTestPanel"
import { PageHeader } from "@/components/layout/auth/page-header"
import { PermissionGuard } from "@/components/auth/PermissionGuard"

export default function TestRealTimePage() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Real-time testing is only available in development mode.</p>
      </div>
    )
  }

  return (
    <PermissionGuard
      allowedRoles={["super_admin", "admin"]}
      fallback={
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Access denied. Admin privileges required for testing.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          heading="Real-Time Features Testing"
          subheading="Test and verify real-time updates across all modules and user roles"
        />

        <RealTimeTestPanel />

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Ensure you're connected to the real-time server (check connection status)</li>
            <li>2. Use the event simulators to generate test events for each module</li>
            <li>3. Verify events appear in the Event Log tab</li>
            <li>4. Check Test Results to see if events are received correctly for your role</li>
            <li>5. Test with different user roles to verify role-based permissions</li>
            <li>6. Run "Run All Tests" for comprehensive testing</li>
          </ul>
        </div>
      </div>
    </PermissionGuard>
  )
}
