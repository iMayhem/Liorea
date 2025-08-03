// src/app/nlm-practice-questions/page.tsx
'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {db} from '@/lib/firebase';
import {collection, getDocs, query, where, limit} from 'firebase/firestore';
import {AppHeader} from '@/components/header';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {motion} from 'framer-motion';
import {cn} from '@/lib/utils';
import Image from 'next/image';

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  questionImageURL?: string;
  options: {[key: string]: string};
  correctAnswer: string;
}

export default function NlmPracticePage() {
  const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [answered, setAnswered] = React.useState(false);
  const [isLastQuestion, setIsLastQuestion] = React.useState(false);
  const router = useRouter();


  const fetchQuestionByNumber = React.useCallback(async (questionNumber: number) => {
    setLoading(true);
    try {
        const q = query(
            collection(db, 'nlm_questions'), 
            where('questionNumber', '==', questionNumber),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const questionData = { id: doc.id, ...doc.data() } as Question;
            setCurrentQuestion(questionData);

            // Check if this is the last question (assuming 119 questions)
            if (questionNumber === 119) {
              setIsLastQuestion(true);
            } else {
               // A more robust way to check if it's the last question
                const nextQ = query(
                    collection(db, 'nlm_questions'),
                    where('questionNumber', '==', questionNumber + 1),
                    limit(1)
                );
                const nextSnapshot = await getDocs(nextQ);
                setIsLastQuestion(nextSnapshot.empty);
            }

        } else if (questionNumber === 1) { 
            setCurrentQuestion(null);
        }
    } catch (error) {
        console.error('Error fetching question:', error);
        setCurrentQuestion(null);
    } finally {
        setLoading(false);
    }
  }, []);


  React.useEffect(() => {
    fetchQuestionByNumber(1);
  }, [fetchQuestionByNumber]);
  

  const handleAnswer = (optionKey: string) => {
    if (answered) return;
    setSelectedAnswer(optionKey);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
        router.push('/');
        return;
    }
    setAnswered(false);
    setSelectedAnswer(null);
    if(currentQuestion) {
        fetchQuestionByNumber(currentQuestion.questionNumber + 1);
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mt-8">No Questions Found</h1>
            <p className="text-muted-foreground">Could not find any practice questions for NLM in the 'nlm_questions' collection.</p>
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
              <div>
                  <h2 className="text-xl font-bold mb-2">Question #{currentQuestion.questionNumber}</h2>
                  <p className="text-lg font-semibold mb-4 whitespace-pre-line">{currentQuestion.questionText}</p>
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
                            className={cn('h-auto py-3 whitespace-normal justify-start text-left', 
                            {
                                'bg-green-500 text-white hover:bg-green-600': answered && isCorrect,
                                'bg-red-500 text-white hover:bg-red-600': answered && isSelected && !isCorrect,
                                'border-green-500 border-2': answered && isCorrect && !isSelected,
                             }
                            )}
                            variant="outline"
                          >
                           <span className="font-bold mr-2">{key}.</span> {value}
                          </Button>
                       );
                    })}
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
