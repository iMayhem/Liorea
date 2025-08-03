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
import { nlmQuestions } from '@/lib/quiz-data';
import type { Question } from '@/lib/types';
import { practiceData } from '@/lib/practice-data';


export default function PracticeQuestionPage({ params }: { params: { subject: string; chapter: string; type: string } }) {
    const subject = practiceData.find((s) => s.slug === params.subject);
    const chapter = subject?.chapters.find((c) => c.slug === params.chapter);

    if (!subject || !chapter || params.type !== 'topic-wise-questions' || chapter.slug !== 'newtons-laws-of-motion') {
         // This page is currently only for NLM Topic Wise Questions
         return <ComingSoonPage subject={subject?.name} chapter={chapter?.name} />;
    }


  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [answered, setAnswered] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // For now, we only have NLM questions
    if (chapter.slug === 'newtons-laws-of-motion') {
        setQuestions(nlmQuestions);
    }
    setLoading(false);
  }, [chapter]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (optionKey: string) => {
    if (answered) return;
    setSelectedAnswer(optionKey);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion && answered) {
      router.push('/');
      return;
    }
    setAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mt-8">No Questions Found</h1>
          <p className="text-muted-foreground">
            Could not find any practice questions for this chapter.
          </p>
        </div>
      </>
    );
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
                {chapter.name} - Practice
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
                      layout="fill"
                      objectFit="contain"
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
                              'bg-green-500 text-white hover:bg-green-600':
                                answered && isCorrect,
                              'bg-red-500 text-white hover:bg-red-600':
                                answered && isSelected && !isCorrect,
                              'border-green-500 border-2':
                                answered && isCorrect && !isSelected,
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
