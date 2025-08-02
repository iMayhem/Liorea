import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'NEET Trackr',
  description: 'Track your NEET preparation with your partner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
