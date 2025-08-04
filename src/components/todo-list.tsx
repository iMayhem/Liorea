// src/components/todo-list.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ListTodo, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { suggestTask } from '@/ai/flows/suggest-task-flow';

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

export function TodoList() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAddTask = async () => {
        setIsLoading(true);
        try {
            const suggestedTaskText = await suggestTask();
            const newTask: Task = {
                id: Date.now(),
                text: suggestedTaskText,
                completed: false,
            };
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Failed to get suggestion from AI", error);
            // Optionally, show an error toast to the user
        } finally {
            setIsLoading(false);
        }
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
                    Let AI suggest a task or add your own.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2 mb-4">
                    <Input 
                        type="text" 
                        placeholder="Let Gemini suggest a task..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                                if (inputValue.trim()) {
                                    setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }]);
                                    setInputValue('');
                                } else {
                                    handleAddTask();
                                }
                            }
                        }}
                    />
                    <Button onClick={handleAddTask} disabled={isLoading}>
                         {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Suggest
                    </Button>
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
