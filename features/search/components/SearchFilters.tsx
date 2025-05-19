"use client"

import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setFilters,
  resetFilters,
  selectFilters,
  selectActiveTab
} from '../store/search-slice'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Calendar as CalendarIcon,
  X,
  Filter,
  BookOpen,
  FileText,
  GraduationCap,
  CreditCard,
  Clock,
  Tag,
  Layers,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DateRange } from '../types/search-types'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

// Course categories from the data
const COURSE_CATEGORIES = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Cybersecurity",
  "Cloud Computing",
  "AI & ML",
  "Business",
  "Design",
  "Marketing",
  "Mathematics",
  "Science",
  "Language",
  "Health & Fitness"
];

// Course levels
const COURSE_LEVELS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "All Levels", label: "All Levels" }
];

// Status options by type
const STATUS_OPTIONS = {
  all: [
    { value: "enrolled", label: "Enrolled" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "in-progress", label: "In Progress" },
    { value: "overdue", label: "Overdue" },
    { value: "succeeded", label: "Succeeded" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" }
  ],
  course: [
    { value: "enrolled", label: "Enrolled" },
    { value: "not_enrolled", label: "Not Enrolled" },
    { value: "pending", label: "Pending" }
  ],
  assignment: [
    { value: "pending", label: "Pending" },
    { value: "submitted", label: "Submitted" },
    { value: "graded", label: "Graded" },
    { value: "overdue", label: "Overdue" }
  ],
  grade: [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" }
  ],
  event: [
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
    { value: "cancelled", label: "Cancelled" }
  ],
  payment: [
    { value: "succeeded", label: "Succeeded" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" }
  ]
};

// Assignment types
const ASSIGNMENT_TYPES = [
  { value: "essay", label: "Essay" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "exam", label: "Exam" },
  { value: "participation", label: "Participation" }
];

// Event types
const EVENT_TYPES = [
  { value: "lecture", label: "Lecture" },
  { value: "lab", label: "Lab" },
  { value: "exam", label: "Exam" },
  { value: "office-hours", label: "Office Hours" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" }
];

export function SearchFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const activeTab = useAppSelector(selectActiveTab)
  const [dateOpen, setDateOpen] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(true)
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100000])
  const [scoreRange, setScoreRange] = React.useState<[number, number]>([0, 100])

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange) => {
    dispatch(setFilters({ dateRange: range }))
  }

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    const currentCategories = filters.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]

    dispatch(setFilters({ categories: newCategories }))
  }

  // Handle status selection
  const handleStatusChange = (status: string) => {
    dispatch(setFilters({ status: status === 'any' || status === filters.status ? null : status }))
  }

  // Handle level selection
  const handleLevelChange = (level: string) => {
    dispatch(setFilters({ level: level === 'any' || level === filters.level ? null : level }))
  }

  // Handle type selection
  const handleTypeChange = (type: string) => {
    dispatch(setFilters({ type: type === 'any' || type === filters.type ? null : type }))
  }

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values as [number, number])
    dispatch(setFilters({ priceRange: { min: values[0], max: values[1] } }))
  }

  // Handle score range change
  const handleScoreRangeChange = (values: number[]) => {
    setScoreRange(values as [number, number])
    dispatch(setFilters({ scoreRange: { min: values[0], max: values[1] } }))
  }

  // Handle instructor search
  const handleInstructorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ instructor: e.target.value || null }))
  }

  // Reset all filters
  const handleResetFilters = () => {
    dispatch(resetFilters())
    setPriceRange([0, 100000])
    setScoreRange([0, 100])
  }

  // Get status options based on active tab
  const getStatusOptions = () => {
    if (activeTab === 'all') return STATUS_OPTIONS.all
    return STATUS_OPTIONS[activeTab as keyof typeof STATUS_OPTIONS] || STATUS_OPTIONS.all
  }

  // Count active filters
  const activeFilterCount =
    (filters.dateRange ? 1 : 0) +
    (filters.categories?.length || 0) +
    (filters.status ? 1 : 0) +
    (filters.level ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.scoreRange ? 1 : 0) +
    (filters.instructor ? 1 : 0)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-card/5 backdrop-blur-sm shadow-sm space-y-4">
          <Accordion type="multiple" defaultValue={["date", "status", "categories"]}>
            {/* Date Range Filter */}
            <AccordionItem value="date">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Date Range</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                      {filters.dateRange && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch(setFilters({ dateRange: null }))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from as Date}
                      selected={filters.dateRange as any}
                      onSelect={(range) => handleDateRangeChange(range as DateRange)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </AccordionContent>
            </AccordionItem>

            {/* Status Filter */}
            <AccordionItem value="status">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>Status</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Select
                  value={filters.status || "any"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    {getStatusOptions().map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* Category Filter */}
            <AccordionItem value="categories">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>Categories</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {COURSE_CATEGORIES.map(category => (
                    <div
                      key={category}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Selected Categories */}
                {filters.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {filters.categories.map(category => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {category}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleCategoryChange(category)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Type-specific filters */}
            {activeTab === 'course' && (
              <AccordionItem value="course-specific">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Course Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Level Filter */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Level</label>
                      <Select
                        value={filters.level || "any"}
                        onValueChange={handleLevelChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any level</SelectItem>
                          {COURSE_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Price Range: ₦{(priceRange[0] / 100).toLocaleString()} - ₦{(priceRange[1] / 100).toLocaleString()}
                      </label>
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={100000}
                        step={1000}
                        onValueChange={handlePriceRangeChange}
                        className="mt-2"
                      />
                    </div>

                    {/* Instructor */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Instructor</label>
                      <Input
                        placeholder="Search by instructor name"
                        value={filters.instructor || ""}
                        onChange={handleInstructorChange}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {activeTab === 'assignment' && (
              <AccordionItem value="assignment-specific">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Assignment Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Assignment Type</label>
                    <Select
                      value={filters.type || "any"}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        {ASSIGNMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {activeTab === 'grade' && (
              <AccordionItem value="grade-specific">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Grade Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Score Range: {scoreRange[0]}% - {scoreRange[1]}%
                    </label>
                    <Slider
                      defaultValue={scoreRange}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={handleScoreRangeChange}
                      className="mt-2"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {activeTab === 'event' && (
              <AccordionItem value="event-specific">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Event Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Event Type</label>
                    <Select
                      value={filters.type || "any"}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {activeTab === 'payment' && (
              <AccordionItem value="payment-specific">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Amount Range: ₦{(priceRange[0] / 100).toLocaleString()} - ₦{(priceRange[1] / 100).toLocaleString()}
                    </label>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={100000}
                      step={1000}
                      onValueChange={handlePriceRangeChange}
                      className="mt-2"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </div>
  )
}
