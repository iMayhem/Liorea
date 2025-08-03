// src/app/practice/[subject]/[chapter]/[type]/page.tsx
'use client';

import * as React from 'react';
import { useRouter, notFound } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { nlmQuestions, nlmRankersQuestions } from '@/lib/quiz-data';
import type { Question, QuizProgress } from '@/lib/types';
import { practiceData } from '@/lib/practice-data';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getQuizProgress, saveQuizAttempt } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';


export default function PracticeQuestionPage({ params }: { params: { subject: string; chapter: string; type: string } }) {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

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
            
            let questionSet: Question[] = [];
            
            // This condition ensures we only load NLM questions for now
            if (subjectSlug === 'physics' && chapterSlug === 'newtons-laws-of-motion') {
                if (quizType === 'topic-wise-questions') {
                    questionSet = nlmQuestions;
                } else if (quizType === 'neet-rankers-stuff') {
                    questionSet = nlmRankersQuestions;
                }
            }
            
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

        if (savedAttempt) {
            setSelectedAnswer(savedAttempt.selected);
            setAnswered(true);
        } else {
            setSelectedAnswer(null);
            setAnswered(false);
        }
    }, [currentQuestionIndex, progress, questions]);


    if (!subject || !chapter || (chapter.slug === 'newtons-laws-of-motion' && !['topic-wise-questions', 'neet-rankers-stuff'].includes(quizType))) {
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
            [currentQuestion.questionNumber]: { selected: optionKey, isCorrect }
        }));
        toast({
            title: isCorrect ? "Correct!" : "Incorrect",
            description: isCorrect ? "Great job!" : `The correct answer is ${currentQuestion.correctAnswer}.`,
            variant: isCorrect ? 'default' : 'destructive',
        });
    } catch (error) {
        console.error("Failed to save attempt:", error);
        toast({ title: "Error", description: "Could not save your answer. Please try again." });
         // Revert optimistic UI updates
        setSelectedAnswer(null);
        setAnswered(false);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      router.push(`/practice/${subjectSlug}/${chapterSlug}`);
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
                Select the correct answer from the options below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Question #{currentQuestion.questionNumber}
                </h2>
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
                <div className="mt-6 text-right">
                  <Button onClick={handleNextQuestion} disabled={!answered}>
                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                  </Button>
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
