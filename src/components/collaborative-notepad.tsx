// src/components/collaborative-notepad.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, RotateCw, Pencil, Check, User, Users } from 'lucide-react';
import type { Notepad } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/hooks/use-auth';

interface CollaborativeNotepadProps {
  activeNotepadId: string;
  notepad: Notepad | undefined;
  onContentChange: (newContent: string) => void;
  onNameChange: (newName: string) => void;
  onCycleNotepad: () => void;
  onClaimNotepad: () => void;
}

export function CollaborativeNotepad({ 
    activeNotepadId,
    notepad, 
    onContentChange, 
    onNameChange,
    onCycleNotepad,
    onClaimNotepad,
}: CollaborativeNotepadProps) {
  const { user } = useAuth();
  const [localContent, setLocalContent] = React.useState(notepad?.content || '');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [localName, setLocalName] = React.useState(notepad?.name || '');
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const isOwner = user && notepad?.owner === user.uid;
  const isCollaborative = activeNotepadId === 'collaborative';
  const isUnclaimed = !notepad?.owner;
  const canEditContent = isCollaborative || isOwner || (isUnclaimed && activeNotepadId !== 'collaborative');
  const canEditName = activeNotepadId !== 'collaborative' && (isOwner || isUnclaimed);

  React.useEffect(() => {
    setLocalContent(notepad?.content || '');
    setLocalName(notepad?.name || '');
    setIsEditingName(false); // Reset editing state on notepad change
  }, [activeNotepadId, notepad]);
  
  const debouncedOnContentChange = React.useCallback(
    (newContent: string) => {
      onContentChange(newContent);
    },
    [onContentChange]
  );
  
  React.useEffect(() => {
    if (!canEditContent) return;
    const handler = setTimeout(() => {
      if (localContent !== notepad?.content) {
        debouncedOnContentChange(localContent);
      }
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [localContent, notepad?.content, debouncedOnContentChange, canEditContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isUnclaimed && activeNotepadId !== 'collaborative' && !notepad?.owner) {
        onClaimNotepad();
    }
    setLocalContent(e.target.value);
  };
  
  const handleNameEditToggle = () => {
    if(isEditingName) {
        if (localName.trim() && localName !== notepad?.name) {
            onNameChange(localName.trim());
        } else {
            setLocalName(notepad?.name || '');
        }
    }
    setIsEditingName(!isEditingName);
  }

  React.useEffect(() => {
    if(isEditingName) {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleNameEditToggle();
    } else if (e.key === 'Escape') {
        setLocalName(notepad?.name || '');
        setIsEditingName(false);
    }
  }

  const NotepadIcon = isCollaborative ? Users : User;
  
  return (
    <Card className="h-full flex flex-col bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 font-heading">
           <div className="flex items-center gap-2">
             <NotepadIcon className="h-5 w-5" />
             {isEditingName && canEditName ? (
                <Input 
                    ref={nameInputRef}
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={handleNameEditToggle}
                    className="h-8 text-lg font-heading"
                />
             ) : (
                <span>{notepad?.name || 'Notepad'}</span>
             )}
           </div>
           <div className="flex items-center gap-1">
             {canEditName && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNameEditToggle}>
                    {isEditingName ? <Check className="h-4 w-4"/> : <Pencil className="h-4 w-4"/>}
                    <span className="sr-only">{isEditingName ? 'Save Name' : 'Edit Name'}</span>
                </Button>
             )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCycleNotepad}>
                <RotateCw className="h-4 w-4" />
                <span className="sr-only">Switch Notepad</span>
              </Button>
           </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2">
          <Textarea
              value={localContent}
              onChange={handleChange}
              placeholder={canEditContent ? "Type your notes here..." : "This notepad is read-only."}
              className="w-full h-full resize-none text-base bg-transparent border-0 focus-visible:ring-0"
              disabled={!canEditContent}
          />
      </CardContent>
    </Card>
  );
}
