
export type Sound = {
  id: string;
  name: string;
  file: string;
  icon: keyof typeof import("lucide-react");
};
export const sounds: Sound[] = [
  { id: 'focus-mode', name: 'Focus', file: '/sounds/cafe.mp3', icon: 'Eye' },
  { id: 'rain', name: 'Rain', file: '/sounds/rain.mp3', icon: 'CloudRain' },
  { id: 'fireplace', name: 'Fireplace', file: '/sounds/fireplace.mp3', icon: 'Flame' },
  { id: 'cafe', name: 'Cafe', file: '/sounds/cafe.mp3', icon: 'Coffee' },
  { id: 'ocean', name: 'Ocean', file: '/sounds/forest.mp3', icon: 'Waves' },
];
