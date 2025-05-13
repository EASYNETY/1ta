"use client"

import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectNotifications } from '@/features/notifications/store/notifications-slice'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, GraduationCap, FileText, Calendar, CreditCard, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { SearchResult } from '../types/search-types'

interface RecentActivityProps {
  recentItems: SearchResult[]
}

export function RecentActivity({ recentItems }: RecentActivityProps) {
  if (!recentItems || recentItems.length === 0) {
    return null
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium flex items-center mb-4">
        <Bell className="h-4 w-4 mr-2" />
        Recent Activity
      </h3>
      
      <div className="grid gap-4">
        {recentItems.map(item => (
          <ActivityCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  )
}

function ActivityCard({ item }: { item: SearchResult }) {
  return (
    <Link href={item.href}>
      <Card className="overflow-hidden transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                {getItemIcon(item.type)}
              </div>
              <CardTitle className="text-sm">{item.title}</CardTitle>
            </div>
            <Badge 
              variant="secondary"
              className={cn(
                "capitalize text-xs",
                item.status ? getStatusColor(item.status) : ""
              )}
            >
              {item.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs line-clamp-1">{item.description}</CardDescription>
        </CardContent>
        {item.date && (
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}

function getItemIcon(type: string) {
  switch (type) {
    case 'course':
      return <BookOpen className="h-4 w-4" />
    case 'user':
      return <Bell className="h-4 w-4" />
    case 'assignment':
      return <FileText className="h-4 w-4" />
    case 'grade':
      return <GraduationCap className="h-4 w-4" />
    case 'event':
      return <Calendar className="h-4 w-4" />
    case 'payment':
      return <CreditCard className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'succeeded':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'refunded':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}
