// features/settings/components/SettingsAppMaintenance.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Trash2, AlertTriangle, CheckCircle, RotateCw } from 'lucide-react';
import { apiCache } from '@/lib/api-cache';
import { toast } from 'sonner';
import { cacheManager } from '@/lib/cache-manager';
import { SimpleVersionChecker } from '@/lib/simple-version-checker';
import { Separator } from '@/components/ui/separator';

/**
 * Settings component for app maintenance tasks like clearing cache and updating the app
 */
const SettingsAppMaintenance: React.FC = () => {
    const [isClearing, setIsClearing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isClearingRedux, setIsClearingRedux] = useState(false);
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

    /**
     * Check for app updates using the simple version checker
     */
    const handleCheckForUpdates = async () => {
        setIsCheckingUpdates(true);

        try {
            const result = await SimpleVersionChecker.checkForUpdates();

            if (result.hasUpdate && result.serverVersion) {
                toast.success('Update available!', {
                    description: `Version ${result.serverVersion.version} is ready to install.`,
                    duration: 8000,
                    action: {
                        label: 'Update Now',
                        onClick: () => {
                            SimpleVersionChecker.acceptUpdate(result.serverVersion!);
                            handleForceUpdate();
                        }
                    }
                });
            } else {
                toast.info('You\'re up to date!', {
                    description: result.currentVersion
                        ? `Running version ${result.currentVersion.version}`
                        : 'You\'re running the latest version.',
                });
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
            toast.error('Update check failed', {
                description: 'Could not check for updates. Please try again.',
            });
        } finally {
            setIsCheckingUpdates(false);
        }
    };

    /**
     * Force update with comprehensive cache clearing
     */
    const handleForceUpdate = async () => {
        setIsUpdating(true);

        try {
            toast.info('Updating app...', {
                description: 'Clearing caches and reloading...',
                duration: 3000,
            });

            // Use the cache manager for comprehensive clearing
            cacheManager.clearAllCaches();

            // Force reload with cache busting
            setTimeout(() => {
                window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
            }, 1000);
        } catch (error) {
            console.error('Error during force update:', error);
            toast.error('Update failed', {
                description: 'Please try refreshing the page manually.',
            });
            setIsUpdating(false);
        }
    };

    /**
     * Clears the API cache and shows a success message
     */
    const handleClearApiCache = () => {
        setIsClearing(true);

        try {
            // Use the enhanced cache manager
            cacheManager.clearApiCache();

            // Show success message
            toast.success('API cache cleared successfully');
            console.log('API cache cleared successfully');
        } catch (error) {
            console.error('Error clearing API cache:', error);
            toast.error('Failed to clear API cache');
        } finally {
            setIsClearing(false);
        }
    };

    /**
     * Clears browser cache (localStorage, sessionStorage) and reloads the app
     * Preserves authentication data to keep user logged in
     */
    const handleUpdateApp = () => {
        setIsUpdating(true);

        try {
            // Clear browser caches that might affect the app
            // 1. Save auth-related data from both individual keys and Redux persist
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

            // 2. Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // 3. Restore auth data
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

            // 4. Clear API cache
            apiCache.clear();

            // Show success message
            toast.success('App cache cleared. Reloading...', {
                duration: 2000,
            });

            // Reload the app after a short delay to show the toast
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error updating app:', error);
            toast.error('Failed to update app');
            setIsUpdating(false);
        }
    };

    /**
     * Clears Redux persist data (app state) while preserving authentication
     */
    const handleClearReduxPersist = () => {
        setIsClearingRedux(true);

        try {
            const reduxPersistKey = 'persist:1techacademy-root';

            // Save auth data before clearing
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

            // Clear Redux persist data
            localStorage.removeItem(reduxPersistKey);

            // Restore only auth data
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

            // Show success message
            toast.success('App state cleared. Reloading...', {
                duration: 2000,
            });

            // Reload to reinitialize the app state
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error clearing Redux persist data:', error);
            toast.error('Failed to clear app state');
            setIsClearingRedux(false);
        }
    };

    /**
     * Performs a hard refresh of the app by clearing caches and forcing a reload
     */
    const handleHardRefresh = () => {
        setIsUpdating(true);

        try {
            // Show message
            toast.info('Performing hard refresh...', {
                duration: 2000,
            });

            // Use the enhanced cache manager for comprehensive clearing
            cacheManager.clearAllCaches();

            // Force reload from server, bypassing cache
            setTimeout(() => {
                // Use location.reload(true) for hard refresh if available, otherwise use cache-busting
                if (typeof window.location.reload === 'function') {
                    window.location.reload();
                } else {
                    window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
                }
            }, 1000);
        } catch (error) {
            console.error('Error performing hard refresh:', error);
            toast.error('Failed to refresh app');
            setIsUpdating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    App Maintenance
                </CardTitle>
                <CardDescription>
                    Manage app cache and updates to ensure you're using the latest version
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-5 w-5 text-blue-700" />
                    <AlertTitle className="font-semibold text-blue-800">Smart App Updates</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        The app automatically detects when new code is available and will prompt you to update.
                        You can also manually check for updates or clear specific caches if needed.
                        All updates preserve your login status and settings.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium mb-2">Check for Updates</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            {process.env.NODE_ENV === 'development'
                                ? 'Manual update checking available. Auto-detection is disabled in development mode.'
                                : 'Check if a new version of the app is available and update automatically.'
                            }
                        </p>
                        <Button
                            variant="default"
                            onClick={handleCheckForUpdates}
                            disabled={isCheckingUpdates}
                            className="flex items-center gap-2"
                        >
                            {isCheckingUpdates ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Check for Updates
                                </>
                            )}
                        </Button>
                        {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                💡 <strong>Dev Mode:</strong> Automatic update prompts are disabled to prevent interference with hot reloading.
                            </p>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium mb-2">Clear API Cache</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Clears cached API responses to fetch fresh data from the server.
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleClearApiCache}
                            disabled={isClearing}
                            className="flex items-center gap-2"
                        >
                            {isClearing ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Clear API Cache
                                </>
                            )}
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium mb-2">Update App</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Clears all app cache and reloads to get the latest version. You'll remain logged in.
                        </p>
                        <Button
                            onClick={handleUpdateApp}
                            disabled={isUpdating}
                            className="flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Update App
                                </>
                            )}
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium mb-2">Clear App State</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Clears all app state (Redux persist data) while keeping you logged in. Use this if you're seeing stale data.
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleClearReduxPersist}
                            disabled={isClearingRedux}
                            className="flex items-center gap-2"
                        >
                            {isClearingRedux ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Clear App State
                                </>
                            )}
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium mb-2">Hard Refresh</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Forces a complete reload from the server, bypassing browser cache.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={handleHardRefresh}
                            disabled={isUpdating}
                            className="flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RotateCw className="h-4 w-4" />
                                    Hard Refresh
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SettingsAppMaintenance;
