"use client"

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/auth/page-header'
import {
  setSearchQuery,
  setSearchResults,
  startSearching,
  setActiveTab,
  addRecentSearch,
  selectSearchQuery,
  selectSearchResults,
  selectIsSearching,
  selectActiveTab,
  selectFilteredResults,
  clearSearch
} from '@/features/search/store/search-slice'
import { searchService } from '@/features/search/services/search-service'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { RecentSearches } from '@/features/search/components/RecentSearches'
import { RecentActivity } from '@/features/search/components/RecentActivity'
import { SearchResultCard } from '@/features/search/components/SearchResultCard'
import { SearchSummary } from '@/features/search/components/SearchSummary'
import { SearchCategories } from '@/features/search/components/SearchCategories'
import { SearchResult } from '@/features/search/types/search-types'

export default function SearchPage() {
  const dispatch = useAppDispatch()

  // Get data from Redux store
  const searchQuery = useAppSelector(selectSearchQuery)
  const searchResults = useAppSelector(selectSearchResults)
  const isSearching = useAppSelector(selectIsSearching)
  const activeTab = useAppSelector(selectActiveTab)
  const filteredResults = useAppSelector(selectFilteredResults)

  // Get the entire state for search service
  const state = useAppSelector(state => state)

  // Reset search state on component mount
  useEffect(() => {
    // Reset the search state when the page loads
    dispatch(clearSearch())
  }, [dispatch])

  // Get recent activity
  let recentActivity: SearchResult[] = [];
  try {
    recentActivity = searchService.getRecentActivity(state)
  } catch (error) {
    console.error("Error getting recent activity:", error)
  }

  // Handle search query change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value))
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      dispatch(setSearchResults([]))
      return
    }

    // Add to recent searches
    dispatch(addRecentSearch(searchQuery))

    // Start searching
    dispatch(startSearching())

    // Simulate search delay
    setTimeout(() => {
      try {
        // Use search service to search across the Redux store
        const results = searchService.searchStore(state, searchQuery)
        dispatch(setSearchResults(results))
      } catch (error) {
        console.error("Search error:", error)
        dispatch(setSearchResults([]))
      }
    }, 500)
  }

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    dispatch(setActiveTab(value))
  }

  // Handle recent search selection
  const handleRecentSearchSelect = () => {
    handleSearch()
  }

  // Handle category search
  const handleCategorySearch = (category: string) => {
    // Set the active tab to the selected category
    dispatch(setActiveTab(category))

    // If there's a search query, perform the search
    if (searchQuery.trim()) {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Search"
        subheading="Search across courses, assignments, grades, events and more"
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses, assignments, grades, events..."
          className="pl-10 h-12"
          value={searchQuery}
          onChange={handleSearchQueryChange}
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

      {/* Recent Searches */}
      <RecentSearches onSearchSelect={handleRecentSearchSelect} />

      {/* Search Categories - Show only when no search is active */}
      {(!searchQuery || searchResults.length === 0) && !isSearching && (
        <SearchCategories onSearch={handleCategorySearch} />
      )}

      {/* Search Filters - Always show */}
      <SearchFilters />

      {/* Search Summary - Show only when we have results */}
      {searchResults.length > 0 && <SearchSummary />}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full overflow-x-auto">
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

      {/* No Results Message */}
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No results found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn't find anything matching "{searchQuery}". Try different keywords.
          </p>
        </div>
      )}

      {/* Recent Activity - Show only when no search is active */}
      {(!searchQuery || searchResults.length === 0) && !isSearching && (
        <RecentActivity recentItems={recentActivity} />
      )}
    </div>
  )
}


