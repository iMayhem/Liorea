// src/app/practice/generated/[quizId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter, notFound } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bookmark, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { Question, QuizProgress, GeneratedQuizData } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getQuizProgress, saveQuizAttempt, toggleBookmark, resetQuizProgress } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const QUIZ_TYPE = 'generated';

// This is a simplified version of the main practice page, adapted for generated quizzes.
export default function GeneratedQuizPage({ params }: { params: { quizId: string } }) {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const { quizId } = params;
    
    const [quizData, setQuizData] = React.useState<GeneratedQuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
    const [answered, setAnswered] = React.useState(false);
    const [progress, setProgress] = React.useState<QuizProgress | null>(null);

    // This effect handles fetching the generated quiz data from Firestore.
    React.useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            setLoading(true);
            const docRef = doc(db, 'generatedQuizzes', quizId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as GeneratedQuizData;
                setQuizData(data);
                // For generated quizzes, subject and chapter slugs will be the quizId itself for progress tracking
                if(profile?.username) {
                   const userProgress = await getQuizProgress(profile.username, QUIZ_TYPE);
                   setProgress(userProgress[quizId]?.[quizId] || {});
                }
            } else {
                notFound();
            }
            setLoading(false);
        };

        fetchQuiz();
    }, [quizId, profile]);
    
    // This effect updates the UI state based on loaded progress for the current question
    React.useEffect(() => {
        if (!progress || !quizData?.questions.length || currentQuestionIndex >= quizData.questions.length) return;
        
        const currentQuestion = quizData.questions[currentQuestionIndex];
        const savedAttempt = progress[currentQuestion.questionNumber];

        if (savedAttempt?.selected) {
            setSelectedAnswer(savedAttempt.selected);
            setAnswered(true);
        } else {
            setSelectedAnswer(null);
            setAnswered(false);
        }
    }, [currentQuestionIndex, progress, quizData]);

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    if (!quizData) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const { questions, title } = quizData;
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswer = async (optionKey: string) => {
        if (answered || !user || !profile?.username) return;
        
        const isCorrect = optionKey === currentQuestion.correctAnswer;
        
        setSelectedAnswer(optionKey);
        setAnswered(true);

        try {
            await saveQuizAttempt(profile.username, quizId, quizId, QUIZ_TYPE, currentQuestion.questionNumber, optionKey, isCorrect);
            setProgress(prev => ({
                ...prev,
                [currentQuestion.questionNumber]: { ...prev?.[currentQuestion.questionNumber], selected: optionKey, isCorrect }
            }));
        } catch (error) {
            console.error("Failed to save attempt:", error);
            toast({ title: "Error", description: "Could not save your answer.", variant: "destructive" });
            setSelectedAnswer(null);
            setAnswered(false);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            router.push(`/practice`);
            return;
        }
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
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

  if (!questions.length || !currentQuestion) {
     return (
        <>
            <AppHeader />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl font-bold font-heading mt-12">Quiz Generation Failed</h1>
                    <p className="text-muted-foreground mt-4 text-lg">The AI could not find any questions in the provided PDF.</p>
                     <Button asChild className="mt-8">
                        <Link href="/practice/upload">
                            Try another PDF
                        </Link>
                    </Button>
                </motion.div>
            </main>
        </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto mb-6">
            <CardContent className="p-4">
                 <div className="flex justify-between items-center mb-4">
                     <p className="text-sm font-medium text-muted-foreground"></p>
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-2 pb-4">
                        {questions.map((q, index) => {
                             const qProgress = progress?.[q.questionNumber];
                             const isAnswered = qProgress?.selected;
                             const isCorrect = qProgress?.isCorrect;
                             
                            return (
                                <Button
                                    key={q.questionNumber}
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleJumpToQuestion(index)}
                                    className={cn(
                                        "h-10 w-10 relative",
                                        {
                                            "border-primary text-primary": index === currentQuestionIndex,
                                            "bg-green-700 text-white hover:bg-green-800": isAnswered && isCorrect,
                                            "bg-red-700 text-white hover:bg-red-800": isAnswered && !isCorrect,
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
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5}}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardDescription>
                    Question {currentQuestion.questionNumber} of {questions.length}
                </CardDescription>
               <CardTitle>{title}</CardTitle>
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
                    <div/>
                    <div className="flex gap-2">
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
