"use client"

import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  setSearchQuery, 
  clearRecentSearches,
  selectRecentSearches
} from '../store/search-slice'
import { Button } from '@/components/ui/button'
import { Clock, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RecentSearchesProps {
  onSearchSelect: (query: string) => void
}

export function RecentSearches({ onSearchSelect }: RecentSearchesProps) {
  const dispatch = useAppDispatch()
  const recentSearches = useAppSelector(selectRecentSearches)
  
  if (!recentSearches || recentSearches.length === 0) {
    return null
  }
  
  const handleSearchClick = (query: string) => {
    dispatch(setSearchQuery(query))
    onSearchSelect(query)
  }
  
  const handleClearAll = () => {
    dispatch(clearRecentSearches())
  }
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Recent Searches
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearAll}
          className="text-xs"
        >
          Clear all
        </Button>
      </div>
      
      <ScrollArea className="whitespace-nowrap pb-2">
        <div className="flex gap-2">
          {recentSearches.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleSearchClick(query)}
            >
              {query}
              <X className="h-3 w-3 ml-1" />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
