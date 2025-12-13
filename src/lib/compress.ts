import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,          // Reduced for lightweight chat uploads
    maxWidthOrHeight: 1600,  // Good balance for chat
    useWebWorker: true,      // Runs in background
    fileType: "image/webp",  // Efficient format
    initialQuality: 0.75     // Lower starting quality for smaller size
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression failed:", error);
    return file; // Fallback to original
  }
}