"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalizedWorkspaceSuggestion, PersonalizedWorkspaceSuggestionInput } from '@/ai/flows/personalized-workspace-suggestion';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  task: z.string().min(2, { message: 'Please describe your task.' }),
  mood: z.string({ required_error: 'Please select your mood.' }),
  focusLevel: z.string({ required_error: 'Please select your desired focus level.' }),
});

type Suggestion = {
  soundscapeMixSuggestion: string;
};

export default function WorkspaceSuggester() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { task: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await personalizedWorkspaceSuggestion(values as PersonalizedWorkspaceSuggestionInput);
      setSuggestion(result);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a suggestion. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What are you working on?</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., studying, coding, writing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What's your current mood?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stressed">Stressed</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="motivated">Motivated</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="focusLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired focus level?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select focus level" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2 h-4 w-4" /> Get Suggestion</>}
          </Button>
        </form>
      </Form>

      {suggestion && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Your Personalized Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Soundscape Mix</h4>
              <p className="text-muted-foreground">{suggestion.soundscapeMixSuggestion}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
