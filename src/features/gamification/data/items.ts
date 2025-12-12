import { ShopItem } from "../types";

export const SHOP_ITEMS: ShopItem[] = [
    // BADGES (Displayed next to name)
    {
        id: 'badge_night_owl',
        name: 'The Night Owl',
        description: 'For those who thrive in the dark.',
        price: 50,
        type: 'badge',
        previewUrl: '🦉'
    },
    {
        id: 'badge_early_bird',
        name: 'Early Bird',
        description: 'Catches the worm (and the XP).',
        price: 50,
        type: 'badge',
        previewUrl: '🐦'
    },
    {
        id: 'badge_coffee',
        name: 'Caffeine Powered',
        description: 'Running on bean juice.',
        price: 100,
        type: 'badge',
        previewUrl: '☕'
    },
    {
        id: 'badge_diamond',
        name: 'Diamond Hands',
        description: 'Unbreakable focus.',
        price: 500,
        type: 'badge',
        previewUrl: '💎'
    },

    // FRAMES (Avatar borders)
    {
        id: 'frame_gold',
        name: 'Golden Glow',
        description: 'A shiny aura for top students.',
        price: 200,
        type: 'frame',
        assetUrl: 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
    },
    {
        id: 'frame_neon_blue',
        name: 'Cyber Punk',
        description: 'High-tech focus visuals.',
        price: 350,
        type: 'frame',
        assetUrl: 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
    },
    {
        id: 'frame_fire',
        name: 'On Fire',
        description: 'Burning with productivity.',
        price: 500,
        type: 'frame',
        assetUrl: 'ring-2 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
    },

    // NAME COLORS (Chat username color)
    {
        id: 'color_teal',
        name: 'Electric Teal',
        description: 'Stand out in chat.',
        price: 150,
        type: 'color',
        assetUrl: 'text-teal-400'
    },
    {
        id: 'color_pink',
        name: 'Neon Pink',
        description: 'Bold and bright.',
        price: 150,
        type: 'color',
        assetUrl: 'text-pink-400'
    },
    {
        id: 'color_gold',
        name: 'Legendary Gold',
        description: 'The mark of a master.',
        price: 1000,
        type: 'color',
        assetUrl: 'text-yellow-400'
    }
];
