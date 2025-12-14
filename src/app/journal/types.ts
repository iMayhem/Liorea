export type Reaction = {
    post_id: number | string;
    username: string;
    emoji: string;
};

export type Journal = {
    id: number;
    username: string;
    title: string;
    tags: string;
    theme_color: string;
    images?: string;
    last_updated: number;
};

export type Post = {
    id: number | string;
    username: string;
    content: string;
    image_url?: string;
    created_at: number;
    photoURL?: string;
    reactions?: Reaction[];
    replyTo?: {
        id: number | string;
        username: string;
        content: string;
    };
};

export type GiphyResult = {
    id: string;
    images: {
        fixed_height: { url: string; width: string; height: string };
        original: { url: string; width: string; height: string };
        downsized: { url: string };
    };
};
