// src/app/layout.tsx
import type {Metadata} from 'next';
import {Inter, Space_Grotesk} from 'next/font/google';
import './globals.css';
import { BackgroundProvider } from '@/hooks/use-background';
import { AppBody } from '@/components/app-body';


const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Liorea',
  description: 'Track your studies with your partner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={fontHeading.variable}
      >
        <BackgroundProvider>
          <AppBody>{children}</AppBody>
        </BackgroundProvider>
      </body>
    </html>
  );
}
