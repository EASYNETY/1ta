// features/search/types/search-types.ts

export type SearchResultType = 'course' | 'class' | 'user' | 'assignment' | 'grade' | 'event' | 'payment' | 'help';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: SearchResultType;
  href: string;
  date?: string;
  status?: string;
  image?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ScoreRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  dateRange: DateRange | null;
  categories: string[];
  status: string | null;
  level: string | null;
  type: string | null;
  priceRange: PriceRange | null;
  scoreRange: ScoreRange | null;
  instructor: string | null;
  // Class-specific filters
  hasAvailableSlots?: boolean;
  enrolmentStarted?: boolean;
  location?: string;
  schedule?: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  filters: SearchFilters;
  isSearching: boolean;
  activeTab: string;
  error: string | null;
}

export interface RecentActivity {
  id: string;
  title: string;
  type: SearchResultType;
  href: string;
  date: string;
  icon?: React.ReactNode;
}
