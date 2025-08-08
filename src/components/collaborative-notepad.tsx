// src/components/collaborative-notepad.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import type { Participant } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface CollaborativeNotepadProps {
  content: string;
  onContentChange: (content: string) => void;
  participants: Participant[];
  currentUserId: string;
  activeNotepad: string;
  onNotepadChange: (notepadId: string) => void;
}

export function CollaborativeNotepad({ 
    content, 
    onContentChange, 
    participants, 
    currentUserId,
    activeNotepad,
    onNotepadChange
}: CollaborativeNotepadProps) {

  // The content is now directly controlled by the parent hook,
  // so local state is only needed for the textarea itself to avoid lag.
  const [localContent, setLocalContent] = React.useState(content);

  // Update local state immediately when the prop changes (data from Firestore)
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);
  
  // Use a debounced callback to send updates to Firestore
  // to avoid excessive writes on every keystroke.
  const debouncedOnContentChange = React.useCallback(
    (newContent: string) => {
      onContentChange(newContent);
    },
    [onContentChange]
  );
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      // Only call the debounced function if content has actually changed
      if (localContent !== content) {
        debouncedOnContentChange(localContent);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [localContent, content, debouncedOnContentChange]);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };
  
  const getParticipantName = (uid: string) => {
    if (uid === currentUserId) return "My Notepad";
    const participant = participants.find(p => p.uid === uid);
    return participant?.username || `User ${uid.slice(0, 4)}`;
  }

  return (
    <Card className="h-full flex flex-col bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 font-heading">
           <div className="flex items-center gap-2">
             <FileText className="h-5 w-5" />
             Notepads
           </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2">
         <Tabs value={activeNotepad} onValueChange={onNotepadChange} className="w-full flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
                <TabsTrigger value={currentUserId}>My Notepad</TabsTrigger>
            </TabsList>
             <TabsContent value={activeNotepad} className="flex-1 mt-2">
                <Textarea
                    value={localContent}
                    onChange={handleChange}
                    placeholder="Type your notes here..."
                    className="w-full h-full resize-none text-base bg-transparent border-0 focus-visible:ring-0"
                />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
