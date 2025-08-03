// src/app/practice/[subject]/[chapter]/[type]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getQuestions } from '@/lib/get-questions';
import type { Question, QuizProgress } from '@/lib/types';
import { practiceData } from '@/lib/practice-data';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getQuizProgress, saveQuizAttempt, toggleBookmark } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


export default function PracticeQuestionPage({ params: paramsProp }: { params: { subject: string; chapter: string; type: string } }) {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    // In recent Next.js versions, params can be a promise. We use `React.use` to unwrap it.
    const params = React.use(paramsProp as any);

    const { subject: subjectSlug, chapter: chapterSlug, type: quizType } = params;
    const subject = practiceData.find((s) => s.slug === subjectSlug);
    const chapter = subject?.chapters.find((c) => c.slug === chapterSlug);

    const [questions, setQuestions] = React.useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
    const [answered, setAnswered] = React.useState(false);
    const [progress, setProgress] = React.useState<QuizProgress | null>(null);
    
    // This effect handles fetching questions and user progress.
    React.useEffect(() => {
        if (!user) return;

        async function loadData() {
            setLoading(true);
            
            const questionSet = await getQuestions(subjectSlug, chapterSlug, quizType);
            
            setQuestions(questionSet);

            if (questionSet.length > 0) {
                try {
                    const userProgress = await getQuizProgress(user.username, quizType);
                    setProgress(userProgress[subjectSlug]?.[chapterSlug] || {});
                } catch (error) {
                    console.error("Failed to fetch quiz progress:", error);
                    toast({ title: "Error", description: "Could not load your progress." });
                }
            }
            setLoading(false);
        }

        loadData();
    }, [user, subjectSlug, chapterSlug, quizType, toast]);
    
    // This effect updates the UI state based on loaded progress for the current question
    React.useEffect(() => {
        if (!progress || !questions.length || currentQuestionIndex >= questions.length) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const savedAttempt = progress[currentQuestion.questionNumber];

        if (savedAttempt?.selected) {
            setSelectedAnswer(savedAttempt.selected);
            setAnswered(true);
        } else {
            setSelectedAnswer(null);
            setAnswered(false);
        }
    }, [currentQuestionIndex, progress, questions]);

     const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    if (!subject || !chapter) {
         return <ComingSoonPage subject={subject?.name} chapter={chapter?.name} />;
    }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = async (optionKey: string) => {
    if (answered || !user) return;
    
    const isCorrect = optionKey === currentQuestion.correctAnswer;
    
    setSelectedAnswer(optionKey);
    setAnswered(true);

    try {
        await saveQuizAttempt(user.username, subjectSlug, chapterSlug, quizType, currentQuestion.questionNumber, optionKey, isCorrect);
        // Also update local progress state to re-render immediately
        setProgress(prev => ({
            ...prev,
            [currentQuestion.questionNumber]: { ...prev?.[currentQuestion.questionNumber], selected: optionKey, isCorrect }
        }));
    } catch (error) {
        console.error("Failed to save attempt:", error);
        toast({ title: "Error", description: "Could not save your answer. Please try again." });
         // Revert optimistic UI updates
        setSelectedAnswer(null);
        setAnswered(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      router.push(`/practice/${subjectSlug}/${chapterSlug}`);
      return;
    }
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };
  
  const handleBookmark = async () => {
    if(!user || !currentQuestion) return;

    const currentBookmarkState = progress?.[currentQuestion.questionNumber]?.bookmarked || false;
    const newBookmarkState = !currentBookmarkState;

    try {
        await toggleBookmark(user.username, subjectSlug, chapterSlug, quizType, currentQuestion.questionNumber, newBookmarkState);
        setProgress(prev => ({
            ...prev,
            [currentQuestion.questionNumber]: { ...prev?.[currentQuestion.questionNumber], bookmarked: newBookmarkState }
        }));
    } catch (error) {
        console.error("Failed to toggle bookmark:", error);
        toast({ title: "Error", description: "Could not update bookmark." });
    }
  };


  if (authLoading || loading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (!questions.length) {
     return <ComingSoonPage subject={subject?.name} chapter={chapter?.name} />;
  }

  if (!currentQuestion) {
    // This case handles when index might be out of bounds, though unlikely with current logic.
    return (
       <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-background">
           <p>Could not load question.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto mb-6">
            <CardHeader>
                <CardTitle>Question Navigator</CardTitle>
                <CardDescription>Jump to any question. Colors indicate status.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-2 pb-4">
                        {questions.map((q, index) => {
                             const qProgress = progress?.[q.questionNumber];
                             const isBookmarked = qProgress?.bookmarked;
                             const isAnswered = qProgress?.selected;
                             const isCorrect = qProgress?.isCorrect;
                             
                            return (
                                <Button
                                    key={q.questionNumber}
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleJumpToQuestion(index)}
                                    className={cn(
                                        "h-10 w-10",
                                        {
                                            "border-primary text-primary": index === currentQuestionIndex,
                                            "bg-green-700 text-white hover:bg-green-800": isAnswered && isCorrect,
                                            "bg-red-700 text-white hover:bg-red-800": isAnswered && !isCorrect,
                                            "bg-blue-600 text-white hover:bg-blue-700": isBookmarked && !(isAnswered && isCorrect) && !(isAnswered && !isCorrect),
                                            "bg-white text-black hover:bg-gray-200": isAnswered && !isCorrect && !isBookmarked, // Attempted but not bookmarked/correct/incorrect - might not be needed with current logic but good for fallback.
                                        }
                                    )}
                                >
                                    {q.questionNumber}
                                </Button>
                            );
                        })}
                    </div>
                     <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>

        <motion.div
          key={currentQuestionIndex}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                {chapter.name} - {quizType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </CardTitle>
              <CardDescription>
                Question {currentQuestion.questionNumber} of {questions.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg font-semibold mb-4 whitespace-pre-line">
                  {currentQuestion.questionText}
                </p>
                {currentQuestion.questionImageURL && (
                  <div className="mb-4 relative w-full h-64">
                    <Image
                      src={currentQuestion.questionImageURL}
                      alt={`Question ${currentQuestion.questionNumber} diagram`}
                      fill={true}
                      style={{objectFit: 'contain'}}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentQuestion.options).map(
                    ([key, value]) => {
                      const isCorrect = key === currentQuestion.correctAnswer;
                      const isSelected = key === selectedAnswer;

                      return (
                        <Button
                          key={key}
                          onClick={() => handleAnswer(key)}
                          disabled={answered}
                          className={cn(
                            'h-auto py-3 whitespace-normal justify-start text-left',
                            {
                              'bg-green-700 text-white hover:bg-green-800':
                                answered && isCorrect,
                              'bg-red-700 text-white hover:bg-red-800':
                                answered && isSelected && !isCorrect,
                               'border-green-500 border-2':
                                answered && isCorrect && !isSelected
                            }
                          )}
                          variant="outline"
                        >
                          <span className="font-bold mr-2">{key}.</span> {value}
                        </Button>
                      );
                    }
                  )}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <Button
                        onClick={handleBookmark}
                        variant="outline"
                        size="icon"
                        className={cn({ "bg-blue-600 text-white hover:bg-blue-700": progress?.[currentQuestion.questionNumber]?.bookmarked })}
                    >
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">Bookmark</span>
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={handleNext} variant="secondary">
                            Skip
                        </Button>
                        <Button onClick={handleNext} disabled={!answered}>
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                        </Button>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
}

function ComingSoonPage({subject, chapter}: {subject?: string, chapter?: string}) {
    return (
        <>
            <AppHeader />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold font-heading mt-12">Coming Soon!</h1>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Practice questions for <span className="font-semibold text-primary">{chapter || 'this chapter'}</span> in <span className="font-semibold text-primary">{subject || 'this subject'}</span> are being prepared.
                    </p>
                    <p className="mt-2 text-muted-foreground">Please check back later.</p>
                     <Button asChild className="mt-8">
                        <Link href="/practice">
                            Back to Practice Module
                        </Link>
                    </Button>
                </motion.div>
            </main>
        </>
    )
}
