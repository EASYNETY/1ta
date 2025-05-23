// lib/cache-manager.ts
// Centralized cache management utility

import { apiCache } from './api-cache';

/**
 * Cache management utility for debugging and clearing caches
 */
export const cacheManager = {
  /**
   * Clear all application caches
   */
  clearAllCaches: () => {
    console.log('🧹 Clearing all application caches...');

    // 1. Clear API cache
    apiCache.clear();
    console.log('✅ API cache cleared');

    // 2. Clear localStorage (Redux persist and other data) while preserving auth
    if (typeof window !== 'undefined') {
      try {
        // Save auth data before clearing
        const authTokenKey = 'auth-token';
        const authUserKey = 'auth-user';
        const refreshTokenKey = 'refresh-token';
        const reduxPersistKey = 'persist:1techacademy-root';

        // Save individual auth data
        const authToken = localStorage.getItem(authTokenKey);
        const authUser = localStorage.getItem(authUserKey);
        const refreshToken = localStorage.getItem(refreshTokenKey);

        // Save Redux persist auth data
        let authFromRedux = null;
        try {
          const persistedState = localStorage.getItem(reduxPersistKey);
          if (persistedState) {
            const parsed = JSON.parse(persistedState);
            if (parsed.auth) {
              authFromRedux = parsed.auth;
            }
          }
        } catch (e) {
          console.warn('Could not parse Redux persist state:', e);
        }

        // Clear all localStorage
        localStorage.clear();

        // Restore auth data
        if (authToken) localStorage.setItem(authTokenKey, authToken);
        if (authUser) localStorage.setItem(authUserKey, authUser);
        if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken);

        // Restore Redux persist auth data
        if (authFromRedux) {
          try {
            const newPersistedState = {
              auth: authFromRedux,
              _persist: {
                version: 1,
                rehydrated: true
              }
            };
            localStorage.setItem(reduxPersistKey, JSON.stringify(newPersistedState));
          } catch (e) {
            console.warn('Could not restore Redux persist auth state:', e);
          }
        }

        console.log('✅ localStorage cleared (auth preserved)');
      } catch (error) {
        console.warn('⚠️ Could not clear localStorage:', error);
      }

      // 3. Clear sessionStorage
      try {
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');
      } catch (error) {
        console.warn('⚠️ Could not clear sessionStorage:', error);
      }

      // 4. Clear IndexedDB (if any)
      try {
        if ('indexedDB' in window) {
          // Note: This is a simplified approach. In production, you might want to be more specific
          console.log('ℹ️ IndexedDB clearing requires manual intervention');
        }
      } catch (error) {
        console.warn('⚠️ Could not access IndexedDB:', error);
      }
    }

    console.log('✨ All application caches cleared!');
  },

  /**
   * Clear only API cache
   */
  clearApiCache: () => {
    console.log('🔄 Clearing API cache...');
    apiCache.clear();
    console.log('✅ API cache cleared');
  },

  /**
   * Clear only browser storage
   */
  clearBrowserStorage: () => {
    if (typeof window !== 'undefined') {
      console.log('🗄️ Clearing browser storage...');

      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Browser storage cleared');
      } catch (error) {
        console.warn('⚠️ Could not clear browser storage:', error);
      }
    }
  },

  /**
   * Get cache status information
   */
  getCacheStatus: () => {
    const status = {
      apiCache: {
        size: apiCache.size(),
        config: apiCache.getConfig(),
      },
      localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).length : 0,
      sessionStorage: typeof window !== 'undefined' ? Object.keys(sessionStorage).length : 0,
    };

    console.log('📊 Cache Status:', status);
    return status;
  },

  /**
   * Force hard refresh (client-side only)
   */
  hardRefresh: () => {
    if (typeof window !== 'undefined') {
      console.log('🔄 Performing hard refresh...');
      // Clear caches first
      cacheManager.clearAllCaches();

      // Force reload from server
      window.location.reload();
    }
  },

  /**
   * Development helper: Add cache debugging to console
   */
  enableCacheDebugging: () => {
    if (process.env.NODE_ENV === 'development') {
      // Add global cache manager to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).cacheManager = cacheManager;
        console.log('🔧 Cache manager available at window.cacheManager (dev mode)');
        console.log('📝 Note: Auto-update detection is disabled in development');
        console.log('Available methods:');
        console.log('- window.cacheManager.clearAllCaches()');
        console.log('- window.cacheManager.clearApiCache()');
        console.log('- window.cacheManager.clearBrowserStorage()');
        console.log('- window.cacheManager.getCacheStatus()');
        console.log('- window.cacheManager.hardRefresh()');
      }
    }
  },
};
