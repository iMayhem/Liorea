/**
 * Simple in-memory cache with TTL (Time To Live)
 * Provides caching for API responses to reduce network requests
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class ApiCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    /**
     * Generate a cache key from URL and options
     */
    generateKey(url: string, options?: RequestInit): string {
        const method = options?.method || 'GET';
        const body = options?.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    /**
     * Get cached data if available and not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cache entry with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        };

        this.cache.set(key, entry);
    }

    /**
     * Invalidate a specific cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern: string | RegExp): void {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            const isExpired = now - entry.timestamp > entry.ttl;
            if (isExpired) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        apiCache.cleanup();
    }, 5 * 60 * 1000);
}
