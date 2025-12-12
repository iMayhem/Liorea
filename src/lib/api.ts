import { auth } from '@/lib/firebase';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";

// Helper to get token securely
const getAuthHeaders = async () => {
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

// Generic request wrapper
const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${WORKER_URL}${endpoint}`;

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    // Inject Auth
    const authHeaders = await getAuthHeaders();
    Object.assign(headers, authHeaders);

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
};

export const api = {
    auth: {
        googleCheck: (email: string, photoURL: string | null) => request<{ exists: boolean, username: string }>('/auth/google-check', { method: 'POST', body: JSON.stringify({ email, photoURL }) }),
        googleCreate: (data: { email: string | null, username: string, photoURL: string | null }) => request<{ username: string }>('/auth/google-create', { method: 'POST', body: JSON.stringify(data) }),
        renameUser: (oldUsername: string, newUsername: string) => request('/user/rename', { method: 'POST', body: JSON.stringify({ oldUsername, newUsername }) }),
        updateStatus: (username: string, status_text: string) => request('/user/status', { method: 'POST', body: JSON.stringify({ username, status_text }) }),
        getStatus: (username: string) => request<{ status_text: string }>(`/user/status?username=${username}`),
    },

    journal: {
        list: () => request<any[]>('/journals/list'),
        getPosts: (id: number, before?: number) => request<any[]>(`/journals/posts?id=${id}${before ? `&before=${before}` : ''}`),
        getFollowers: (id: number) => request<string[]>(`/journals/followers?id=${id}`),
        getFollowing: (username: string) => request<number[]>(`/journals/following?username=${username}`),

        create: (data: { username: string, title: string, tags: string, images: string, theme: string }) => request('/journals/create', { method: 'POST', body: JSON.stringify(data) }),
        post: (data: { journal_id: number, username: string, content: string, image_url?: string }) => request('/journals/post', { method: 'POST', body: JSON.stringify(data) }),
        follow: (journal_id: number, username: string) => request('/journals/follow', { method: 'POST', body: JSON.stringify({ journal_id, username }) }),
        react: (post_id: number, username: string, emoji: string) => request('/journals/react', { method: 'POST', body: JSON.stringify({ post_id, username, emoji }) }),

        delete: (id: number, username: string) => request('/journals/delete', { method: 'DELETE', body: JSON.stringify({ id, username }) }),
        deletePost: (id: number, username: string) => request('/journals/post/delete', { method: 'DELETE', body: JSON.stringify({ id, username }) }),
        updateImages: (id: number, images: string, username: string) => request('/journals/update_images', { method: 'POST', body: JSON.stringify({ id, images, username }) }),
    },

    study: {
        getLeaderboard: () => request<any[]>('/leaderboard'),
        getStats: (username: string) => request<{ total_minutes: number }>(`/study/stats?username=${username}`),
        getHistory: (username: string) => request<Record<string, number>>(`/study/history?username=${username}`),
        updateTime: (username: string, minutes: number) => request('/study/update', { method: 'POST', body: JSON.stringify({ username, minutes }) }),
    },

    chat: {
        getHistory: (room: string, before?: number) => request<any[]>(`/chat/history?room=${room}${before ? `&before=${before}` : ''}`),
        send: (data: { room_id: string, username: string, message: string, photoURL: string }) => request('/chat/send', { method: 'POST', body: JSON.stringify(data) }),
    },

    upload: {
        put: async (file: Blob) => {
            // Uploads to R2 usually require raw body, not JSON
            // We need a specific override here to NOT set application/json
            const url = `${WORKER_URL}/upload`;
            const response = await fetch(url, { method: 'PUT', body: file });
            if (!response.ok) throw new Error("Upload failed");
            return response.json() as Promise<{ url: string }>;
        }
    },

    giphy: {
        search: (query: string) => request<{ data: any[] }>(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=g`),
        trending: () => request<{ data: any[] }>(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`),
    }
};
