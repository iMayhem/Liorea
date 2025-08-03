// src/app/practice/[subject]/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { practiceData } from '@/lib/practice-data';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const { subject: subjectSlug } = params;
  const subject = practiceData.find((s) => s.slug === subjectSlug);

  if (!subject) {
    notFound();
  }

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
            <h1 className="text-4xl font-bold font-heading">{subject.name}</h1>
            <p className="text-muted-foreground mt-2">
              Select a chapter to begin.
            </p>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Chapters</CardTitle>
                <CardDescription>Select from the list below.</CardDescription>
            </CardHeader>
            <ScrollArea className="h-96">
                <CardContent>
                    <ul className="space-y-2 p-4 pt-0">
                        {subject.chapters.map((chapter) => (
                        <li key={chapter.slug}>
                            <Link href={`/practice/${subject.slug}/${chapter.slug}`} className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors duration-200">
                                <span className="font-medium">{chapter.name}</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </li>
                        ))}
                    </ul>
                </CardContent>
            </ScrollArea>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
