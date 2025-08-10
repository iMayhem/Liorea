// src/components/timetable-settings-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus, Trash2, Edit, Check, Copy } from 'lucide-react';
import type { CustomTimetable, CustomSubject, CustomTask } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { defaultAchieverSchedule, defaultJeeSchedule } from '@/lib/data';
import { saveUserTimetable } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';

interface TimetableSettingsOverlayProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    currentTimetable: CustomTimetable | null;
    onTimetableSave: (newTimetable: CustomTimetable) => void;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableSettingsOverlay({ isOpen, onOpenChange, currentTimetable, onTimetableSave }: TimetableSettingsOverlayProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [activeDay, setActiveDay] = React.useState(new Date().getDay());
    const [timetable, setTimetable] = React.useState<CustomTimetable>({});
    const [editingSubject, setEditingSubject] = React.useState<{ day: number, subjectId: string, name: string } | null>(null);
    const [editingTask, setEditingTask] = React.useState<{ day: number, subjectId: string, taskId: string, label: string } | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            const defaultSchedule = profile?.preparationPath === 'jee' ? defaultJeeSchedule : defaultAchieverSchedule;
            setTimetable(currentTimetable || defaultSchedule);
        }
    }, [isOpen, currentTimetable, profile]);

    const handleSave = async () => {
        if (!user) return;
        try {
            await saveUserTimetable(user.uid, timetable);
            onTimetableSave(timetable);
            toast({ title: "Success", description: "Your timetable has been saved." });
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save timetable.", variant: "destructive" });
        }
    };

    const updateTimetable = (day: number, subjects: CustomSubject[]) => {
        setTimetable(prev => ({ ...prev, [day]: subjects }));
    };

    const handleAddSubject = (day: number) => {
        const newSubject: CustomSubject = {
            id: `sub-${Date.now()}`,
            name: 'New Subject',
            tasks: [{ id: `task-${Date.now()}`, label: 'New Task' }]
        };
        const daySubjects = timetable[day] ? [...timetable[day], newSubject] : [newSubject];
        updateTimetable(day, daySubjects);
    };

    const handleDeleteSubject = (day: number, subjectId: string) => {
        const daySubjects = timetable[day].filter(s => s.id !== subjectId);
        updateTimetable(day, daySubjects);
    };

    const handleAddTask = (day: number, subjectId: string) => {
        const daySubjects = [...timetable[day]];
        const subjectIndex = daySubjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
            const newTask: CustomTask = { id: `task-${Date.now()}`, label: 'New Task' };
            daySubjects[subjectIndex].tasks.push(newTask);
            updateTimetable(day, daySubjects);
        }
    };

    const handleDeleteTask = (day: number, subjectId: string, taskId: string) => {
        const daySubjects = [...timetable[day]];
        const subjectIndex = daySubjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
            daySubjects[subjectIndex].tasks = daySubjects[subjectIndex].tasks.filter(t => t.id !== taskId);
            updateTimetable(day, daySubjects);
        }
    };
    
    const handleApplyToAll = (dayToCopyFrom: number) => {
        const scheduleToCopy = timetable[dayToCopyFrom];
        if (!scheduleToCopy) return;

        const newTimetable: CustomTimetable = {};
        for (let i = 0; i < 7; i++) {
            // Create a deep copy with new unique IDs for each subject and task
            newTimetable[i] = scheduleToCopy.map(subject => ({
                ...subject,
                id: `sub-${Date.now()}-${i}-${Math.random()}`,
                tasks: subject.tasks.map(task => ({
                    ...task,
                    id: `task-${Date.now()}-${i}-${Math.random()}`
                }))
            }));
        }
        setTimetable(newTimetable);
        toast({ title: "Applied to all days", description: `Copied schedule from ${daysOfWeek[dayToCopyFrom]}.` });
    };


    const activeDaySubjects = timetable[activeDay] || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <Card className="w-full max-w-4xl h-[90vh] bg-background/80 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-heading">Customize Your Timetable</CardTitle>
                                <CardDescription>Create a schedule that works for you.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-6 w-6" /></Button>
                        </CardHeader>
                        <CardContent className="flex-1 flex gap-4 overflow-hidden">
                            <div className="w-1/4 flex flex-col gap-2">
                                {daysOfWeek.map((day, index) => (
                                    <Button key={day} variant={activeDay === index ? 'secondary' : 'ghost'} onClick={() => setActiveDay(index)}>
                                        {day}
                                    </Button>
                                ))}
                                 <Button variant="outline" className="mt-auto" onClick={() => handleApplyToAll(activeDay)}>
                                    <Copy className="mr-2 h-4 w-4" /> Apply to All Days
                                </Button>
                            </div>
                            <div className="w-3/4 flex flex-col gap-4">
                                <h3 className="text-xl font-bold font-heading">{daysOfWeek[activeDay]}'s Schedule</h3>
                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-4">
                                    {activeDaySubjects.map(subject => (
                                        <Card key={subject.id} className="bg-background/50">
                                            <CardHeader className="flex-row items-center justify-between pb-2">
                                                {editingSubject?.subjectId === subject.id ? (
                                                    <Input 
                                                        value={editingSubject.name}
                                                        onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                                                        autoFocus
                                                    />
                                                ) : <CardTitle className="text-lg">{subject.name}</CardTitle>}
                                                <div className="flex items-center gap-1">
                                                    {editingSubject?.subjectId === subject.id ? (
                                                        <Button size="icon" variant="ghost" onClick={() => {
                                                            const daySubjects = [...timetable[activeDay]];
                                                            const subIndex = daySubjects.findIndex(s => s.id === subject.id);
                                                            if (subIndex !== -1) {
                                                                daySubjects[subIndex].name = editingSubject.name;
                                                                updateTimetable(activeDay, daySubjects);
                                                            }
                                                            setEditingSubject(null);
                                                        }}><Check className="h-4 w-4"/></Button>
                                                    ) : (
                                                        <Button size="icon" variant="ghost" onClick={() => setEditingSubject({day: activeDay, subjectId: subject.id, name: subject.name})}><Edit className="h-4 w-4"/></Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteSubject(activeDay, subject.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {subject.tasks.map(task => (
                                                         <div key={task.id} className="flex items-center justify-between pl-4">
                                                            {editingTask?.taskId === task.id ? (
                                                                <Input value={editingTask.label} onChange={(e) => setEditingTask({...editingTask, label: e.target.value})} autoFocus/>
                                                            ) : <p>{task.label}</p>}
                                                            <div className="flex items-center">
                                                                {editingTask?.taskId === task.id ? (
                                                                    <Button size="icon" variant="ghost" onClick={() => {
                                                                        const daySubjects = [...timetable[activeDay]];
                                                                        const subIndex = daySubjects.findIndex(s => s.id === subject.id);
                                                                        if (subIndex !== -1) {
                                                                            const taskIndex = daySubjects[subIndex].tasks.findIndex(t => t.id === task.id);
                                                                            daySubjects[subIndex].tasks[taskIndex].label = editingTask.label;
                                                                            updateTimetable(activeDay, daySubjects);
                                                                        }
                                                                        setEditingTask(null);
                                                                    }}><Check className="h-4 w-4"/></Button>
                                                                ) : (
                                                                    <Button size="icon" variant="ghost" onClick={() => setEditingTask({day: activeDay, subjectId: subject.id, taskId: task.id, label: task.label})}><Edit className="h-4 w-4"/></Button>
                                                                )}
                                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(activeDay, subject.id, task.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddTask(activeDay, subject.id)}>
                                                        <Plus className="mr-2 h-4 w-4"/> Add Task
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    </div>
                                </ScrollArea>
                                <Button className="w-full" onClick={() => handleAddSubject(activeDay)}>
                                    <Plus className="mr-2 h-4 w-4"/>Add Subject
                                </Button>
                                <Button className="w-full" onClick={handleSave}>Save Timetable</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
