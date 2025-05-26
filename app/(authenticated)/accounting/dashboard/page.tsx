// app/(authenticated)/accounting/dashboard/page.tsx

"use client";

import React from 'react';
import { AccountingGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

// Mock data for demonstration
const paymentStats = {
  totalRevenue: { value: '₦2,450,000', change: '+12%', trend: 'up' },
  pendingPayments: { value: '₦180,000', change: '-5%', trend: 'down' },
  reconciled: { value: '95%', change: '+2%', trend: 'up' },
  failedTransactions: { value: '23', change: '-8%', trend: 'down' }
};

const recentPayments = [
  {
    id: 'PAY-001',
    studentName: 'John Doe',
    studentId: 'STU-00001',
    amount: '₦50,000',
    status: 'Successful',
    date: '2025-01-26',
    method: 'Bank Transfer'
  },
  {
    id: 'PAY-002',
    studentName: 'Jane Smith',
    studentId: 'STU-00002',
    amount: '₦75,000',
    status: 'Pending',
    date: '2025-01-26',
    method: 'Card Payment'
  },
  {
    id: 'PAY-003',
    studentName: 'Mike Johnson',
    studentId: 'STU-00003',
    amount: '₦60,000',
    status: 'Failed',
    date: '2025-01-25',
    method: 'Online Transfer'
  }
];

function PaymentStatsCard({ 
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
          {trend === 'up' ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {change}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentPaymentsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Latest payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{payment.studentName}</p>
                  <p className="text-sm text-muted-foreground">{payment.studentId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <p className="text-sm text-muted-foreground">{payment.method}</p>
                </div>
                <Badge 
                  variant={
                    payment.status === 'Successful' ? 'default' :
                    payment.status === 'Pending' ? 'secondary' : 'destructive'
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountingDashboard() {
  return (
    <AccountingGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Analytics</h1>
          <p className="text-muted-foreground">
            Financial overview and payment trends for 1Tech Academy
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PaymentStatsCard
            title="Total Revenue"
            value={paymentStats.totalRevenue.value}
            change={paymentStats.totalRevenue.change}
            trend={paymentStats.totalRevenue.trend as 'up' | 'down'}
            icon={DollarSign}
          />
          <PaymentStatsCard
            title="Pending Payments"
            value={paymentStats.pendingPayments.value}
            change={paymentStats.pendingPayments.change}
            trend={paymentStats.pendingPayments.trend as 'up' | 'down'}
            icon={CreditCard}
          />
          <PaymentStatsCard
            title="Reconciled"
            value={paymentStats.reconciled.value}
            change={paymentStats.reconciled.change}
            trend={paymentStats.reconciled.trend as 'up' | 'down'}
            icon={CheckCircle}
          />
          <PaymentStatsCard
            title="Failed Transactions"
            value={paymentStats.failedTransactions.value}
            change={paymentStats.failedTransactions.change}
            trend={paymentStats.failedTransactions.trend as 'up' | 'down'}
            icon={AlertCircle}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Trends</CardTitle>
              <CardDescription>Monthly payment volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Payment trends chart will be implemented here</p>
                  <p className="text-sm">Integration with backend required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Payment methods chart will be implemented here</p>
                  <p className="text-sm">Integration with backend required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <RecentPaymentsTable />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common accounting tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Generate Report</p>
                <p className="text-sm text-muted-foreground">Create financial reports</p>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Reconcile Payments</p>
                <p className="text-sm text-muted-foreground">Match transactions</p>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <CreditCard className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download payment data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountingGuard>
  );
}
