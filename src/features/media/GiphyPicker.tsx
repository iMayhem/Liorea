"use client";

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Film, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGiphy } from './useGiphy';
import { Scrollable } from '@/features/ui/Scrollable'; // <--- NEW IMPORT

interface GiphyPickerProps {
  onSelect: (url: string) => void;
  className?: string;
}

export default function GiphyPicker({ onSelect, className }: GiphyPickerProps) {
  const { gifs, search, isLoading } = useGiphy();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && gifs.length === 0) {
      search(""); 
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`text-white/50 hover:text-white rounded-full ${className}`}>
          <Film className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent side="top" align="start" className="w-72 p-2 bg-[#1e1e24] border-white/10 text-white shadow-2xl">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-white/40" />
            <Input 
              placeholder="Search Giphy..." 
              value={query}
              onChange={handleSearch}
              className="h-8 pl-8 bg-black/20 border-white/10 text-xs focus-visible:ring-offset-0 focus-visible:ring-white/20" 
            />
          </div>

          {/* REPLACED WITH SCROLLABLE */}
          <Scrollable className="h-48" thin>
            <div className="grid grid-cols-2 gap-1 pr-1">
              {isLoading ? (
                <div className="col-span-2 flex h-full items-center justify-center text-white/30">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => {
                      onSelect(gif.images.original.url);
                      setIsOpen(false); 
                    }}
                    className="relative aspect-video w-full overflow-hidden rounded bg-black/20 hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={gif.images.fixed_height.url} 
                      alt="GIF" 
                      className="h-full w-full object-cover" 
                      loading="lazy"
                    />
                  </button>
                ))
              )}
              {!isLoading && gifs.length === 0 && (
                <div className="col-span-2 text-center text-xs text-white/30 py-4">No results found</div>
              )}
            </div>
          </Scrollable>
        </div>
      </PopoverContent>
    </Popover>
  );
}