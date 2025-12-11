import { useState } from 'react';
import { compressImage } from '@/lib/compress'; // Your existing helper
import { api } from '@/lib/api';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      // 1. Compress
      const compressed = await compressImage(file);
      
      // 2. Upload via API Lib
      const { url } = await api.media.upload(compressed);
      
      return url;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}