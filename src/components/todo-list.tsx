// src/components/todo-list.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

export function TodoList() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [inputValue, setInputValue] = React.useState('');

    const handleAddTask = () => {
        if (inputValue.trim() === '') return;
        const newTask: Task = {
            id: Date.now(),
            text: inputValue,
            completed: false,
        };
        setTasks([...tasks, newTask]);
        setInputValue('');
    };

    const handleToggleTask = (id: number) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleDeleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <Card className="w-full max-w-md shadow-lg bg-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ListTodo className="mr-2 h-6 w-6" />
                    Session To-Do List
                </CardTitle>
                <CardDescription>
                    List your goals for this study session.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2 mb-4">
                    <Input 
                        type="text" 
                        placeholder="e.g., Read chapter 4" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <Button onClick={handleAddTask}>Add</Button>
                </div>
                <div className="space-y-2">
                    <AnimatePresence>
                        {tasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                            >
                                <div className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={`task-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => handleToggleTask(task.id)}
                                    />
                                    <label
                                        htmlFor={`task-${task.id}`}
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                    >
                                        {task.text}
                                    </label>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="h-7 w-7">
                                    <X className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
