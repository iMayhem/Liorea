// src/app/nlm-practice-questions/page.tsx
'use client';

import * as React from 'react';
import {db} from '@/lib/firebase';
import {collection, getDocs, query, where, DocumentData} from 'firebase/firestore';
import {AppHeader} from '@/components/header';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {motion} from 'framer-motion';
import {cn} from '@/lib/utils';
import Image from 'next/image';

interface Question extends DocumentData {
  id: string;
  questionText: string;
  questionImageURL?: string;
  options: {[key: string]: string};
  correctAnswer: string;
}

export default function NlmPracticePage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [answered, setAnswered] = React.useState(false);
  const [shownQuestionIds, setShownQuestionIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, 'quiz_questions'), where('chapter', '==', 'NLM'));
        const querySnapshot = await getDocs(q);
        const fetchedQuestions: Question[] = [];
        querySnapshot.forEach(doc => {
          fetchedQuestions.push({id: doc.id, ...doc.data()} as Question);
        });
        setQuestions(fetchedQuestions);
        if (fetchedQuestions.length > 0) {
          selectNewQuestion(fetchedQuestions, new Set());
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const selectNewQuestion = (questionSet: Question[], currentShownIds: Set<string>) => {
    const availableQuestions = questionSet.filter(q => !currentShownIds.has(q.id));
    if (availableQuestions.length === 0) {
        // All questions have been shown, reset.
        setShownQuestionIds(new Set());
        const newQuestion = questionSet[Math.floor(Math.random() * questionSet.length)];
        setCurrentQuestion(newQuestion);
        setShownQuestionIds(prev => new Set(prev).add(newQuestion.id));
        return;
    }
    const newQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(newQuestion);
    setShownQuestionIds(prev => new Set(prev).add(newQuestion.id));
  };

  const handleAnswer = (optionKey: string) => {
    if (answered) return;
    setSelectedAnswer(optionKey);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    selectNewQuestion(questions, shownQuestionIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mt-8">No Questions Found</h1>
            <p className="text-muted-foreground">Could not find any practice questions for NLM.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Newton's Laws of Motion (NLM) - Practice</CardTitle>
              <CardDescription>Select the correct answer from the options below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion ? (
                <div>
                  <p className="text-lg font-semibold mb-4">{currentQuestion.questionText}</p>
                  {currentQuestion.questionImageURL && (
                    <div className="mb-4 relative w-full h-64">
                         <Image src={currentQuestion.questionImageURL} alt="Question diagram" layout="fill" objectFit="contain" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentQuestion.options).map(([key, value]) => {
                       const isCorrect = key === currentQuestion.correctAnswer;
                       const isSelected = key === selectedAnswer;

                       return (
                          <Button
                            key={key}
                            onClick={() => handleAnswer(key)}
                            disabled={answered}
                            className={cn('h-auto py-3 whitespace-normal justify-start text-left', {
                                'bg-green-600 hover:bg-green-700 text-white': answered && isCorrect,
                                'bg-red-600 hover:bg-red-700 text-white': answered && isSelected && !isCorrect,
                                'border-green-600 border-2': answered && isCorrect && !isSelected
                            })}
                            variant="outline"
                          >
                           <span className="font-bold mr-2">{key}.</span> {value}
                          </Button>
                       );
                    })}
                  </div>
                   <div className="mt-6 text-right">
                        <Button onClick={handleNextQuestion} disabled={!answered}>
                            Next Question
                        </Button>
                   </div>
                </div>
              ) : (
                <p>No question loaded.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
