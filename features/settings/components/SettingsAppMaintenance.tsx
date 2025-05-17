// features/settings/components/SettingsAppMaintenance.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Trash2, AlertTriangle, CheckCircle, RotateCw } from 'lucide-react';
import { apiCache } from '@/lib/api-cache';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

/**
 * Settings component for app maintenance tasks like clearing cache and updating the app
 */
const SettingsAppMaintenance: React.FC = () => {
    const [isClearing, setIsClearing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Clears the API cache and shows a success message
     */
    const handleClearApiCache = () => {
        setIsClearing(true);
        
        try {
            // Clear the API cache
            apiCache.clear();
            
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
     */
    const handleUpdateApp = () => {
        setIsUpdating(true);
        
        try {
            // Clear browser caches that might affect the app
            // 1. Clear localStorage items except auth-related items
            const authTokenKey = 'auth-token';
            const authUserKey = 'auth-user';
            const refreshTokenKey = 'refresh-token';
            
            // Save auth data
            const authToken = localStorage.getItem(authTokenKey);
            const authUser = localStorage.getItem(authUserKey);
            const refreshToken = localStorage.getItem(refreshTokenKey);
            
            // Clear localStorage
            localStorage.clear();
            
            // Restore auth data
            if (authToken) localStorage.setItem(authTokenKey, authToken);
            if (authUser) localStorage.setItem(authUserKey, authUser);
            if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken);
            
            // 2. Clear sessionStorage
            sessionStorage.clear();
            
            // 3. Clear API cache
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
     * Performs a hard refresh of the app by clearing caches and forcing a reload
     */
    const handleHardRefresh = () => {
        setIsUpdating(true);
        
        try {
            // Show message
            toast.info('Performing hard refresh...', {
                duration: 2000,
            });
            
            // Force reload from server, bypassing cache
            setTimeout(() => {
                window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
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
                    <AlertTitle className="font-semibold text-blue-800">Why update the app?</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        If you're experiencing issues or not seeing recent updates, clearing the app cache can help.
                        This will refresh all app data without affecting your login status.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
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
