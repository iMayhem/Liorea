import { auth } from '@/lib/firebase';
import { retryWithBackoff, handleError } from '@/lib/error-handler';
import { apiCache } from '@/lib/api-cache';
import type { RequestConfig } from '@/lib/api-types';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const TENOR_API_KEY = "AIzaSyCYfOBlVZK7Ika6BGP6hHvH2ZIwOC_Wc_A";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Track active requests for cancellation
const activeRequests = new Map<string, AbortController>();

export const getProxiedUrl = (url: string | undefined | null) => {
    if (!url) return "";
    if (url.includes("r2.dev/")) {
        const key = url.split("r2.dev/")[1];
        return `${WORKER_URL}/content/${key}`;
    }
    return url;
};

// Helper to get token securely
const getAuthHeaders = async () => {
    await auth.authStateReady(); // Ensure auth is initialized
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            return { 'Authorization': `Bearer ${token}` };
        } catch (e) {
            console.error("Error getting auth token:", e);
        }
    }
    return {};
};

// Enhanced request wrapper with retry, timeout, and caching
const request = async <T>(endpoint: string, options?: RequestConfig): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${WORKER_URL}${endpoint}`;
    const {
        retry = false,
        retryAttempts = 3,
        timeout = DEFAULT_TIMEOUT,
        cache = false,
        cacheTTL,
        ...fetchOptions
    } = options || {};

    // Check cache for GET requests
    const cacheKey = apiCache.generateKey(url, fetchOptions);
    if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        const cachedData = apiCache.get<T>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
    }

    // Create abort controller for timeout and cancellation
    const abortController = new AbortController();
    activeRequests.set(cacheKey, abortController);

    // Set up timeout
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, timeout);

    try {
        // Default headers
        const headers = {
            'Content-Type': 'application/json',
            ...fetchOptions?.headers,
        };

        // Inject Auth
        const authHeaders = await getAuthHeaders();
        Object.assign(headers, authHeaders);

        const config: RequestInit = {
            ...fetchOptions,
            headers,
            signal: abortController.signal,
        };

        // Execute request with optional retry
        const executeRequest = async () => {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            // Handle empty responses
            const text = await response.text();
            return text ? JSON.parse(text) : {} as T;
        };

        const result = retry
            ? await retryWithBackoff(executeRequest, { maxRetries: retryAttempts })
            : await executeRequest();

        // Cache successful GET requests
        if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
            apiCache.set(cacheKey, result, cacheTTL);
        }

        return result;
    } catch (error) {
        // Handle abort errors
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout or cancelled');
        }

        // Re-throw with better error handling
        throw handleError(error, `API request to ${endpoint}`);
    } finally {
        clearTimeout(timeoutId);
        activeRequests.delete(cacheKey);
    }
};

// Cancel a specific request
export const cancelRequest = (endpoint: string, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${WORKER_URL}${endpoint}`;
    const cacheKey = apiCache.generateKey(url, options);
    const controller = activeRequests.get(cacheKey);

    if (controller) {
        controller.abort();
        activeRequests.delete(cacheKey);
    }
};

// Cancel all active requests
export const cancelAllRequests = () => {
    for (const controller of activeRequests.values()) {
        controller.abort();
    }
    activeRequests.clear();
};

export const api = {
    auth: {
        googleCheck: (email: string, photoURL: string | null) =>
            request<{ exists: boolean, username: string }>('/auth/google-check', {
                method: 'POST',
                body: JSON.stringify({ email, photoURL }),
                retry: true
            }),
        googleCreate: (data: { email: string | null, username: string, photoURL: string | null }) =>
            request<{ username: string }>('/auth/google-create', {
                method: 'POST',
                body: JSON.stringify(data),
                retry: true
            }),

        updateProfile: (photoURL: string) =>
            request('/user/profile', {
                method: 'POST',
                body: JSON.stringify({ photoURL })
            }),
        updateStatus: (username: string, status_text: string) =>
            request('/user/status', {
                method: 'POST',
                body: JSON.stringify({ username, status_text })
            }),
        getStatus: (username: string) =>
            request<{ status_text: string, photoURL?: string, equipped_frame?: string }>(`/user/status?username=${username}`, {
                cache: true,
                cacheTTL: 60000 // 1 minute
            }),
    },

    journal: {
        list: () =>
            request<any[]>('/journals/list', {
                cache: true,
                cacheTTL: 30000 // 30 seconds
            }),
        getPosts: (id: number, before?: number) =>
            request<any[]>(`/journals/posts?id=${id}${before ? `&before=${before}` : ''}`, {
                cache: true,
                cacheTTL: 10000 // 10 seconds
            }),
        getFollowers: (id: number) =>
            request<string[]>(`/journals/followers?id=${id}`, {
                cache: true,
                cacheTTL: 30000
            }),
        getFollowing: (username: string) =>
            request<number[]>(`/journals/following?username=${username}`, {
                cache: true,
                cacheTTL: 30000
            }),

        create: (data: { username: string, title: string, tags: string, images: string, theme: string }) => {
            apiCache.invalidatePattern('/journals/list');
            return request('/journals/create', { method: 'POST', body: JSON.stringify(data) });
        },
        post: (data: { journal_id: number, username: string, content: string, image_url?: string, replyTo?: string }) => {
            apiCache.invalidatePattern(`/journals/posts?id=${data.journal_id}`);
            return request('/journals/post', { method: 'POST', body: JSON.stringify(data) });
        },
        follow: (journal_id: number, username: string) => {
            apiCache.invalidatePattern('/journals/follow');
            return request('/journals/follow', { method: 'POST', body: JSON.stringify({ journal_id, username }) });
        },
        react: (post_id: number, username: string, emoji: string) =>
            request('/journals/react', { method: 'POST', body: JSON.stringify({ post_id, username, emoji }) }),

        delete: (id: number, username: string) => {
            apiCache.invalidatePattern('/journals/');
            return request('/journals/delete', { method: 'DELETE', body: JSON.stringify({ id, username }) });
        },
        deletePost: (id: number, username: string) => {
            apiCache.invalidatePattern('/journals/posts');
            return request('/journals/post/delete', { method: 'DELETE', body: JSON.stringify({ id, username }) });
        },
        updateImages: (id: number, images: string, username: string) => {
            apiCache.invalidatePattern(`/journals/`);
            return request('/journals/update_images', { method: 'POST', body: JSON.stringify({ id, images, username }) });
        },
    },

    study: {
        getLeaderboard: (timeframe: string = 'all') =>
            request<any[]>(`/leaderboard?timeframe=${timeframe}`, {
                cache: true,
                cacheTTL: 15000 // 15 seconds
            }),
        getStats: (username: string) =>
            request<{ total_minutes: number }>(`/study/stats?username=${username}`, {
                cache: true,
                cacheTTL: 30000
            }),
        getHistory: (username: string) =>
            request<Record<string, number>>(`/study/history?username=${username}`, {
                cache: true,
                cacheTTL: 60000
            }),
        updateTime: (username: string, minutes: number) => {
            apiCache.invalidatePattern('/study/');
            apiCache.invalidatePattern('/leaderboard');
            return request('/study/update', { method: 'POST', body: JSON.stringify({ username, minutes }) });
        },
    },

    chat: {
        getHistory: (room: string, before?: number) =>
            request<any[]>(`/chat/history?room=${room}${before ? `&before=${before}` : ''}`, {
                cache: true,
                cacheTTL: 5000 // 5 seconds
            }),
        send: (data: { room_id: string, username: string, message: string, photoURL: string }) => {
            apiCache.invalidatePattern('/chat/history');
            return request('/chat/send', { method: 'POST', body: JSON.stringify(data) });
        },
        delete: (data: { room_id: string, message_id: string, username: string }) => {
            apiCache.invalidatePattern('/chat/history');
            return request('/chat/delete', {
                method: 'DELETE',
                body: JSON.stringify({
                    id: data.message_id,
                    room_id: data.room_id,
                    username: data.username
                })
            });
        },
    },

    upload: {
        put: async (file: Blob) => {
            const url = `${WORKER_URL}/upload`;
            const headerAuth = await getAuthHeaders();

            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60s for uploads

            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        ...(headerAuth as any)
                    },
                    signal: abortController.signal
                });

                if (!response.ok) throw new Error("Upload failed");
                return response.json() as Promise<{ url: string }>;
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error('Upload timeout');
                }
                throw handleError(error, 'File upload');
            } finally {
                clearTimeout(timeoutId);
            }
        }
    },

    tenor: {
        search: async (query: string) => {
            if (!TENOR_API_KEY) {
                console.warn("TENOR_API_KEY is missing.");
                return { results: [] };
            }

            try {
                const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&client_key=liorea&limit=20&contentfilter=medium`);
                const data = await res.json();
                return data;
            } catch (error) {
                handleError(error, 'Tenor search');
                return { results: [] };
            }
        },
        trending: async () => {
            if (!TENOR_API_KEY) {
                console.warn("TENOR_API_KEY is missing.");
                return { results: [] };
            }

            try {
                const res = await fetch(`https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=liorea&limit=20&contentfilter=medium`);
                const data = await res.json();
                return data;
            } catch (error) {
                handleError(error, 'Tenor trending');
                return { results: [] };
            }
        },
    },
};
