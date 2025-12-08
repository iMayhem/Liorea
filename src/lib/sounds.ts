export type Sound = {
  id: string;
  name: string;
  file: string;
  icon: keyof typeof import("lucide-react");
};
export const sounds: Sound[] = [
  { id: 'rain', name: 'Rain', file: '/sounds/rain.mp3', icon: 'CloudRain' },
  { id: 'forest', name: 'Forest', file: '/sounds/forest.mp3', icon: 'Trees' },
  { id: 'cafe', name: 'Cafe', file: '/sounds/cafe.mp3', icon: 'Coffee' },
  { id: 'fireplace', name: 'Fireplace', file: '/sounds/fireplace.mp3', icon: 'Flame' },
];
