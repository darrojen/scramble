'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import ResultDisplay from '@/features/quiz/components/ResultDisplay';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import { QuizContext } from '@/features/quiz/context/QuizContext';

interface ScoreResult {
  correct: number;
  total: number;
  percentage: number;
}

export default function Result() {
  const { calculateScores } = useContext(QuizContext);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [examType, setExamType] = useState<'WAEC' | 'NECO' | 'JAMB' | 'normal'>(
    'normal'
  );
  const router = useRouter();

  useEffect(() => {
    const result = calculateScores();
    setScore(result);

    // TODO: replace with real exam type source (e.g., context, query param, localStorage)
    setExamType('WAEC');

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [calculateScores]);

  if (loading || !score) {
    return <LoadingSpinner message="Preparing your results..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-bold mb-6 gradient-bg text-transparent bg-clip-text">
          Your Results
        </h1>
        <ResultDisplay score={score} examType={examType} />
        <div className="mt-8 space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/quiz/preview')}
            className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FileText className="mr-2" />
            Preview Incorrect Answers
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Home className="mr-2" />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
