export type Background = {
  id: string;
  name: string;
  url: string;
};

// This file is no longer used for the primary background source,
// but can be kept for fallback or default data structure reference.
export const backgrounds: Background[] = [
    { id: 'lofi-desk', name: 'Lofi Desk', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
];
