import React from 'react';

export const JournalCollage = ({ imagesStr }: { imagesStr?: string }) => {
    const images = imagesStr ? imagesStr.split(',').filter(Boolean) : [];
    if (images.length === 0) return <div className="w-full h-full bg-black/40" />;

    return (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            <div className={`relative ${images.length === 1 ? 'col-span-2 row-span-2' : ''} ${images.length === 3 ? 'row-span-2' : ''} overflow-hidden border-r border-b border-black/10`}>
                <img src={images[0]} className="w-full h-full object-cover" alt="cover" loading="lazy" />
            </div>
            {images.length >= 2 && (
                <div className={`relative ${images.length === 2 ? 'row-span-2' : ''} overflow-hidden border-b border-black/10`}>
                    <img src={images[1]} className="w-full h-full object-cover" alt="cover" loading="lazy" />
                </div>
            )}
            {images.length >= 3 && (
                <div className={`relative ${images.length === 3 ? 'col-start-2' : ''} overflow-hidden border-r border-black/10`}>
                    <img src={images[2]} className="w-full h-full object-cover" alt="cover" loading="lazy" />
                </div>
            )}
            {images.length >= 4 && (
                <div className="relative overflow-hidden">
                    <img src={images[3]} className="w-full h-full object-cover" alt="cover" loading="lazy" />
                </div>
            )}
        </div>
    );
};
