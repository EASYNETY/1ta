// features/search/services/help-search-indexer.ts
import { helpArticles } from "@/components/help/help-search";
import { RootState } from "@/store";
import { SearchResult } from "../types/search-types";

/**
 * Help Search Indexer
 *
 * This service indexes all help content and makes it searchable through the main search functionality.
 * It integrates with the existing search service to include help articles in search results.
 */

// Define a type for help search results
interface HelpSearchResult extends SearchResult {
  category: string;
  keywords: string[];
}

export const helpSearchIndexer = {
  /**
   * Index all help content for searching
   * This function should be called when the app initializes
   */
  indexHelpContent: () => {
    // This is a placeholder for any initialization that might be needed
    console.log("Help content indexed for search");
    return true;
  },

  /**
   * Search through help content
   * @param query The search query
   * @returns Array of search results matching the query
   */
  searchHelpContent: (query: string): HelpSearchResult[] => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();

    // Search through help articles
    return helpArticles
      .filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .map(article => ({
        id: article.href,
        title: article.title,
        description: article.description,
        type: 'help',
        href: article.href,
        category: article.category,
        keywords: article.keywords,
        metadata: {
          category: article.category,
          icon: typeof article.categoryIcon === 'function' ? article.categoryIcon.name : undefined
        }
      }));
  },

  /**
   * Integrate help search results with the main search service
   * @param state The Redux state
   * @param query The search query
   * @returns Combined search results including help content
   */
  integrateWithMainSearch: (state: RootState, query: string): SearchResult[] => {
    // Get regular search results
    const mainResults = state.search.results || [];

    // Get help search results
    const helpResults = helpSearchIndexer.searchHelpContent(query);

    // Combine results
    return [...mainResults, ...helpResults];
  }
};

/**
 * Extend the search service with help content
 * This function adds help content to the search results
 * @param results The original search results
 * @param query The search query
 * @returns Enhanced search results including help content
 */
export const enhanceSearchWithHelpContent = (results: SearchResult[], query: string): SearchResult[] => {
  // Get help search results
  const helpResults = helpSearchIndexer.searchHelpContent(query);

  // Combine results
  return [...results, ...helpResults];
};
