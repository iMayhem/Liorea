// src/app/practice/[subject]/[chapter]/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { practiceData } from '@/lib/practice-data';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChapterPage({ params: { subject: subjectSlug, chapter: chapterSlug } }: { params: { subject: string; chapter: string } }) {
  const subject = practiceData.find((s) => s.slug === subjectSlug);
  const chapter = subject?.chapters.find((c) => c.slug === chapterSlug);

  if (!subject || !chapter) {
    notFound();
  }

  const practiceTypes = [
    { name: 'Topic Wise Questions', slug: 'topic-wise-questions', description: 'Practice questions focused on specific topics within the chapter.' },
    { name: 'NEET Ranker\'s Stuff', slug: 'neet-rankers-stuff', description: 'Challenging questions designed to test in-depth knowledge.' },
    { name: 'NEET Flashback', slug: 'neet-flashback', description: 'Previous years\' questions from NEET exams.' },
  ];

  return (
    <>
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-heading">{chapter.name}</h1>
            <p className="text-muted-foreground mt-2">
              Select a practice type.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {practiceTypes.map((type) => (
              <motion.div
                key={type.slug}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link href={`/practice/${subject.slug}/${chapter.slug}/${type.slug}`} className="block">
                  <Card className="h-full hover:border-primary transition-colors duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {type.name}
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{type.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}
