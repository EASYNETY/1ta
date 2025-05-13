"use client"

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { Search, ArrowLeft, User, BookOpen, GraduationCap, FileText, Calendar, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

// Define search result types
interface SearchResult {
  id: string
  title: string
  description: string
  type: 'course' | 'user' | 'assignment' | 'grade' | 'event' | 'payment'
  href: string
  date?: string
  status?: string
  image?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Get data from Redux store
  const { courses } = useAppSelector(state => state.auth_courses)
  const { assignments } = useAppSelector(state => state.assignments)
  const { grades } = useAppSelector(state => state.grades)
  const { events } = useAppSelector(state => state.schedule)
  const { myPayments } = useAppSelector(state => state.paymentHistory)
  
  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase()
      const results: SearchResult[] = []
      
      // Search courses
      courses.forEach(course => {
        if (
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
        ) {
          results.push({
            id: course.id,
            title: course.title,
            description: course.description.substring(0, 100) + '...',
            type: 'course',
            href: `/courses/${course.slug}`,
            status: course.enrollmentStatus,
            image: course.image
          })
        }
      })
      
      // Search assignments
      assignments.forEach(assignment => {
        if (
          assignment.title.toLowerCase().includes(query) ||
          assignment.description.toLowerCase().includes(query)
        ) {
          results.push({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description.substring(0, 100) + '...',
            type: 'assignment',
            href: `/assignments/${assignment.id}`,
            date: assignment.dueDate,
            status: assignment.status
          })
        }
      })
      
      // Search grades
      grades.forEach(grade => {
        if (
          grade.title.toLowerCase().includes(query) ||
          grade.courseName.toLowerCase().includes(query)
        ) {
          results.push({
            id: grade.id,
            title: grade.title,
            description: `${grade.courseName} - Score: ${grade.score}%`,
            type: 'grade',
            href: `/grades`,
            date: grade.date
          })
        }
      })
      
      // Search events
      events.forEach(event => {
        if (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        ) {
          results.push({
            id: event.id,
            title: event.title,
            description: event.description || 'No description',
            type: 'event',
            href: `/schedule`,
            date: event.startTime
          })
        }
      })
      
      // Search payments
      myPayments.forEach(payment => {
        if (
          payment.description.toLowerCase().includes(query) ||
          payment.providerReference.toLowerCase().includes(query)
        ) {
          results.push({
            id: payment.id,
            title: payment.description,
            description: `Amount: ₦${(payment.amount / 100).toLocaleString()} - ${payment.status}`,
            type: 'payment',
            href: `/payments`,
            date: payment.createdAt,
            status: payment.status
          })
        }
      })
      
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }
  
  // Filter results based on active tab
  const filteredResults = activeTab === 'all' 
    ? searchResults 
    : searchResults.filter(result => result.type === activeTab)
  
  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'user':
        return <User className="h-4 w-4" />
      case 'assignment':
        return <FileText className="h-4 w-4" />
      case 'grade':
        return <GraduationCap className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      default:
        return null
    }
  }
  
  // Get badge color for status
  const getStatusColor = (status: string) => {
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
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Search</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses, assignments, grades, events..."
          className="pl-10 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button 
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {searchResults.length > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Results ({searchResults.length})</TabsTrigger>
            <TabsTrigger value="course">Courses ({searchResults.filter(r => r.type === 'course').length})</TabsTrigger>
            <TabsTrigger value="assignment">Assignments ({searchResults.filter(r => r.type === 'assignment').length})</TabsTrigger>
            <TabsTrigger value="grade">Grades ({searchResults.filter(r => r.type === 'grade').length})</TabsTrigger>
            <TabsTrigger value="event">Events ({searchResults.filter(r => r.type === 'event').length})</TabsTrigger>
            <TabsTrigger value="payment">Payments ({searchResults.filter(r => r.type === 'payment').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="course" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="assignment" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="grade" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="event" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map(result => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No results found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn't find anything matching "{searchQuery}". Try different keywords.
          </p>
        </div>
      )}
    </div>
  )
}

// Search result card component
function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <Link href={result.href}>
      <Card className="overflow-hidden transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                {getResultIcon(result.type)}
              </div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
            </div>
            <Badge 
              variant="secondary"
              className={cn(
                "capitalize",
                result.status ? getStatusColor(result.status) : ""
              )}
            >
              {result.type}
              {result.status && ` • ${result.status}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">{result.description}</CardDescription>
        </CardContent>
        {result.date && (
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(result.date), { addSuffix: true })}
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
