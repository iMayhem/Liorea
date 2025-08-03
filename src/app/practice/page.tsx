// src/app/practice/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { practiceData } from '@/lib/practice-data';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PracticePage() {
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
            <h1 className="text-4xl font-bold font-heading">Practice Module</h1>
            <p className="text-muted-foreground mt-2">
              Select a subject to start practicing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {practiceData.map((subject) => (
              <motion.div
                key={subject.slug}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link href={`/practice/${subject.slug}`} className="block">
                  <Card className="h-full hover:border-primary transition-colors duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {subject.name}
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        {subject.chapters.length} chapters
                      </CardDescription>
                    </CardHeader>
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
