// config/pagination.ts
// Configuration for hybrid pagination approach

/**
 * Pagination configuration
 *
 * This configuration allows easy switching between client-side and server-side pagination
 * as the backend evolves to support pagination.
 */
export const PAGINATION_CONFIG = {
  // Global pagination settings
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Feature flags for different entities
  FEATURES: {
    // Users pagination - Backend supports it!
    USERS_SERVER_PAGINATION: true, // ✅ Backend supports pagination

    // Course management entities
    COURSES_SERVER_PAGINATION: false, // 🔄 Client-side for now
    MANAGE_COURSES_SERVER_PAGINATION: false, // 🔄 Client-side for now
    ALL_COURSES_SERVER_PAGINATION: false, // 🔄 Client-side for now

    // Payment entities
    PAYMENTS_SERVER_PAGINATION: false, // 🔄 Client-side for now
    ADMIN_PAYMENTS_SERVER_PAGINATION: false, // 🔄 Client-side for now

    // Corporate entities
    CORPORATE_STUDENTS_SERVER_PAGINATION: false, // 🔄 Client-side for now

    // Analytics entities
    ANALYTICS_SERVER_PAGINATION: false, // 🔄 Client-side for now
    ANALYTICS_REPORTS_SERVER_PAGINATION: false, // 🔄 Client-side for now

    // Search entities
    SEARCH_RESULTS_SERVER_PAGINATION: false, // 🔄 Client-side for now
  },

  // Page size options for UI dropdowns
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],

  // UI configuration
  UI: {
    SHOW_PAGE_SIZE_SELECTOR: true,
    SHOW_PAGINATION_INFO: true,
    SHOW_TOTAL_COUNT: true,
    MAX_VISIBLE_PAGES: 5, // For pagination controls
  }
} as const;

/**
 * Helper function to check if server pagination is enabled for a specific feature
 */
export function isServerPaginationEnabled(feature: keyof typeof PAGINATION_CONFIG.FEATURES): boolean {
  return PAGINATION_CONFIG.FEATURES[feature];
}

/**
 * Helper function to get pagination parameters for API calls
 */
export function getPaginationParams(
  feature: keyof typeof PAGINATION_CONFIG.FEATURES,
  page: number,
  limit: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
) {
  const serverPaginated = isServerPaginationEnabled(feature);

  return {
    // Always include these for future compatibility
    page,
    limit: Math.min(limit, PAGINATION_CONFIG.MAX_PAGE_SIZE),
    // Flag to indicate if we should actually use them
    serverPaginated,
  };
}

/**
 * Migration helper: When switching to server pagination, use this to validate the transition
 */
export function validatePaginationMigration(feature: keyof typeof PAGINATION_CONFIG.FEATURES) {
  const isEnabled = isServerPaginationEnabled(feature);

  if (isEnabled) {
    console.info(`✅ ${feature} is using server-side pagination`);
  } else {
    console.info(`⚠️  ${feature} is using client-side pagination (hybrid mode)`);
  }

  return isEnabled;
}
