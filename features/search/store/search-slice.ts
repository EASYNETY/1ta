// features/search/store/search-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { SearchResult, SearchState, SearchFilters } from "../types/search-types";

// Initial state
const initialState: SearchState = {
  query: "",
  results: [],
  recentSearches: [],
  filters: {
    dateRange: null,
    categories: [],
    status: null,
    level: null,
    type: null,
    priceRange: null,
    scoreRange: null,
    instructor: null,
  },
  isSearching: false,
  activeTab: "all",
  error: null,
};

// Create slice
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = action.payload;
      state.isSearching = false;
    },
    startSearching: (state) => {
      state.isSearching = true;
      state.error = null;
    },
    setSearchError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isSearching = false;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      // Don't add empty searches or duplicates
      if (!action.payload.trim() || state.recentSearches.includes(action.payload)) {
        return;
      }

      // Add to the beginning and limit to 10 recent searches
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(s => s !== action.payload)
      ].slice(0, 10);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearch: (state) => {
      state.query = "";
      state.results = [];
      state.isSearching = false;
      state.error = null;
    }
  }
});

// Export actions
export const {
  setSearchQuery,
  setSearchResults,
  startSearching,
  setSearchError,
  addRecentSearch,
  clearRecentSearches,
  setActiveTab,
  setFilters,
  resetFilters,
  clearSearch
} = searchSlice.actions;

// Export selectors
export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectIsSearching = (state: RootState) => state.search.isSearching;
export const selectSearchError = (state: RootState) => state.search.error;
export const selectRecentSearches = (state: RootState) => state.search.recentSearches;
export const selectActiveTab = (state: RootState) => state.search.activeTab;
export const selectFilters = (state: RootState) => state.search.filters;

// Filter results based on active tab
export const selectFilteredResults = (state: RootState) => {
  const { results, activeTab, filters } = state.search;

  // First filter by tab
  let filtered = activeTab === "all"
    ? results
    : results.filter(result => result.type === activeTab);

  // Then apply additional filters
  if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
    filtered = filtered.filter(result => {
      if (!result.date) return true;
      const date = new Date(result.date);
      return date >= filters.dateRange!.from! && date <= filters.dateRange!.to!;
    });
  }

  if (filters.categories.length > 0) {
    filtered = filtered.filter(result => {
      if (result.type === 'course' && result.category) {
        return filters.categories.includes(result.category);
      }
      return true;
    });
  }

  if (filters.status && filters.status !== 'any') {
    filtered = filtered.filter(result => {
      if (!result.status) return true;
      return result.status === filters.status;
    });
  }

  // Filter by level (for courses)
  if (filters.level && filters.level !== 'any') {
    filtered = filtered.filter(result => {
      if (result.type === 'course' && result.metadata?.level) {
        return result.metadata.level === filters.level;
      }
      return true;
    });
  }

  // Filter by type (for assignments and events)
  if (filters.type && filters.type !== 'any') {
    filtered = filtered.filter(result => {
      if ((result.type === 'assignment' || result.type === 'event') && result.metadata?.type) {
        return result.metadata.type === filters.type;
      }
      return true;
    });
  }

  // Filter by price range (for courses and payments)
  if (filters.priceRange) {
    filtered = filtered.filter(result => {
      if (result.type === 'course' && result.metadata?.priceUSD) {
        const priceInKobo = result.metadata.priceUSD * 100;
        return priceInKobo >= filters.priceRange!.min && priceInKobo <= filters.priceRange!.max;
      }
      if (result.type === 'payment' && result.metadata?.amount) {
        return result.metadata.amount >= filters.priceRange!.min && result.metadata.amount <= filters.priceRange!.max;
      }
      return true;
    });
  }

  // Filter by score range (for grades)
  if (filters.scoreRange) {
    filtered = filtered.filter(result => {
      if (result.type === 'grade' && result.metadata?.score !== undefined) {
        return result.metadata.score >= filters.scoreRange!.min && result.metadata.score <= filters.scoreRange!.max;
      }
      return true;
    });
  }

  // Filter by instructor (for courses)
  if (filters.instructor) {
    const instructorQuery = filters.instructor.toLowerCase();
    filtered = filtered.filter(result => {
      if (result.type === 'course' && result.metadata?.instructor) {
        return result.metadata.instructor.toLowerCase().includes(instructorQuery);
      }
      return true;
    });
  }

  return filtered;
};

export default searchSlice.reducer;
