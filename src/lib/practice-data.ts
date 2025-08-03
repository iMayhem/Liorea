// src/lib/practice-data.ts

export interface Chapter {
    name: string;
    slug: string;
}

export interface Subject {
    name: string;
    slug: string;
    chapters: Chapter[];
}

export const practiceData: Subject[] = [
    {
        name: 'Physics',
        slug: 'physics',
        chapters: [
            { name: "Newton's Laws of Motion", slug: 'newtons-laws-of-motion' },
            { name: 'Electrostatics', slug: 'electrostatics' },
        ],
    },
    {
        name: 'Chemistry',
        slug: 'chemistry',
        chapters: [
            { name: 'Periodic Table', slug: 'periodic-table' },
            { name: 'Isomerism', slug: 'isomerism' },
        ],
    },
    {
        name: 'Biology',
        slug: 'biology',
        chapters: [
            { name: 'Molecular Basis of Inheritance', slug: 'molecular-basis-of-inheritance' },
            { name: 'Locomotion and Movement', slug: 'locomotion-and-movement' },
        ],
    },
];
