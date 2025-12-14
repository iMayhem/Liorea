import { getProxiedUrl } from '@/lib/api';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { useState } from 'react';

export const JournalCollage = ({ imagesStr }: { imagesStr?: string }) => {
    const images = imagesStr ? imagesStr.split(',').filter(Boolean) : [];
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    if (images.length === 0) return <div className="w-full h-full bg-black/40" />;

    const getOptUrl = (url: string) => `${getProxiedUrl(url)}?width=400`;
    const getFullUrl = (url: string) => getProxiedUrl(url); // Or original

    const handleImageClick = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        setViewerImage(url);
    };

    return (
        <>
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                <div
                    className={`relative ${images.length === 1 ? 'col-span-2 row-span-2' : ''} ${images.length === 3 ? 'row-span-2' : ''} overflow-hidden border-r border-b border-black/10`}
                    onClick={(e) => handleImageClick(e, images[0])}
                >
                    <img src={getOptUrl(images[0])} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="cover" loading="lazy" />
                </div>
                {images.length >= 2 && (
                    <div
                        className={`relative ${images.length === 2 ? 'row-span-2' : ''} overflow-hidden border-b border-black/10`}
                        onClick={(e) => handleImageClick(e, images[1])}
                    >
                        <img src={getOptUrl(images[1])} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="cover" loading="lazy" />
                    </div>
                )}
                {images.length >= 3 && (
                    <div
                        className={`relative ${images.length === 3 ? 'col-start-2' : ''} overflow-hidden border-r border-black/10`}
                        onClick={(e) => handleImageClick(e, images[2])}
                    >
                        <img src={getOptUrl(images[2])} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="cover" loading="lazy" />
                    </div>
                )}
                {images.length >= 4 && (
                    <div
                        className="relative overflow-hidden"
                        onClick={(e) => handleImageClick(e, images[3])}
                    >
                        <img src={getOptUrl(images[3])} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="cover" loading="lazy" />
                    </div>
                )}
            </div>
            <ImageViewer
                isOpen={!!viewerImage}
                onClose={() => setViewerImage(null)}
                src={viewerImage ? getFullUrl(viewerImage) : ""}
            />
        </>
    );
};
