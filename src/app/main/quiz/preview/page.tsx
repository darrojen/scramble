'use client';

import { ArrowLeft, ArrowRight, CircleAlert, Home } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';

import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import PreviewQuestion from '@/features/quiz/components/PreviewQuestion';
import { Question } from '@/lib/types';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Preview() {
  const {
    questions,
    userAnswers,
    setUserAnswers,
    currentSubject,
  } = useContext(QuizContext);

  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [ready, setReady] = useState(false);

  // Initialize userAnswers in localStorage
  useEffect(() => {
    if (!questions || Object.keys(questions).length === 0) return;

    const storedAnswers = localStorage.getItem('userAnswers');
    if (storedAnswers) {
      setUserAnswers(JSON.parse(storedAnswers));
    } else {
      const initAnswers: Record<string, number[]> = {};
      Object.keys(questions).forEach((subj) => {
        initAnswers[subj] = questions[subj].map(() => -1);
      });
      setUserAnswers(initAnswers);
      localStorage.setItem('userAnswers', JSON.stringify(initAnswers));
    }

    setReady(true);
  }, [questions, setUserAnswers]);

  // Sync localStorage whenever userAnswers change
  useEffect(() => {
    if (userAnswers) {
      localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    }
  }, [userAnswers]);

  // Wait until questions and answers are ready
  if (!ready || !questions[currentSubject] || !userAnswers) {
    return (
          <LoadingSpinner message="Loading..." />


    );
  }

  // Build subject-specific questions
  const subjectQuestions: (Question & {
    subject: string;
    userAnswer: number;
    questionIndex: number;
  })[] = questions[currentSubject].map((q, idx) => ({
    ...q,
    subject: currentSubject,
    userAnswer: userAnswers[currentSubject]?.[idx] ?? -1,
    questionIndex: idx,
  }));

  const currentQuestion = subjectQuestions[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < subjectQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGoHome = () => {
    localStorage.removeItem('userAnswers');
    setUserAnswers({});
    router.push('/main/dashboard');
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-2xl w-full"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Question Preview ({currentIndex + 1}/{subjectQuestions.length}) –{' '}
          {currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)}
        </h1>

        <SubjectSwitcher />

        <motion.div
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          key={`${currentSubject}-${currentIndex}`}
          className="relative"
        >
          {currentQuestion.userAnswer === -1 && (
            <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 font-medium shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              <CircleAlert className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Not Answered</span>
            </div>
          )}

          <PreviewQuestion
            question={currentQuestion}
            userAnswer={currentQuestion.userAnswer}
          />
        </motion.div>

        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center bg-gray-200 dark:bg-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
          >
            <ArrowLeft className="mr-2" /> Previous
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={currentIndex === subjectQuestions.length - 1}
            className="flex items-center bg-gray-200 dark:bg-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
          >
            Next <ArrowRight className="ml-2" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
          className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          <Home className="inline mr-2" /> Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
