// app/(authenticated)/customer-care/dashboard/page.tsx

"use client";

import React from 'react';
import { CustomerCareGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  Users, 
  MessageSquare, 
  LifeBuoy, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Search
} from 'lucide-react';

// Mock data for demonstration
const customerCareStats = {
  totalTickets: { value: '156', change: '+8%', trend: 'up' },
  openTickets: { value: '23', change: '-12%', trend: 'down' },
  resolvedToday: { value: '18', change: '+25%', trend: 'up' },
  avgResponseTime: { value: '2.4h', change: '-15%', trend: 'down' }
};

const recentTickets = [
  {
    id: 'TKT-001',
    studentName: 'John Doe',
    studentId: 'STU-00001',
    subject: 'Login Issues',
    status: 'Open',
    priority: 'High',
    created: '2 hours ago'
  },
  {
    id: 'TKT-002',
    studentName: 'Jane Smith',
    studentId: 'STU-00002',
    subject: 'Course Access Problem',
    status: 'In Progress',
    priority: 'Medium',
    created: '4 hours ago'
  },
  {
    id: 'TKT-003',
    studentName: 'Mike Johnson',
    studentId: 'STU-00003',
    subject: 'Payment Query',
    status: 'Resolved',
    priority: 'Low',
    created: '1 day ago'
  }
];

function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down'; 
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <TrendingUp className={`mr-1 h-3 w-3 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {change}
          </span>
          <span className="ml-1">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTicketsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.studentName} ({ticket.studentId})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={
                    ticket.priority === 'High' ? 'destructive' :
                    ticket.priority === 'Medium' ? 'default' : 'secondary'
                  }
                >
                  {ticket.priority}
                </Badge>
                <Badge 
                  variant={
                    ticket.status === 'Open' ? 'destructive' :
                    ticket.status === 'In Progress' ? 'default' : 'secondary'
                  }
                >
                  {ticket.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{ticket.created}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerCareDashboard() {
  return (
    <CustomerCareGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Care Dashboard</h1>
          <p className="text-muted-foreground">
            Support overview and student assistance tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tickets"
            value={customerCareStats.totalTickets.value}
            change={customerCareStats.totalTickets.change}
            trend={customerCareStats.totalTickets.trend as 'up' | 'down'}
            icon={LifeBuoy}
          />
          <StatsCard
            title="Open Tickets"
            value={customerCareStats.openTickets.value}
            change={customerCareStats.openTickets.change}
            trend={customerCareStats.openTickets.trend as 'up' | 'down'}
            icon={AlertCircle}
          />
          <StatsCard
            title="Resolved Today"
            value={customerCareStats.resolvedToday.value}
            change={customerCareStats.resolvedToday.change}
            trend={customerCareStats.resolvedToday.trend as 'up' | 'down'}
            icon={CheckCircle}
          />
          <StatsCard
            title="Avg Response Time"
            value={customerCareStats.avgResponseTime.value}
            change={customerCareStats.avgResponseTime.change}
            trend={customerCareStats.avgResponseTime.trend as 'up' | 'down'}
            icon={Clock}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common customer care tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <QrCode className="h-6 w-6" />
                  <span>Scan Student Barcode</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Search className="h-6 w-6" />
                  <span>Search Student</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>New Ticket</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Student Directory</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>Your activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tickets Resolved</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Students Assisted</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Barcodes Scanned</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-medium">2.4 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <RecentTicketsTable />

        {/* Student Information Access */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information Access</CardTitle>
            <CardDescription>Read-only access to student data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Scan Student Barcode</h3>
              <p className="text-muted-foreground mb-4">
                Use the barcode scanner to quickly access student information, attendance records, and timetables.
              </p>
              <Button>
                <QrCode className="mr-2 h-4 w-4" />
                Open Scanner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerCareGuard>
  );
}
