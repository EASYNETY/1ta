"use client"

import React from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setActiveTab } from '../store/search-slice'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen,
  FileText,
  GraduationCap,
  Calendar,
  CreditCard,
  User,
  Search,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Define the search categories
const SEARCH_CATEGORIES = [
  {
    id: 'course',
    name: 'Courses',
    description: 'Search through all courses',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'class',
    name: 'Classes',
    description: 'Find available class sessions',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
  },
  {
    id: 'assignment',
    name: 'Assignments',
    description: 'Find assignments and submissions',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'grade',
    name: 'Grades',
    description: 'View your grades and assessments',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'event',
    name: 'Events',
    description: 'Find classes, lectures and events',
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  },
  {
    id: 'payment',
    name: 'Payments',
    description: 'Search through payment history',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'all',
    name: 'All Categories',
    description: 'Search across everything',
    icon: <Search className="h-5 w-5" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
]

interface SearchCategoriesProps {
  onSearch: (category: string) => void
}

export function SearchCategories({ onSearch }: SearchCategoriesProps) {
  const dispatch = useAppDispatch()

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setActiveTab(categoryId))
    onSearch(categoryId)
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-4">Search Categories</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SEARCH_CATEGORIES.map(category => (
          <Card
            key={category.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleCategoryClick(category.id)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-3 ${category.color}`}>
                {category.icon}
              </div>
              <h4 className="font-medium text-sm">{category.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
