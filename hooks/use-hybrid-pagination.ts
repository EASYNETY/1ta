import { useMemo } from 'react';

interface HybridPaginationOptions<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  serverPaginated?: boolean; // Flag to indicate if backend supports pagination
}

interface HybridPaginationResult<T> {
  paginatedData: T[];
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Custom hook for hybrid pagination that supports both client-side and server-side pagination
 * 
 * @param options - Configuration options for pagination
 * @returns Pagination result with paginated data and metadata
 */
export function useHybridPagination<T>({
  data,
  currentPage,
  itemsPerPage,
  serverPaginated = false,
}: HybridPaginationOptions<T>): HybridPaginationResult<T> {
  return useMemo(() => {
    if (serverPaginated) {
      // Server-side pagination: data is already paginated
      const totalItems = data.length; // This would come from API response metadata
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      return {
        paginatedData: data,
        totalItems,
        totalPages,
        startIndex: (currentPage - 1) * itemsPerPage + 1,
        endIndex: Math.min(currentPage * itemsPerPage, totalItems),
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    } else {
      // Client-side pagination: paginate the full dataset
      const totalItems = data.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      return {
        paginatedData,
        totalItems,
        totalPages,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, totalItems),
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    }
  }, [data, currentPage, itemsPerPage, serverPaginated]);
}

/**
 * Enhanced version that handles server pagination metadata
 */
interface ServerPaginationMetadata {
  totalUsers?: number;
  currentPage?: number;
  totalPages?: number;
}

interface EnhancedHybridPaginationOptions<T> extends HybridPaginationOptions<T> {
  serverMetadata?: ServerPaginationMetadata;
}

export function useEnhancedHybridPagination<T>({
  data,
  currentPage,
  itemsPerPage,
  serverPaginated = false,
  serverMetadata,
}: EnhancedHybridPaginationOptions<T>): HybridPaginationResult<T> {
  return useMemo(() => {
    if (serverPaginated && serverMetadata) {
      // Server-side pagination with metadata
      const totalItems = serverMetadata.totalUsers || data.length;
      const totalPages = serverMetadata.totalPages || Math.ceil(totalItems / itemsPerPage);
      const actualCurrentPage = serverMetadata.currentPage || currentPage;
      
      return {
        paginatedData: data,
        totalItems,
        totalPages,
        startIndex: (actualCurrentPage - 1) * itemsPerPage + 1,
        endIndex: Math.min(actualCurrentPage * itemsPerPage, totalItems),
        hasNextPage: actualCurrentPage < totalPages,
        hasPreviousPage: actualCurrentPage > 1,
      };
    } else {
      // Client-side pagination: paginate the full dataset
      const totalItems = data.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      return {
        paginatedData,
        totalItems,
        totalPages,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, totalItems),
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    }
  }, [data, currentPage, itemsPerPage, serverPaginated, serverMetadata]);
}
