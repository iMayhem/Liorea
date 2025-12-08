import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/context/NotificationContext';
import { BackgroundProvider } from '@/context/BackgroundContext';

export const metadata: Metadata = {
  title: 'Liorea',
  description: 'Your personalized virtual workspace for focus and productivity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📖</text></svg>" />
      </head>
      <body className="font-body antialiased">
        <BackgroundProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </BackgroundProvider>
        <Toaster />
      </body>
    </html>
  );
}
