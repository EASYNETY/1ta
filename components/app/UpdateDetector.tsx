"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { SimpleVersionChecker } from '@/lib/simple-version-checker';

/**
 * Update detector disabled - intrusive toasts removed per user request
 * Component kept for potential future use but functionality disabled
 */
export function UpdateDetector() {
  useEffect(() => {
    // Update detection disabled - no more intrusive toasts
    console.log('UpdateDetector: Automatic update notifications disabled');
    return;

    // Original code commented out to prevent intrusive toasts
    /*
    // Don't run in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    let hasShownChunkError = false;

    // All update detection functionality disabled
    /*
    const handleChunkError = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // Check if it's a chunk loading error
      const isChunkError = error?.message?.includes('Loading chunk') ||
                          error?.message?.includes('Loading CSS chunk') ||
                          error?.message?.includes('ChunkLoadError') ||
                          error?.name === 'ChunkLoadError';

      if (isChunkError && !hasShownChunkError) {
        hasShownChunkError = true;

        console.log('🔄 Chunk loading failed - new version detected');

        toast.info('New version available!', {
          description: 'The app has been updated. Refresh to get the latest version.',
          duration: 10000, // 10 seconds
          action: {
            label: 'Refresh Now',
            onClick: () => {
              // Clear caches and reload
              handleForceUpdate();
            }
          },
          onDismiss: () => {
            // Reset flag if user dismisses
            setTimeout(() => {
              hasShownChunkError = false;
            }, 30000); // Allow retry after 30 seconds
          }
        });
      }
    };

    // All remaining functionality disabled to prevent intrusive toasts
    /*
    const handleRouteError = (event: ErrorEvent) => {
      const error = event.error;

      // Check if it's a route/navigation error due to missing chunks
      const isRouteError = error?.message?.includes('Loading chunk') ||
                          error?.message?.includes('Failed to fetch dynamically imported module');

      if (isRouteError && !hasShownChunkError) {
        hasShownChunkError = true;

        console.log('🔄 Route navigation failed - new version detected');

        toast.warning('App update detected!', {
          description: 'Please refresh the page to continue.',
          duration: 8000,
          action: {
            label: 'Refresh',
            onClick: handleForceUpdate
          }
        });
      }
    };

    const checkVersion = async () => {
      try {
        const result = await SimpleVersionChecker.checkForUpdates();

        if (result.hasUpdate && !hasShownChunkError) {
          console.log('🔄 Server version check detected update');

          toast.success('New version available!', {
            description: `Version ${result.serverVersion?.version} is ready.`,
            duration: 8000,
            action: {
              label: 'Update Now',
              onClick: () => {
                if (result.serverVersion) {
                  SimpleVersionChecker.acceptUpdate(result.serverVersion);
                }
                handleForceUpdate();
              }
            },
            onDismiss: () => {
              // User dismissed, don't show again for a while
              setTimeout(() => {
                hasShownChunkError = false;
              }, 60000); // 1 minute
            }
          });
        }
      } catch (error) {
        // Silently fail - version checking is not critical
        console.debug('Version check failed:', error);
      }
    };

    const handleForceUpdate = async () => {
      try {
        // Clear browser caches if available
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }

        // Clear localStorage except auth data
        const authKeys = ['auth-token', 'auth-user', 'refresh-token'];
        const authData: Record<string, string | null> = {};

        authKeys.forEach(key => {
          authData[key] = localStorage.getItem(key);
        });

        // Save Redux persist auth data
        let authFromRedux = null;
        try {
          const persistedState = localStorage.getItem('persist:1techacademy-root');
          if (persistedState) {
            const parsed = JSON.parse(persistedState);
            if (parsed.auth) {
              authFromRedux = parsed.auth;
            }
          }
        } catch (e) {
          console.warn('Could not parse Redux persist state:', e);
        }

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Restore auth data
        authKeys.forEach(key => {
          if (authData[key]) {
            localStorage.setItem(key, authData[key]!);
          }
        });

        // Restore Redux persist auth data
        if (authFromRedux) {
          const newPersistedState = {
            auth: authFromRedux,
            _persist: { version: 1, rehydrated: true }
          };
          localStorage.setItem('persist:1techacademy-root', JSON.stringify(newPersistedState));
        }

        // Force reload with cache busting
        window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
      } catch (error) {
        console.error('Error during force update:', error);
        // Fallback to simple reload
        window.location.reload();
      }
    };

    // All event listeners and periodic checks disabled
    /*
    // Add event listeners
    window.addEventListener('unhandledrejection', handleChunkError);
    window.addEventListener('error', handleRouteError);

    // Initial version check
    checkVersion();

    // Periodic version checking (every 5 minutes)
    const versionCheckInterval = setInterval(checkVersion, 5 * 60 * 1000);

    // Check when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, check for updates
        setTimeout(checkVersion, 1000); // Small delay to avoid race conditions
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleChunkError);
      window.removeEventListener('error', handleRouteError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(versionCheckInterval);
    };
    */
  }, []);

  // This component doesn't render anything
  return null;
}
