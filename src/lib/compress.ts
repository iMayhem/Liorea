import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.8,          // Increased slightly for better detail
    maxWidthOrHeight: 2048,  // 2K resolution is better for modern screens
    useWebWorker: true,      // Runs in background
    fileType: "image/webp",  // Newer format: Better quality/size ratio than JPEG
    initialQuality: 0.85     // Higher starting quality
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression failed:", error);
    return file; // Fallback to original
  }
}