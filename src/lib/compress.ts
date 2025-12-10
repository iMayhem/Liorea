import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.6,          // Max size ~600KB (Great quality, low size)
    maxWidthOrHeight: 1920,  // Max width 1080p (No need for 4k on a card)
    useWebWorker: true,      // Runs in background so app doesn't freeze
    initialQuality: 0.8      // 80% JPEG quality
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression failed:", error);
    return file; // If compression fails, upload the original
  }
}