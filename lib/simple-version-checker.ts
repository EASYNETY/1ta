// lib/simple-version-checker.ts
// Simple, reliable version checking using server endpoint

interface VersionInfo {
  version: string;
  buildId: string;
  buildTime: string;
  hash: string;
  timestamp: number;
  environment: string;
}

interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion?: VersionInfo;
  serverVersion?: VersionInfo;
  isFirstVisit: boolean;
}

/**
 * Simple version checker that uses server endpoint
 * Much more reliable than client-side content hashing
 */
export class SimpleVersionChecker {
  private static readonly STORAGE_KEY = 'app-version-info';
  private static readonly LAST_CHECK_KEY = 'version-last-check';
  private static readonly CHECK_COOLDOWN = 30 * 1000; // 30 seconds

  /**
   * Check for updates by comparing with server version
   */
  static async checkForUpdates(): Promise<VersionCheckResult> {
    try {
      // Don't check too frequently
      if (!this.shouldCheck()) {
        const stored = this.getStoredVersion();
        return {
          hasUpdate: false,
          currentVersion: stored || undefined,
          isFirstVisit: !stored
        };
      }

      // Fetch current version from server
      const response = await fetch('/api/version', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get version info');
      }

      const serverVersion: VersionInfo = result.data;
      const storedVersion = this.getStoredVersion();

      // Update last check time
      this.updateLastCheckTime();

      // First visit - store version and return no update
      if (!storedVersion) {
        this.storeVersion(serverVersion);
        return {
          hasUpdate: false,
          currentVersion: serverVersion,
          serverVersion,
          isFirstVisit: true
        };
      }

      // Check if there's an update
      const hasUpdate = this.hasVersionChanged(storedVersion, serverVersion);

      if (hasUpdate) {
        // Don't auto-update stored version - let user decide
        return {
          hasUpdate: true,
          currentVersion: storedVersion,
          serverVersion,
          isFirstVisit: false
        };
      }

      return {
        hasUpdate: false,
        currentVersion: storedVersion,
        serverVersion,
        isFirstVisit: false
      };

    } catch (error) {
      console.warn('Version check failed:', error);
      
      // Return stored version on error
      const stored = this.getStoredVersion();
      return {
        hasUpdate: false,
        currentVersion: stored || undefined,
        isFirstVisit: !stored
      };
    }
  }

  /**
   * Mark current server version as accepted (user updated)
   */
  static acceptUpdate(serverVersion: VersionInfo): void {
    this.storeVersion(serverVersion);
  }

  /**
   * Get stored version info
   */
  static getStoredVersion(): VersionInfo | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to parse stored version:', error);
      return null;
    }
  }

  /**
   * Store version info
   */
  private static storeVersion(version: VersionInfo): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(version));
    } catch (error) {
      console.warn('Failed to store version:', error);
    }
  }

  /**
   * Check if we should perform a version check (rate limiting)
   */
  private static shouldCheck(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
      if (!lastCheck) return true;

      const lastCheckTime = parseInt(lastCheck, 10);
      const now = Date.now();
      
      return (now - lastCheckTime) > this.CHECK_COOLDOWN;
    } catch (error) {
      return true;
    }
  }

  /**
   * Update last check timestamp
   */
  private static updateLastCheckTime(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.LAST_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to update last check time:', error);
    }
  }

  /**
   * Compare versions to detect changes
   */
  private static hasVersionChanged(stored: VersionInfo, server: VersionInfo): boolean {
    // Primary comparison: build ID
    if (stored.buildId !== server.buildId) {
      return true;
    }

    // Secondary comparison: version number
    if (stored.version !== server.version) {
      return true;
    }

    // Tertiary comparison: hash
    if (stored.hash !== server.hash) {
      return true;
    }

    return false;
  }

  /**
   * Clear stored version (for testing/debugging)
   */
  static clearStoredVersion(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.LAST_CHECK_KEY);
    } catch (error) {
      console.warn('Failed to clear stored version:', error);
    }
  }
}
