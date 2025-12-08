export type Video = {
  id: string;
  name: string;
  url: string;
  thumbnailId: string;
  thumbnailHint: string;
};

export const videos: Video[] = [
  {
    id: 'lofi-cafe',
    name: 'Lofi Cafe',
    url: 'https://cdn.pixabay.com/video/2023/10/24/185207-879893574_large.mp4',
    thumbnailId: 'video-thumb-1',
    thumbnailHint: 'cafe illustration',
  },
  {
    id: 'serene-lake',
    name: 'Serene Lake',
    url: 'https://cdn.pixabay.com/video/2024/05/27/212952-944723046_large.mp4',
    thumbnailId: 'video-thumb-2',
    thumbnailHint: 'lake mountain',
  },
  {
    id: 'cozy-fireplace',
    name: 'Cozy Fireplace',
    url: 'https://cdn.pixabay.com/video/2021/11/22/94902-642491187_large.mp4',
    thumbnailId: 'video-thumb-3',
    thumbnailHint: 'fireplace room',
  },
  {
    id: 'rainy-window',
    name: 'Rainy Window',
    url: 'https://cdn.pixabay.com/video/2017/08/02/11153-225330368_large.mp4',
    thumbnailId: 'video-thumb-4',
    thumbnailHint: 'rain window',
  },
];
