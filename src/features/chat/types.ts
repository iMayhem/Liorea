export interface ChatReaction {
    id?: string;
    username: string;
    emoji: string;
}

export interface ChatMessage {
    id: string; // Can be Firebase string or D1 number (as string)
    username: string;
    message: string;
    timestamp: number;
    photoURL?: string;
    image_url?: string;
    reactions?: Record<string, ChatReaction>;
    replyTo?: {
        id: string;
        username: string;
        message: string;
    };
    deleted?: boolean;
}
