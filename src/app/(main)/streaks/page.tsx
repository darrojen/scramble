// 'use client';

// import { useEffect, useState } from 'react';
// import { Zap, X } from 'lucide-react';
// import { motion, useAnimation } from 'framer-motion';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import { useTheme } from 'next-themes';

// // Define interface for streak data
// interface StreakData {
//   user_id: string;
//   current_streak: number;
//   longest_streak: number;
//   last_active: string;
//   streak_freezes: number;
// }

// export default function Streaks() {
//   const [streakData, setStreakData] = useState<StreakData | null>(null);
//   const router = useRouter();
//   const { theme } = useTheme();
//   const controls = useAnimation();

//   // Animation for energy effect
//   useEffect(() => {
//     controls.start({
//       scale: [1, 1.25, 1],
//       opacity: [0.7, 1, 0.7],
//       transition: {
//         duration: 1.6,
//         repeat: Infinity,
//         ease: 'easeInOut',
//       },
//     });
//   }, [controls]);

//   // Fetch streak data
//   useEffect(() => {
//     async function fetchStreak() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/login');
//         return;
//       }
//       const { data } = await supabase
//         .from('streaks')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();
//       setStreakData(data);
//     }
//     fetchStreak();
//   }, [router]);

//   if (!streakData) {
//     return <LoadingSpinner message="" />;
//   }

//   const currentStreak = streakData.current_streak;

//   // Weekly display logic
//   const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
//   const today = new Date();
//   const todayStr = today.toISOString().split('T')[0];
//   const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
//   const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
//   const monday = new Date(today);
//   monday.setDate(today.getDate() + offset);

//   const weekDates: string[] = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     weekDates.push(d.toISOString().split('T')[0]);
//   }

//   const streakStart = new Date(today);
//   streakStart.setDate(today.getDate() - (currentStreak - 1));
//   const streakStartStr = streakStart.toISOString().split('T')[0];

//   const isTodayFunc = (dateStr: string) => dateStr === todayStr;
//   const isPast = (dateStr: string) => new Date(dateStr) < today;
//   const isActive = (dateStr: string) => dateStr >= streakStartStr && dateStr <= todayStr;
//   const isFuture = (dateStr: string) => new Date(dateStr) > today;

//   // Define background gradient based on theme
//   const backgroundGradient = theme === 'dark'
//     ? 'linear-gradient(180deg, #1f2937 0%, #111827 50%)'
//     : theme === 'custom'
//     ? 'linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%)'
//     : 'linear-gradient(180deg, #bae6fd 0%, #f0f9ff 50%)';

//   // Define energy effect gradient based on theme
//   const energyGradient = theme === 'dark'
//     ? 'radial-gradient(circle, #374151 60%, #1f2937 100%)'
//     : theme === 'custom'
//     ? 'radial-gradient(circle, #dbeafe 60%, #bfdbfe 100%)'
//     : 'radial-gradient(circle, #e0f2fe 60%, #bae6fd 100%)';

//   return (
//     <motion.div
//       className="min-h-screen flex flex-col items-center justify-center p-4"
//       style={{ background: backgroundGradient }}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
//     >
//       {/* Energy effect + Icon */}
//       <motion.div
//         className="relative flex flex-col items-center mb-8 mt-8"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.4 }}
//       >
//         <motion.div
//           animate={controls}
//           className="absolute"
//           style={{
//             width: 160,
//             height: 160,
//             borderRadius: '50%',
//             background: energyGradient,
//             filter: 'blur(16px)',
//             zIndex: 0,
//           }}
//         />
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0, rotate: [0, 10, -10, 0] }}
//           transition={{
//             opacity: { duration: 0.8, ease: 'easeInOut', delay: 0.4 },
//             y: { duration: 0.8, ease: 'easeInOut', delay: 0.4 },
//             rotate: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
//           }}
//           className="z-10"
//         >
//           <Zap size={96} color="#d6e800" strokeWidth={2.5} className="drop-shadow-lg" />
//         </motion.div>
//       </motion.div>

//       {/* Streak Number */}
//       <motion.div
//         className="text-5xl font-extrabold mb-2"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.6 }}
//       >
//         {currentStreak}
//       </motion.div>
//       <motion.div
//         className="text-xl font-bold mb-6"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.8 }}
//       >
//         {currentStreak === 1
//           ? "You've started your streak!"
//           : `You've extended your streak to ${currentStreak} days!`}
//       </motion.div>
//       <motion.div
//         className="text-lg mb-12"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 1.0 }}
//       >
//         You earned 4 points!
//       </motion.div>

//       {/* Weekly Streak Tracker */}
//       <motion.div
//         className="flex items-center gap-4 mb-12"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 1.2 }}
//       >
//         {dayLabels.map((label, idx) => {
//           const dateStr = weekDates[idx];
//           const isTod = isTodayFunc(dateStr);
//           const active = isActive(dateStr);
//           const past = isPast(dateStr);
//           const future = isFuture(dateStr);
//           return (
//             <div
//               key={idx}
//               className={`flex flex-col items-center ${isTod ? 'font-bold' : ''} ${future ? 'opacity-30' : ''}`}
//             >
//               <div
//                 className={`rounded-full flex items-center justify-center border-2 ${isTod ? 'w-12 h-12' : 'w-10 h-10'}`}
//                 style={{
//                   background: active ? '#bef264' : past ? '#e5e7eb' : 'transparent',
//                   borderColor: active ? '#a3e635' : '#d1d5db',
//                 }}
//               >
//                 {active ? <Zap size={isTod ? 28 : 24} color="#22c55e" /> : past ? <X size={isTod ? 28 : 24} color="#ef4444" /> : null}
//               </div>
//               <span className={`mt-1 font-semibold ${isTod ? 'text-base' : 'text-sm'}`}>
//                 {label}
//               </span>
//             </div>
//           );
//         })}
//       </motion.div>

//       {/* Continue Button */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut', delay: 1.4 }}
//       >
//         <Button
//           className="w-80 py-4 rounded-full text-lg font-semibold transition"
//           style={{
//             background: 'linear-gradient(to right, #3b82f6, #2563eb)',
//             color: '#ffffff',
//           }}
//           onClick={() => router.push('/quiz/result')}
//         >
//           Continue to Results
//         </Button>
//       </motion.div>
//     </motion.div>
//   );
// }


'use client';

import { ArrowLeft, ArrowRight, CircleAlert, Home } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import Box from '@/components/ui/box';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import PreviewQuestion from '@/features/quiz/components/PreviewQuestion';
import { Question } from '@/lib/types';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function Preview() {
  const { questions, userAnswers, setUserAnswers, currentSubject } = useContext(QuizContext);
  const router = useRouter();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [ready, setReady] = useState(false);

  // Initialize userAnswers in localStorage
  useEffect(() => {
    if (!questions || Object.keys(questions).length === 0) return;

    const storedAnswers = localStorage.getItem('userAnswers');
    if (storedAnswers) {
      try {
        setUserAnswers(JSON.parse(storedAnswers));
      } catch (err) {
        console.error('Error parsing userAnswers from localStorage:', err);
        toast.error('Failed to load previous answers');
      }
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
    return <LoadingSpinner message="Loading preview..." />;
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
    router.push('/dashboard');
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Box
          as="div"
          className={`p-6 sm:p-8 rounded-2xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
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
              <Box
                as="div"
                className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 font-medium shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
              >
                <CircleAlert className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Not Answered</span>
              </Box>
            )}

            <PreviewQuestion
              question={currentQuestion}
              userAnswer={currentQuestion.userAnswer}
            />
          </motion.div>

          <Box as="div" className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 w-5 h-5" /> Previous
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={currentIndex === subjectQuestions.length - 1}
              className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition w-full sm:w-auto"
            >
              Next <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </Box>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
            <Button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg transition-all duration-300 shadow-md"
            >
              <Home className="mr-2 w-5 h-5" /> Back to Home
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </div>
  );
}