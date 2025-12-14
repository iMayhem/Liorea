export type Sound = {
  id: string;
  name: string;
  file: string;
  icon: keyof typeof import("lucide-react");
};

export const sounds: Sound[] = [
  {
    id: 'focus-mode',
    name: 'Focus',
    file: '', // No file for focus mode
    icon: 'Eye'
  },
  {
    id: 'rain',
    name: 'Rain',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/rain.mp3',
    icon: 'CloudRain'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/fire.mp3',
    icon: 'Flame'
  },
  {
    id: 'cafe',
    name: 'Cafe',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/coffee.mp3',
    icon: 'Coffee'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/ocean.mp3',
    icon: 'Waves'
  },
  {
    id: 'lofi-group',
    name: 'Lofi',
    file: '',
    icon: 'Music'
  },
];

export const lofiOptions: Sound[] = [
  {
    id: 'jazz-lofi',
    name: 'Jazz Lofi',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/jazzlofi.mp3',
    icon: 'Music'
  },
  {
    id: 'mushie-lofi',
    name: 'Mushie Lofi',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/mushielofi.mp3',
    icon: 'Headphones'
  },
  {
    id: 'kitty-lofi',
    name: 'Kitty Lofi',
    file: 'https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev/sounds/kittylofi.mp3',
    icon: 'Cat'
  },
];
