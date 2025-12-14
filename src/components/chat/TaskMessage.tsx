import React, { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskListContent {
    type: 'task_list';
    title: string;
    items: string[];
}

interface TaskMessageProps {
    postId: number | string;
    content: TaskListContent;
    isOwner: boolean;
}

export const TaskMessage: React.FC<TaskMessageProps> = ({ postId, content, isOwner }) => {
    // Array of booleans or nulls.
    // We use an object from firebase: { [index]: boolean }
    const [taskStates, setTaskStates] = useState<Record<number, boolean>>({});

    useEffect(() => {
        // Use a separate collection 'journal_tasks' for task states, docId = String(postId)
        if (!postId) return;
        const taskDocRef = doc(firestore, 'journal_tasks', String(postId));
        const unsubscribe = onSnapshot(taskDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setTaskStates(snapshot.data() as Record<number, boolean>);
            } else {
                setTaskStates({});
            }
        });
        return () => unsubscribe();
    }, [postId]);

    const toggleTask = async (index: number) => {
        if (!isOwner) return; // Only owner can toggle?
        const newState = !taskStates[index];
        const taskDocRef = doc(firestore, 'journal_tasks', String(postId));

        // Use setDoc with merge to ensure document exists if it handles the first click
        await setDoc(taskDocRef, { [index]: newState }, { merge: true });
    };

    return (
        <div className="bg-[#1e1e24] rounded-lg p-4 border border-white/10 w-full max-w-md relative overflow-hidden mt-1">
            {/* Green accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#22c55e]"></div>

            <div className="ml-2 mb-4">
                <h3 className="text-white font-bold text-lg">{content.title}</h3>
            </div>

            <div className="flex flex-col gap-2 ml-2">
                {content.items.map((item, idx) => {
                    const isCompleted = !!taskStates[idx];
                    return (
                        <div key={idx} className="flex items-start gap-3 group">
                            <span className="text-white/40 font-mono text-sm pt-0.5 w-4">{idx + 1}.</span>

                            <button
                                onClick={() => toggleTask(idx)}
                                disabled={!isOwner}
                                className={cn(
                                    "shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors border-none",
                                    isCompleted
                                        ? "bg-[#22c55e]"
                                        : "bg-[#ef4444]", // Red for unchecked as per prototype
                                    !isOwner && "cursor-default opacity-80"
                                )}
                            >
                                {isCompleted && <Check className="w-3.5 h-3.5 text-black font-bold" strokeWidth={4} />}
                            </button>

                            <span className={cn(
                                "text-sm text-white/90 leading-tight pt-[1px]",
                                isCompleted && "opacity-60"
                            )}>
                                {item}
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
