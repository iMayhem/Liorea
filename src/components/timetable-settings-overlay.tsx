// src/components/timetable-settings-overlay.tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus, Trash2, Edit, Check, Copy, Calendar as CalendarIcon } from 'lucide-react';
import type { CustomTimetable, CustomSubject, CustomTask } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { defaultWeeklySchedule } from '@/lib/data';
import { saveUserTimetable } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

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
    const [timetable, setTimetable] = React.useState<CustomTimetable>({});
    
    // activeKey can be a number (day of week) or string ('yyyy-MM-dd')
    const [activeKey, setActiveKey] = React.useState<number | string>(new Date().getDay());
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

    const [editingSubject, setEditingSubject] = React.useState<{ key: number | string, subjectId: string, name: string } | null>(null);
    const [editingTask, setEditingTask] = React.useState<{ key: number | string, subjectId: string, taskId: string, label: string } | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            // If currentTimetable is null or empty, use the default schedule.
            const initialTimetable = currentTimetable && Object.keys(currentTimetable).length > 0
                ? currentTimetable
                : defaultWeeklySchedule;
            setTimetable(initialTimetable);
            setActiveKey(new Date().getDay());
            setSelectedDate(undefined);
        }
    }, [isOpen, currentTimetable]);

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
    
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const specificDateKey = format(date, 'yyyy-MM-dd');
            setActiveKey(specificDateKey);
            
            // If there's no schedule for this specific date yet, create one
            // based on the schedule for that day of the week.
            if (!timetable[specificDateKey]) {
                const dayOfWeek = getDay(date);
                const baseSchedule = timetable[dayOfWeek] || [];
                
                const newScheduleForDate = JSON.parse(JSON.stringify(baseSchedule)).map((subject: CustomSubject) => ({
                    ...subject,
                    id: `sub-${Date.now()}-${Math.random()}`,
                    tasks: subject.tasks.map((task: CustomTask) => ({
                        ...task,
                        id: `task-${Date.now()}-${Math.random()}`
                    }))
                }));

                setTimetable(prev => ({ ...prev, [specificDateKey]: newScheduleForDate }));
            }
        } else {
            // Revert to today's day of week if date is cleared
            setActiveKey(new Date().getDay());
        }
    }

    const updateTimetable = (key: number | string, subjects: CustomSubject[]) => {
        setTimetable(prev => ({ ...prev, [key]: subjects }));
    };

    const handleAddSubject = (key: number | string) => {
        const newSubject: CustomSubject = {
            id: `sub-${Date.now()}`,
            name: 'New Subject',
            tasks: [{ id: `task-${Date.now()}`, label: 'New Task' }]
        };
        const daySubjects = timetable[key] ? [...timetable[key], newSubject] : [newSubject];
        updateTimetable(key, daySubjects);
    };

    const handleDeleteSubject = (key: number | string, subjectId: string) => {
        const daySubjects = (timetable[key] || []).filter(s => s.id !== subjectId);
        updateTimetable(key, daySubjects);
    };

    const handleAddTask = (key: number | string, subjectId: string) => {
        const daySubjects = [...(timetable[key] || [])];
        const subjectIndex = daySubjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
            const newTask: CustomTask = { id: `task-${Date.now()}`, label: 'New Task' };
            daySubjects[subjectIndex].tasks.push(newTask);
            updateTimetable(key, daySubjects);
        }
    };

    const handleDeleteTask = (key: number | string, subjectId: string, taskId: string) => {
        const daySubjects = [...(timetable[key] || [])];
        const subjectIndex = daySubjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
            daySubjects[subjectIndex].tasks = daySubjects[subjectIndex].tasks.filter(t => t.id !== taskId);
            updateTimetable(key, daySubjects);
        }
    };
    
    const handleApplyToAll = (keyToCopyFrom: number | string) => {
        if (typeof keyToCopyFrom !== 'number') {
            toast({ title: "Action not allowed", description: "You can only apply a weekly schedule to all days.", variant: "destructive" });
            return;
        }

        const scheduleToCopy = timetable[keyToCopyFrom];
        if (!scheduleToCopy) return;

        let newTimetable: CustomTimetable = { ...timetable };
        for (let i = 0; i < 7; i++) {
            newTimetable[i] = JSON.parse(JSON.stringify(scheduleToCopy)).map((subject: CustomSubject) => ({
                ...subject,
                id: `sub-${Date.now()}-${i}-${Math.random()}`,
                tasks: subject.tasks.map((task: CustomTask) => ({
                    ...task,
                    id: `task-${Date.now()}-${i}-${Math.random()}`
                }))
            }));
        }
        setTimetable(newTimetable);
        toast({ title: "Applied to all days", description: `Copied schedule from ${daysOfWeek[keyToCopyFrom]}.` });
    };

    const activeDaySubjects = timetable[activeKey] || [];
    const getActiveKeyTitle = () => {
        if(typeof activeKey === 'number') {
            return `${daysOfWeek[activeKey]}'s Schedule`
        }
        try {
            return `Schedule for ${format(new Date(activeKey), 'MMM d, yyyy')}`;
        } catch {
             return "Invalid Date Schedule"
        }
    }

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
                                    <Button key={day} variant={activeKey === index ? 'secondary' : 'ghost'} onClick={() => {
                                        setActiveKey(index);
                                        setSelectedDate(undefined);
                                    }}>
                                        {day}
                                    </Button>
                                ))}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={!!selectedDate ? 'secondary' : 'outline'}
                                            className="mt-4"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4"/>
                                            {selectedDate ? format(selectedDate, 'PPP') : "Select Specific Date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={cn("w-auto p-0", "z-[1001]")}>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                 <Button variant="outline" className="mt-auto" onClick={() => handleApplyToAll(activeKey)} disabled={typeof activeKey !== 'number'}>
                                    <Copy className="mr-2 h-4 w-4" /> Apply to All Weekdays
                                </Button>
                            </div>
                            <div className="w-3/4 flex flex-col gap-4">
                                <h3 className="text-xl font-bold font-heading">{getActiveKeyTitle()}</h3>
                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-4">
                                    {activeDaySubjects.length > 0 ? activeDaySubjects.map(subject => (
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
                                                            const daySubjects = [...(timetable[activeKey] || [])];
                                                            const subIndex = daySubjects.findIndex(s => s.id === subject.id);
                                                            if (subIndex !== -1) {
                                                                daySubjects[subIndex].name = editingSubject.name;
                                                                updateTimetable(activeKey, daySubjects);
                                                            }
                                                            setEditingSubject(null);
                                                        }}><Check className="h-4 w-4"/></Button>
                                                    ) : (
                                                        <Button size="icon" variant="ghost" onClick={() => setEditingSubject({key: activeKey, subjectId: subject.id, name: subject.name})}><Edit className="h-4 w-4"/></Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteSubject(activeKey, subject.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
                                                                        const daySubjects = [...(timetable[activeKey] || [])];
                                                                        const subIndex = daySubjects.findIndex(s => s.id === subject.id);
                                                                        if (subIndex !== -1) {
                                                                            const taskIndex = daySubjects[subIndex].tasks.findIndex(t => t.id === task.id);
                                                                            daySubjects[subIndex].tasks[taskIndex].label = editingTask.label;
                                                                            updateTimetable(activeKey, daySubjects);
                                                                        }
                                                                        setEditingTask(null);
                                                                    }}><Check className="h-4 w-4"/></Button>
                                                                ) : (
                                                                    <Button size="icon" variant="ghost" onClick={() => setEditingTask({key: activeKey, subjectId: subject.id, taskId: task.id, label: task.label})}><Edit className="h-4 w-4"/></Button>
                                                                )}
                                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(activeKey, subject.id, task.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddTask(activeKey, subject.id)}>
                                                        <Plus className="mr-2 h-4 w-4"/> Add Task
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <div className="text-center text-muted-foreground pt-10">
                                            <p>No schedule set for this day.</p>
                                            <p>Add a subject to get started.</p>
                                        </div>
                                    )}
                                    </div>
                                </ScrollArea>
                                <Button className="w-full" onClick={() => handleAddSubject(activeKey)}>
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
