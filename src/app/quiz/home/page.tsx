'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
import SubmitButton from '@/features/quiz/components/SubmitButton';
import Timer from '@/features/quiz/components/Timer';
import NavigationButtons from '@/features/quiz/components/NavigationButtons';

export default function Quiz() {
  const {
    questions,
    totalTime,
    isSubmitted,
    setIsSubmitted,
    currentSubject,
    currentIndices,
  } = useContext(QuizContext);

  const router = useRouter();

  useEffect(() => {
    if (isSubmitted) {
      router.push('/quiz/result');
    }
  }, [isSubmitted, router]);

  if (Object.keys(questions).length === 0) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  const currentIndex = currentIndices[currentSubject] || 0;
  const totalQuestions = questions[currentSubject]?.length || 0;

  const capitalize = (str: string) =>
    str.replace('_', ' ').replace(/\b\w/, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-3xl w-full p-4 sm:p-6 md:p-8"
      >
        {/* Header: Quiz Title + Timer */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz in Progress</h1>
          <div className="flex items-center text-lg font-semibold">
            <Clock className="mr-2" />
            <Timer
              totalSeconds={totalTime}
              onTimeUp={() => setIsSubmitted(true)}
            />
          </div>
        </div>

        {/* Subject Switcher */}
        <SubjectSwitcher />

        {/* Question Number */}
        <h2 className="mt-4 mb-4 text-center text-lg sm:text-xl md:text-2xl font-semibold">
          Question ({currentIndex + 1}/{totalQuestions})
        </h2>

        {/* Question Display */}
        <QuestionDisplay />

        {/* Navigation + Submit */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <NavigationButtons />
          <SubmitButton />
        </div>
      </motion.div>
    </div>
  );
}
