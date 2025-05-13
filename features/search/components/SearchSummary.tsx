"use client"

import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectSearchResults, selectFilteredResults } from '../store/search-slice'
import { Card, CardContent } from '@/components/ui/card'
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  BarChart2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchSummary() {
  const allResults = useAppSelector(selectSearchResults)
  const filteredResults = useAppSelector(selectFilteredResults)
  
  if (allResults.length === 0) return null
  
  // Count results by type
  const countByType = {
    course: allResults.filter(r => r.type === 'course').length,
    assignment: allResults.filter(r => r.type === 'assignment').length,
    grade: allResults.filter(r => r.type === 'grade').length,
    event: allResults.filter(r => r.type === 'event').length,
    payment: allResults.filter(r => r.type === 'payment').length,
  }
  
  // Count filtered results
  const filteredCount = filteredResults.length
  
  // Calculate percentage of filtered results
  const filteredPercentage = Math.round((filteredCount / allResults.length) * 100)
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-medium">Search Results</h3>
            <p className="text-xs text-muted-foreground">
              Found {allResults.length} results, showing {filteredCount} ({filteredPercentage}%)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <ResultTypeIndicator 
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Courses"
              count={countByType.course}
              color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            />
            
            <ResultTypeIndicator 
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Assignments"
              count={countByType.assignment}
              color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            />
            
            <ResultTypeIndicator 
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              label="Grades"
              count={countByType.grade}
              color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            />
            
            <ResultTypeIndicator 
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Events"
              count={countByType.event}
              color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            />
            
            <ResultTypeIndicator 
              icon={<CreditCard className="h-3.5 w-3.5" />}
              label="Payments"
              count={countByType.payment}
              color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            />
          </div>
        </div>
        
        {/* Progress bar showing filtered vs total */}
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${filteredPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ResultTypeIndicatorProps {
  icon: React.ReactNode
  label: string
  count: number
  color: string
}

function ResultTypeIndicator({ icon, label, count, color }: ResultTypeIndicatorProps) {
  if (count === 0) return null
  
  return (
    <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full", color)}>
      {icon}
      <span>{label}: {count}</span>
    </div>
  )
}
