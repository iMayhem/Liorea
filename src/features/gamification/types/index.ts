export interface GamificationStats {
    xp: number;
    level: number;
    coins: number;
    current_streak: number;
    inventory: string[]; // Array of item IDs
    equipped_badge: string;
    equipped_frame: string;
    equipped_effect: string;
    name_color: string;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'badge' | 'frame' | 'color' | 'effect' | 'wallpaper';
    assetUrl?: string; // CSS class, Image URL, or JSON URL (Lottie)
    previewUrl?: string;
}

export const LEVEL_FORMULA = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
export const XP_PER_MINUTE = 10;
