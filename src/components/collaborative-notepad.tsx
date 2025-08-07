// src/components/collaborative-notepad.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedCallback } from 'use-debounce';
import { FileText } from 'lucide-react';

interface CollaborativeNotepadProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function CollaborativeNotepad({ content, onContentChange }: CollaborativeNotepadProps) {
  const [localContent, setLocalContent] = React.useState(content);

  // Update local state immediately when the prop changes (data from Firestore)
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Debounce the callback to Firestore to avoid excessive writes
  const debouncedOnContentChange = useDebouncedCallback(onContentChange, 500);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    debouncedOnContentChange(e.target.value);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
            <FileText className="h-5 w-5" />
            Collaborative Notepad
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex">
        <Textarea
          value={localContent}
          onChange={handleChange}
          placeholder="Type your shared notes here..."
          className="w-full h-full resize-none text-base"
        />
      </CardContent>
    </Card>
  );
}
