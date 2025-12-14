import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { Check, Edit2, Plus, Minus, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface TaskListContent {
    type: 'task_list';
    title: string;
    items: string[];
}

interface Item {
    text: string;
    completed: boolean;
}

interface FirebaseListData {
    title?: string;
    items?: Item[];
    // Legacy: Record<string, boolean>
}

interface TaskMessageProps {
    postId: number;
    content: TaskListContent;
    isOwner: boolean;
}

export const TaskMessage: React.FC<TaskMessageProps> = ({ postId, content, isOwner }) => {
    // We try to use Firebase data as the source of truth if it has the new structure.
    // Otherwise fallback to content props + boolean map.
    const [fbData, setFbData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit state
    const [editTitle, setEditTitle] = useState("");
    const [editItems, setEditItems] = useState<Item[]>([]);

    useEffect(() => {
        const taskRef = ref(db, `journal_tasks/${postId}`);
        const unsubscribe = onValue(taskRef, (snapshot) => {
            if (snapshot.exists()) {
                setFbData(snapshot.val());
            } else {
                setFbData(null);
            }
        });
        return () => unsubscribe();
    }, [postId]);

    // Determine current display data
    const displayTitle = fbData?.title || content.title;

    // Check if fbData is the new full structure (has 'items' array)
    const isFullStructure = fbData && Array.isArray(fbData.items);

    const displayItems: Item[] = isFullStructure
        ? fbData.items
        : content.items.map((text, idx) => ({
            text,
            completed: fbData ? !!fbData[idx] : false
        }));

    const handleEditClick = () => {
        setEditTitle(displayTitle);
        setEditItems([...displayItems]);
        setIsEditing(true);
    };

    const handleSave = () => {
        // Save full structure to Firebase
        // This effectively migrates old lists to new format too!
        set(ref(db, `journal_tasks/${postId}`), {
            title: editTitle,
            items: editItems
        });
        setIsEditing(false);
    };

    const toggleTask = (index: number) => {
        if (!isOwner) return;

        if (isFullStructure) {
            // Update specific item in new structure
            const newItems = [...fbData.items];
            newItems[index].completed = !newItems[index].completed;
            set(ref(db, `journal_tasks/${postId}/items`), newItems);
        } else {
            // Legacy toggle (boolean map)
            // But wait, if we edit, we migrate. If we just toggle, we should probably stick to what it was?
            // Actually, best to upgrade on first interaction? 
            // The boolean map update was: `journal_tasks/${postId}/${index}` = true/false.
            // If I overwrite with full object, that breaks the simple boolean map.
            // BUT, since we check `isFullStructure` (presence of `items`), it should be fine.
            // If I just toggle one boolean, I am NOT writing the full object.
            // So:
            const currentVal = fbData ? !!fbData[index] : false;
            set(ref(db, `journal_tasks/${postId}/${index}`), !currentVal);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-[#1e1e24] rounded-lg p-4 border border-white/10 w-full max-w-md mt-1 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/50 uppercase">Editing List</span>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-white/5" onClick={() => setIsEditing(false)}><X className="w-4 h-4" /></Button>
                    </div>
                </div>

                <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-black/20 border-white/10 h-8 font-bold"
                />

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <Input
                                value={item.text}
                                onChange={(e) => {
                                    const newItems = [...editItems];
                                    newItems[idx].text = e.target.value;
                                    setEditItems(newItems);
                                }}
                                className="bg-black/20 border-white/10 h-8 flex-1"
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-red-400" onClick={() => {
                                setEditItems(editItems.filter((_, i) => i !== idx));
                            }}><Minus className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="sm" className="w-full border-dashed border-white/20 text-white/50 hover:text-white" onClick={() => setEditItems([...editItems, { text: "", completed: false }])}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>

                <Button className="w-full bg-white text-black hover:bg-white/90" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#1e1e24] rounded-lg p-4 border border-white/10 w-full max-w-md relative overflow-hidden mt-1 group">
            {/* Green accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#22c55e]"></div>

            <div className="ml-2 mb-4 flex justify-between items-start">
                <h3 className="text-white font-bold text-lg leading-tight">{displayTitle}</h3>
                {isOwner && (
                    <button
                        onClick={handleEditClick}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/30 hover:text-white"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2 ml-2">
                {displayItems.map((item, idx) => {
                    const isCompleted = item.completed;
                    return (
                        <div key={idx} className="flex items-start gap-3 group/item">
                            <span className="text-white/40 font-mono text-sm pt-0.5 w-4 shrink-0">{idx + 1}.</span>

                            <button
                                onClick={() => toggleTask(idx)}
                                disabled={!isOwner}
                                className={cn(
                                    "shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors border-none",
                                    isCompleted
                                        ? "bg-[#22c55e]"
                                        : "bg-[#ef4444]", // Red for unchecked
                                    !isOwner && "cursor-default opacity-80"
                                )}
                            >
                                {isCompleted && <Check className="w-3.5 h-3.5 text-black font-bold" strokeWidth={4} />}
                            </button>

                            <span className={cn(
                                "text-sm text-white/90 leading-tight pt-[1px]",
                                isCompleted && "opacity-60"
                            )}>
                                {item.text}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 ml-2 text-[10px] text-white/20 font-mono">
                © {new Date().getFullYear()} Liorea Task System
            </div>
        </div>
    );
};
