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
    // You can upload your other files to R2 and replace this link later
    file: '/sounds/cafe.mp3', 
    icon: 'Eye' 
  },
  { 
    id: 'rain', 
    name: 'Rain', 
    // This is the link from your screenshot!
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
    file: '/sounds/cafe.mp3', 
    icon: 'Coffee' 
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    file: '/sounds/forest.mp3', 
    icon: 'Waves' 
  },
];