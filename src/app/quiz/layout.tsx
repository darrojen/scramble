'use client';

import { MotionConfig } from 'framer-motion';
import '../globals.css';
import { QuizProvider } from '@/features/quiz/context/QuizContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning={true}>
        <QuizProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </QuizProvider>
      </body>
    </html>
  );
}
