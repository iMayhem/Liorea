/**
 * Centralized API response types and type guards
 */

// Generic API response wrapper
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: string;
}

// Error response from API
export interface ApiErrorResponse {
    error: string;
    code?: string;
    details?: Record<string, any>;
}

// Request configuration
export interface RequestConfig extends Omit<RequestInit, 'cache'> {
    retry?: boolean;
    retryAttempts?: number;
    timeout?: number;
    cache?: boolean; // Our custom cache flag (different from RequestInit.cache)
    cacheTTL?: number;
}

// Auth responses
export interface GoogleCheckResponse {
    exists: boolean;
    username: string;
}

export interface GoogleCreateResponse {
    username: string;
}

export interface UserStatusResponse {
    status_text: string;
    photoURL?: string;
    equipped_frame?: string;
}

// Journal responses
export interface Journal {
    id: number;
    username: string;
    title: string;
    tags: string;
    images: string;
    theme: string;
    created_at: number;
}

export interface JournalPost {
    id: number;
    journal_id: number;
    username: string;
    content: string;
    image_url?: string;
    created_at: number;
    replyTo?: string;
    reactions?: Record<string, string[]>;
}

// Study responses
export interface LeaderboardEntry {
    username: string;
    total_minutes: number;
    photoURL?: string;
    rank?: number;
}

export interface StudyStats {
    total_minutes: number;
}

export interface StudyHistory {
    [date: string]: number;
}

// Chat responses
export interface ChatMessage {
    id: string;
    room_id: string;
    username: string;
    message: string;
    photoURL: string;
    timestamp: number;
    reactions?: Record<string, string[]>;
    replyTo?: {
        id: string;
        username: string;
        message: string;
    };
}

// Upload response
export interface UploadResponse {
    url: string;
}

// Tenor responses
export interface TenorMedia {
    gif: { url: string };
    tinygif: { url: string };
    mediumgif: { url: string };
    nanogif: { url: string };
}

export interface TenorResult {
    id: string;
    title: string;
    media_formats: TenorMedia;
    created: number;
    content_description: string;
    itemurl: string;
    url: string;
    tags: string[];
    flags: string[];
    hasaudio: boolean;
}

export interface TenorResponse {
    results: TenorResult[];
    next?: string;
}

// Type guards
export function isApiErrorResponse(obj: any): obj is ApiErrorResponse {
    return obj && typeof obj === 'object' && 'error' in obj;
}

export function isGoogleCheckResponse(obj: any): obj is GoogleCheckResponse {
    return (
        obj &&
        typeof obj === 'object' &&
        'exists' in obj &&
        typeof obj.exists === 'boolean' &&
        'username' in obj &&
        typeof obj.username === 'string'
    );
}

export function isUploadResponse(obj: any): obj is UploadResponse {
    return obj && typeof obj === 'object' && 'url' in obj && typeof obj.url === 'string';
}

// Validation helpers
export function validateResponse<T>(data: unknown, validator: (data: any) => data is T): T {
    if (!validator(data)) {
        throw new Error('Invalid API response format');
    }
    return data;
}
