export type Reaction = {
    post_id: number;
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
    id: number;
    username: string;
    content: string;
    image_url?: string;
    created_at: number;
    photoURL?: string;
    reactions?: Reaction[];
};

export type GiphyResult = {
    id: string;
    images: {
        fixed_height: { url: string };
        original: { url: string };
    }
};
