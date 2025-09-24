// 'use client';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import {BronzeCelebration, GoldCelebration} from '@/app/main/leagueBadge/page';
// import { Calculator, Loader2 } from 'lucide-react';
// import {
//   DiamondCelebration,
//   PalladiumCelebration,
//   PlatinumCelebration,
//   SilverCelebration,
// } from '@/app/main/leagueBadge/page';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import { useContext, useEffect, useState } from 'react';

// import Box from '@/components/ui/box';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import { QuizScoreRow } from '@/lib/types';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import Timer from '@/features/quiz/components/Timer';
// import { motion } from 'framer-motion';
// import { supabase } from '@/lib/supabaseClient';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// // Calculate points for quiz performance
// const calcPoints = (
//   percentage: number,
//   totalQuestions: number,
//   totalSubjects: number,
//   timeTaken: number,
//   totalTime: number,
//   streak: number
// ) => {
//   let basePoints = 0;
//   if (percentage >= 90) basePoints = 10;
//   else if (percentage >= 70) basePoints = 8;
//   else if (percentage >= 50) basePoints = 6;
//   else if (percentage >= 30) basePoints = 4;
//   else if (percentage >= 10) basePoints = 2;

//   const timeFactor = totalTime > 0 ? 1 - timeTaken / totalTime : 1;
//   const questionFactor = Math.min(totalQuestions / 20, 1);
//   const subjectFactor = Math.min(totalSubjects / 5, 1);
//   const streakBonus = Math.floor(streak / 5) * 2;

//   return Math.max(1, Math.round(basePoints * timeFactor * questionFactor * subjectFactor) + streakBonus);
// };

// // Calculate points for streak completion
// const calcStreakPoints = (currentStreak: number) => {
//   const milestones = [
//     { days: 7, points: 5 },
//     { days: 30, points: 15 },
//     { days: 100, points: 50 },
//   ];
//   return milestones.find(m => m.days === currentStreak)?.points || 0;
// };

// // Update streak and award points
// async function updateStreak(userId: string) {
//   try {
//     const today = new Date().toISOString().split('T')[0];

//     const { data: streakData, error: fetchError } = await supabase
//       .from('streaks')
//       .select('current_streak, longest_streak, last_active, streak_freezes')
//       .eq('user_id', userId)
//       .single();

//     if (fetchError && fetchError.code !== 'PGRST116') {
//       console.error('Error fetching streak:', fetchError.message);
//       toast.error('Failed to update streak');
//       return;
//     }

//     let currentStreak = 1;
//     let longestStreak = 1;
//     let streakFreezes = 0;

//     if (streakData) {
//       const lastDate = new Date(streakData.last_active);
//       const todayDate = new Date(today);
//       const diffTime = todayDate.getTime() - lastDate.getTime();
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       streakFreezes = streakData.streak_freezes || 0;

//       if (diffDays === 1) {
//         currentStreak = streakData.current_streak + 1;
//       } else if (diffDays === 2 && streakFreezes > 0) {
//         currentStreak = streakData.current_streak + 1;
//         streakFreezes -= 1;
//       } else if (diffDays === 0) {
//         console.log('Already completed today, no streak update.');
//         return;
//       } else {
//         currentStreak = 1;
//       }

//       longestStreak = Math.max(streakData.longest_streak || 0, currentStreak);
//     }

//     const { error: updateError } = await supabase
//       .from('streaks')
//       .upsert({
//         user_id: userId,
//         current_streak: currentStreak,
//         longest_streak: longestStreak,
//         last_active: today,
//         streak_freezes: streakFreezes,
//       });

//     if (updateError) {
//       console.error('Error updating streak:', updateError.message);
//       toast.error('Failed to update streak');
//       return;
//     }

//     // Award points for streak completion
//     const streakPoints = calcStreakPoints(currentStreak);
//     if (streakPoints > 0) {
//       const { error: scoreError } = await supabase
//         .from('quiz_scores')
//         .insert({
//           student_id: userId,
//           quiz_id: 'streak_reward',
//           points: streakPoints,
//           taken_at: new Date().toISOString(),
//           exam_type: 'streak',
//         });

//       if (scoreError) {
//         console.error('Error awarding streak points:', scoreError.message);
//         toast.error('Failed to award streak points');
//       } else {
//         toast.success(`Awarded ${streakPoints} points for ${currentStreak}-day streak!`);
//       }
//     }

//     // Send milestone notifications
//     const milestones = [7, 30, 100];
//     if (milestones.includes(currentStreak)) {
//       const { error: notificationError } = await supabase
//         .from('notifications')
//         .insert({
//           user_id: userId,
//           type: 'streak_milestone',
//           message: `Congrats on your ${currentStreak} day streak! You earned ${streakPoints} points! 🔥`,
//           status: 'pending',
//         });

//       if (notificationError) {
//         console.error('Error sending milestone notification:', notificationError.message);
//       } else {
//         console.log('Milestone notification sent for', currentStreak, 'days streak.');
//       }
//     }

//     console.log('Streak updated successfully:', { currentStreak, longestStreak });
//   } catch (err) {
//     console.error('Unexpected error updating streak:', err);
//     toast.error('An unexpected error occurred');
//   }
// }

// export default function Quiz() {
//   const {
//     questions,
//     totalTime,
//     isSubmitted,
//     setIsSubmitted,
//     currentSubject,
//     currentIndices,
//     setCurrentIndices,
//     userAnswers,
//     examType,
//     isStarting,
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);
//   const [timeTaken, setTimeTaken] = useState(0);
//   const [questionStartTime, setQuestionStartTime] = useState(Date.now());

//   const currentIndex = currentIndices[currentSubject] ?? 0;
//   const totalQuestions = questions[currentSubject]?.length ?? 0;

//   useEffect(() => {
//     setQuestionStartTime(Date.now());
//   }, [currentIndex, currentSubject]);

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const leagueThresholds = [
//     { name: 'Palladium', min: 0, column: 'celebrated_palladium', component: PalladiumCelebration },
//     { name: 'Bronze', min: 900, column: 'celebrated_bronze', component: BronzeCelebration },
//     { name: 'Silver', min: 1300, column: 'celebrated_silver', component: SilverCelebration },
//     { name: 'Gold', min: 5300, column: 'celebrated_gold', component: GoldCelebration },
//     { name: 'Platinum', min: 13300, column: 'celebrated_platinum', component: PlatinumCelebration },
//     { name: 'Diamond', min: 27300, column: 'celebrated_diamond', component: DiamondCelebration },
//   ];

//   // Handle quiz submission
//   useEffect(() => {
//     if (!isSubmitted) return;
//     const handleQuizSubmission = async () => {
//       try {
//         setSaving(true);
//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) {
//           console.error('No user authenticated.');
//           toast.error('You must be logged in to submit a quiz');
//           return;
//         }

//         const answers = userAnswers[currentSubject] ?? [];
//         const totalQ = questions[currentSubject]?.length ?? 0;
//         const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const totalSubjects = Object.keys(questions).length;

//         // Fetch current streak
//         const { data: streakData } = await supabase
//           .from('streaks')
//           .select('current_streak')
//           .eq('user_id', user.id)
//           .single();

//         const currentStreak = streakData?.current_streak || 0;

//         const newPoints = calcPoints(percentage, totalQ, totalSubjects, timeTaken, totalTime, currentStreak);

//         const { data: existingData } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         let scoreId: number;
//         if (existingData) {
//           const { error } = await supabase
//             .from('quiz_scores')
//             .update({
//               points: existingData.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existingData.id);
//           if (error) {
//             console.error('Error updating quiz score:', error.message);
//             toast.error('Failed to update quiz score');
//             return;
//           }
//           scoreId = existingData.id;
//         } else {
//           const { data: inserted, error } = await supabase
//             .from('quiz_scores')
//             .insert({
//               student_id: user.id,
//               quiz_id: currentSubject,
//               points: newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .select('id')
//             .single();
//           if (error || !inserted) {
//             console.error('Error inserting quiz score:', error?.message);
//             toast.error('Failed to save quiz score');
//             return;
//           }
//           scoreId = inserted.id;
//         }

//         // Update streak and award points
//         await updateStreak(user.id);

//         const { data: prevSubmission } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .order('taken_at', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (!prevSubmission) {
//           router.push('/main/quiz/result');
//           return;
//         }

//         const totalPoints = prevSubmission.points;
//         const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);

//         if (!league) {
//           router.push('/main/quiz/result');
//           return;
//         }

//         const hasCelebrated = prevSubmission[league.column as keyof QuizScoreRow] ?? false;

//         if (!hasCelebrated) {
//           setCurrentLeague(league.name);
//           await supabase
//             .from('quiz_scores')
//             .update({ [league.column]: true })
//             .eq('id', prevSubmission.id);
//         } else {
//           router.push('/main/quiz/result');
//         }
//       } catch (err) {
//         console.error('Error handling quiz submission:', err);
//         toast.error('An unexpected error occurred');
//       } finally {
//         setSaving(false);
//       }
//     };
//     handleQuizSubmission();
//   }, [isSubmitted]);

//   // Auto-submit if user leaves tab/window
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden && !isSubmitted) setIsSubmitted(true);
//     };
//     const handleBlur = () => {
//       if (!isSubmitted) setIsSubmitted(true);
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('blur', handleBlur);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('blur', handleBlur);
//     };
//   }, [isSubmitted, setIsSubmitted]);

//   if (isStarting) {
//     return <LoadingSpinner message="" />;
//   }

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="" />;
//   }

//   const leagueObj = leagueThresholds.find((l) => l.name === currentLeague);
//   const CelebrationComp = leagueObj?.component;
//   if (CelebrationComp) {
//     return (
//       <CelebrationComp
//         onClose={() => {
//           setCurrentLeague(null);
//           router.push('/main/quiz/result');
//         }}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="card max-w-3xl w-full p-4 sm:p-6 md:p-8"
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//                   <Timer
//           totalSeconds={totalTime}
//           onTick={(elapsed: number) => setTimeTaken(elapsed)} // typed correctly
//           onTimeUp={() => setIsSubmitted(true)}
//         />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button className="cursor-pointer" variant="default" size="icon">
//                   <Calculator className="w-5 h-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="right" className="w-72">
//                 <SheetHeader>
//                   <SheetTitle>Calculator</SheetTitle>
//                 </SheetHeader>
//                 <CalculatorComponent />
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>

//         <SubjectSwitcher />

//         <h2 className="mt-4 mb-4 text-center text-lg sm:text-xl md:text-2xl font-semibold">
//           Question ({currentIndex + 1}/{totalQuestions})
//         </h2>

//         <QuestionDisplay />

//         {/* Navigator */}
//         <Box as="div" className="mt-6">
//           <div className="flex flex-wrap justify-center gap-2">
//             {questions[currentSubject]?.map((_, idx) => {
//               const isAnswered = userAnswers[currentSubject]?.[idx] !== -1;
//               const isCurrent = currentIndex === idx;
//               return (
//                 <div
//                   key={idx}
//                   className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer
//                     border transition-colors duration-200
//                     ${isAnswered ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-gray-300'}
//                     ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
//                   onClick={() => jumpToQuestion(idx)}
//                 >
//                   {idx + 1}
//                 </div>
//               );
//             })}
//           </div>
//         </Box>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex cursor-pointer items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

//       {/* Confirmation Modal */}
//       <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => setIsSubmitted(true)}>Yes, Submit</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// // Calculator Component
// function CalculatorComponent() {
//   const [input, setInput] = useState('');

//   const handleClick = (value: string) => {
//     if (value === '=') {
//       try {
//         // eslint-disable-next-line no-eval
//         setInput(eval(input).toString());
//       } catch {
//         setInput('Error');
//       }
//     } else if (value === 'C') {
//       setInput('');
//     } else {
//       setInput(input + value);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const allowed = '0123456789+-*/.=C';
//     if (allowed.includes(e.key)) {
//       e.preventDefault();
//       if (e.key === 'Enter') handleClick('=');
//       else if (e.key === 'Backspace') setInput(input.slice(0, -1));
//       else handleClick(e.key === '.' ? '.' : e.key);
//     }
//   };

//   const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="cursor-pointer p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }


// 'use client';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import {BronzeCelebration, GoldCelebration} from '@/app/main/leagueBadge/page';
// import { Calculator, Loader2 } from 'lucide-react';
// import {
//   DiamondCelebration,
//   PalladiumCelebration,
//   PlatinumCelebration,
//   SilverCelebration,
// } from '@/app/main/leagueBadge/page';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import { useContext, useEffect, useState } from 'react';

// import Box from '@/components/ui/box';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import { QuizScoreRow } from '@/lib/types';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import Timer from '@/features/quiz/components/Timer';
// import { motion } from 'framer-motion';
// import { supabase } from '@/lib/supabaseClient';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// // Calculate points for quiz performance
// const calcPoints = (
//   percentage: number,
//   totalQuestions: number,
//   totalSubjects: number,
//   timeTaken: number,
//   totalTime: number,
//   streak: number
// ) => {
//   let basePoints = 0;
//   if (percentage >= 90) basePoints = 10;
//   else if (percentage >= 70) basePoints = 8;
//   else if (percentage >= 50) basePoints = 6;
//   else if (percentage >= 30) basePoints = 4;
//   else if (percentage >= 10) basePoints = 2;

//   const timeFactor = totalTime > 0 ? 1 - timeTaken / totalTime : 1;
//   const questionFactor = Math.min(totalQuestions / 20, 1);
//   const subjectFactor = Math.min(totalSubjects / 5, 1);
//   const streakBonus = Math.floor(streak / 5) * 2;

//   return Math.max(1, Math.round(basePoints * timeFactor * questionFactor * subjectFactor) + streakBonus);
// };

// // Calculate points for streak completion
// const calcStreakPoints = (currentStreak: number) => {
//   const milestones = [
//     { days: 7, points: 5 },
//     { days: 30, points: 15 },
//     { days: 100, points: 50 },
//   ];
//   return milestones.find(m => m.days === currentStreak)?.points || 0;
// };

// // Update streak and award points
// async function updateStreak(userId: string) {
//   try {
//     const today = new Date().toISOString().split('T')[0];

//     const { data: streakData, error: fetchError } = await supabase
//       .from('streaks')
//       .select('current_streak, longest_streak, last_active, streak_freezes')
//       .eq('user_id', userId)
//       .single();

//     if (fetchError && fetchError.code !== 'PGRST116') {
//       console.error('Error fetching streak:', fetchError.message);
//       toast.error('Failed to update streak');
//       return { completedToday: false };
//     }

//     let currentStreak = 1;
//     let longestStreak = 1;
//     let streakFreezes = 0;

//     if (streakData) {
//       const lastDate = new Date(streakData.last_active);
//       const todayDate = new Date(today);
//       const diffTime = todayDate.getTime() - lastDate.getTime();
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       streakFreezes = streakData.streak_freezes || 0;

//       if (diffDays === 1) {
//         currentStreak = streakData.current_streak + 1;
//       } else if (diffDays === 2 && streakFreezes > 0) {
//         currentStreak = streakData.current_streak + 1;
//         streakFreezes -= 1;
//       } else if (diffDays === 0) {
//         console.log('Already completed today, no streak update.');
//         return { currentStreak: streakData.current_streak, completedToday: false };
//       } else {
//         currentStreak = 1;
//       }

//       longestStreak = Math.max(streakData.longest_streak || 0, currentStreak);
//     }

//     const { error: updateError } = await supabase
//       .from('streaks')
//       .upsert({
//         user_id: userId,
//         current_streak: currentStreak,
//         longest_streak: longestStreak,
//         last_active: today,
//         streak_freezes: streakFreezes,
//       });

//     if (updateError) {
//       console.error('Error updating streak:', updateError.message);
//       toast.error('Failed to update streak');
//       return { completedToday: false };
//     }

//     // Award daily points for completing streak
//     const dailyPoints = 4;
//     const { error: dailyError } = await supabase
//       .from('quiz_scores')
//       .insert({
//         student_id: userId,
//         quiz_id: 'daily_streak',
//         points: dailyPoints,
//         taken_at: new Date().toISOString(),
//         exam_type: 'streak',
//       });

//     if (dailyError) {
//       console.error('Error awarding daily streak points:', dailyError.message);
//       toast.error('Failed to award daily streak points');
//     } else {
//       toast.success(`Awarded ${dailyPoints} points for completing today's streak!`);
//     }

//     // Award points for streak completion
//     const streakPoints = calcStreakPoints(currentStreak);
//     if (streakPoints > 0) {
//       const { error: scoreError } = await supabase
//         .from('quiz_scores')
//         .insert({
//           student_id: userId,
//           quiz_id: 'streak_reward',
//           points: streakPoints,
//           taken_at: new Date().toISOString(),
//           exam_type: 'streak',
//         });

//       if (scoreError) {
//         console.error('Error awarding streak points:', scoreError.message);
//         toast.error('Failed to award streak points');
//       } else {
//         toast.success(`Awarded ${streakPoints} points for ${currentStreak}-day streak!`);
//       }
//     }

//     // Send milestone notifications
//     const milestones = [7, 30, 100];
//     if (milestones.includes(currentStreak)) {
//       const { error: notificationError } = await supabase
//         .from('notifications')
//         .insert({
//           user_id: userId,
//           type: 'streak_milestone',
//           message: `Congrats on your ${currentStreak} day streak! You earned ${streakPoints} points! 🔥`,
//           status: 'pending',
//         });

//       if (notificationError) {
//         console.error('Error sending milestone notification:', notificationError.message);
//       } else {
//         console.log('Milestone notification sent for', currentStreak, 'days streak.');
//       }
//     }

//     console.log('Streak updated successfully:', { currentStreak, longestStreak });
//     return { currentStreak, completedToday: true };
//   } catch (err) {
//     console.error('Unexpected error updating streak:', err);
//     toast.error('An unexpected error occurred');
//     return { completedToday: false };
//   }
// }

// export default function Quiz() {
//   const {
//     questions,
//     totalTime,
//     isSubmitted,
//     setIsSubmitted,
//     currentSubject,
//     currentIndices,
//     setCurrentIndices,
//     userAnswers,
//     examType,
//     isStarting,
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);
//   const [timeTaken, setTimeTaken] = useState(0);
//   const [questionStartTime, setQuestionStartTime] = useState(Date.now());
//   const [completedToday, setCompletedToday] = useState(false);

//   const currentIndex = currentIndices[currentSubject] ?? 0;
//   const totalQuestions = questions[currentSubject]?.length ?? 0;

//   useEffect(() => {
//     setQuestionStartTime(Date.now());
//   }, [currentIndex, currentSubject]);

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const leagueThresholds = [
//     { name: 'Palladium', min: 0, column: 'celebrated_palladium', component: PalladiumCelebration },
//     { name: 'Bronze', min: 900, column: 'celebrated_bronze', component: BronzeCelebration },
//     { name: 'Silver', min: 1300, column: 'celebrated_silver', component: SilverCelebration },
//     { name: 'Gold', min: 5300, column: 'celebrated_gold', component: GoldCelebration },
//     { name: 'Platinum', min: 13300, column: 'celebrated_platinum', component: PlatinumCelebration },
//     { name: 'Diamond', min: 27300, column: 'celebrated_diamond', component: DiamondCelebration },
//   ];

//   // Handle quiz submission
//   useEffect(() => {
//     if (!isSubmitted) return;
//     const handleQuizSubmission = async () => {
//       try {
//         setSaving(true);
//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) {
//           console.error('No user authenticated.');
//           toast.error('You must be logged in to submit a quiz');
//           return;
//         }

//         const answers = userAnswers[currentSubject] ?? [];
//         const totalQ = questions[currentSubject]?.length ?? 0;
//         const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const totalSubjects = Object.keys(questions).length;

//         // Fetch current streak
//         const { data: streakData } = await supabase
//           .from('streaks')
//           .select('current_streak')
//           .eq('user_id', user.id)
//           .single();

//         const currentStreak = streakData?.current_streak || 0;

//         const newPoints = calcPoints(percentage, totalQ, totalSubjects, timeTaken, totalTime, currentStreak);

//         const { data: existingData } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         let scoreId: number;
//         if (existingData) {
//           const { error } = await supabase
//             .from('quiz_scores')
//             .update({
//               points: existingData.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existingData.id);
//           if (error) {
//             console.error('Error updating quiz score:', error.message);
//             toast.error('Failed to update quiz score');
//             return;
//           }
//           scoreId = existingData.id;
//         } else {
//           const { data: inserted, error } = await supabase
//             .from('quiz_scores')
//             .insert({
//               student_id: user.id,
//               quiz_id: currentSubject,
//               points: newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .select('id')
//             .single();
//           if (error || !inserted) {
//             console.error('Error inserting quiz score:', error?.message);
//             toast.error('Failed to save quiz score');
//             return;
//           }
//           scoreId = inserted.id;
//         }

//         // Update streak and award points
//         const streakResponse = await updateStreak(user.id);
//         setCompletedToday(streakResponse?.completedToday ?? false);

//         const { data: prevSubmission } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .order('taken_at', { ascending: false })
//           .limit(1)
//           .maybeSingle();

//         if (!prevSubmission) {
//           if (streakResponse?.completedToday) {
//             router.push('/main/streaks');
//           } else {
//             router.push('/main/quiz/result');
//           }
//           return;
//         }

//         const totalPoints = prevSubmission.points;
//         const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);

//         if (!league) {
//           if (streakResponse?.completedToday) {
//             router.push('/main/streaks');
//           } else {
//             router.push('/main/quiz/result');
//           }
//           return;
//         }

//         const hasCelebrated = prevSubmission[league.column as keyof QuizScoreRow] ?? false;

//         if (!hasCelebrated) {
//           setCurrentLeague(league.name);
//           await supabase
//             .from('quiz_scores')
//             .update({ [league.column]: true })
//             .eq('id', prevSubmission.id);
//         } else {
//           if (streakResponse?.completedToday) {
//             router.push('/main/streaks');
//           } else {
//             router.push('/main/quiz/result');
//           }
//         }
//       } catch (err) {
//         console.error('Error handling quiz submission:', err);
//         toast.error('An unexpected error occurred');
//       } finally {
//         setSaving(false);
//       }
//     };
//     handleQuizSubmission();
//   }, [isSubmitted]);

//   // Auto-submit if user leaves tab/window
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden && !isSubmitted) setIsSubmitted(true);
//     };
//     const handleBlur = () => {
//       if (!isSubmitted) setIsSubmitted(true);
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('blur', handleBlur);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('blur', handleBlur);
//     };
//   }, [isSubmitted, setIsSubmitted]);

//   if (isStarting) {
//     return <LoadingSpinner message="" />;
//   }

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="" />;
//   }

//   const leagueObj = leagueThresholds.find((l) => l.name === currentLeague);
//   const CelebrationComp = leagueObj?.component;
//   if (CelebrationComp) {
//     return (
//       <CelebrationComp
//         onClose={() => {
//           setCurrentLeague(null);
//           if (completedToday) {
//             router.push('/main/streaks');
//           } else {
//             router.push('/main/quiz/result');
//           }
//         }}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="card max-w-3xl w-full p-4 sm:p-6 md:p-8"
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//                   <Timer
//           totalSeconds={totalTime}
//           onTick={(elapsed: number) => setTimeTaken(elapsed)} // typed correctly
//           onTimeUp={() => setIsSubmitted(true)}
//         />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button className="cursor-pointer" variant="default" size="icon">
//                   <Calculator className="w-5 h-5" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="right" className="w-72">
//                 <SheetHeader>
//                   <SheetTitle>Calculator</SheetTitle>
//                 </SheetHeader>
//                 <CalculatorComponent />
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>

//         <SubjectSwitcher />

//         <h2 className="mt-4 mb-4 text-center text-lg sm:text-xl md:text-2xl font-semibold">
//           Question ({currentIndex + 1}/{totalQuestions})
//         </h2>

//         <QuestionDisplay />

//         {/* Navigator */}
//         <Box as="div" className="mt-6">
//           <div className="flex flex-wrap justify-center gap-2">
//             {questions[currentSubject]?.map((_, idx) => {
//               const isAnswered = userAnswers[currentSubject]?.[idx] !== -1;
//               const isCurrent = currentIndex === idx;
//               return (
//                 <div
//                   key={idx}
//                   className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer
//                     border transition-colors duration-200
//                     ${isAnswered ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-gray-300'}
//                     ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
//                   onClick={() => jumpToQuestion(idx)}
//                 >
//                   {idx + 1}
//                 </div>
//               );
//             })}
//           </div>
//         </Box>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex cursor-pointer items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

//       {/* Confirmation Modal */}
//       <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => setIsSubmitted(true)}>Yes, Submit</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// // Calculator Component
// function CalculatorComponent() {
//   const [input, setInput] = useState('');

//   const handleClick = (value: string) => {
//     if (value === '=') {
//       try {
//         // eslint-disable-next-line no-eval
//         setInput(eval(input).toString());
//       } catch {
//         setInput('Error');
//       }
//     } else if (value === 'C') {
//       setInput('');
//     } else {
//       setInput(input + value);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const allowed = '0123456789+-*/.=C';
//     if (allowed.includes(e.key)) {
//       e.preventDefault();
//       if (e.key === 'Enter') handleClick('=');
//       else if (e.key === 'Backspace') setInput(input.slice(0, -1));
//       else handleClick(e.key === '.' ? '.' : e.key);
//     }
//   };

//   const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="cursor-pointer p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }


'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BronzeCelebration,
  DiamondCelebration,
  GoldCelebration,
  PalladiumCelebration,
  PlatinumCelebration,
  SilverCelebration,
} from '@/app/main/leagueBadge/page';
import { Calculator, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useContext, useEffect, useState } from 'react';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import NavigationButtons from '@/features/quiz/components/NavigationButtons';
import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import { QuizScoreRow } from '@/lib/types';
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
import Timer from '@/features/quiz/components/Timer';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Calculate points for quiz performance
const calcPoints = (percentage: number) => {
  if (percentage >= 90) return 10;
  if (percentage >= 70) return 8;
  if (percentage >= 50) return 6;
  if (percentage >= 30) return 4;
  if (percentage >= 10) return 2;
  return 0;
};

// Calculate points for streak completion
const calcStreakPoints = (currentStreak: number) => {
  const milestones = [
    { days: 7, points: 5 },
    { days: 30, points: 15 },
    { days: 100, points: 50 },
  ];
  return milestones.find(m => m.days === currentStreak)?.points || 0;
};

// Update streak and award points
async function updateStreak(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: streakData, error: fetchError } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_active, streak_freezes')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching streak:', fetchError.message);
      toast.error('Failed to update streak');
      return { completedToday: false, currentStreak: 0 };
    }

    let currentStreak = 1;
    let longestStreak = 1;
    let streakFreezes = 0;

    if (streakData) {
      const lastDate = new Date(streakData.last_active);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      streakFreezes = streakData.streak_freezes || 0;

      if (diffDays === 1) {
        currentStreak = streakData.current_streak + 1;
      } else if (diffDays === 2 && streakFreezes > 0) {
        currentStreak = streakData.current_streak + 1;
        streakFreezes -= 1;
      } else if (diffDays === 0) {
        console.log('Already completed today, no streak update.');
        return { currentStreak: streakData.current_streak, completedToday: false };
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(streakData.longest_streak || 0, currentStreak);
    }

    const { error: updateError } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active: today,
        streak_freezes: streakFreezes,
      });

    if (updateError) {
      console.error('Error updating streak:', updateError.message);
      toast.error('Failed to update streak');
      return { completedToday: false, currentStreak };
    }

    // Award daily points for completing streak
    const dailyPoints = 4;
    const { error: dailyError } = await supabase
      .from('quiz_scores')
      .insert({
        student_id: userId,
        quiz_id: 'daily_streak',
        points: dailyPoints,
        taken_at: new Date().toISOString(),
        exam_type: 'streak',
      });

    if (dailyError) {
      console.error('Error awarding daily streak points:', dailyError.message);
      toast.error('Failed to award daily streak points');
    } else {
      toast.success(`Awarded ${dailyPoints} points for completing today's streak!`);
    }

    // Award points for streak milestones
    const streakPoints = calcStreakPoints(currentStreak);
    if (streakPoints > 0) {
      const { error: scoreError } = await supabase
        .from('quiz_scores')
        .insert({
          student_id: userId,
          quiz_id: 'streak_reward',
          points: streakPoints,
          taken_at: new Date().toISOString(),
          exam_type: 'streak',
        });

      if (scoreError) {
        console.error('Error awarding streak points:', scoreError.message);
        toast.error('Failed to award streak points');
      } else {
        toast.success(`Awarded ${streakPoints} points for ${currentStreak}-day streak!`);
      }
    }

    // Send milestone notifications
    const milestones = [7, 30, 100];
    if (milestones.includes(currentStreak)) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'streak_milestone',
          message: `Congrats on your ${currentStreak} day streak! You earned ${streakPoints} points! 🔥`,
          status: 'pending',
        });

      if (notificationError) {
        console.error('Error sending milestone notification:', notificationError.message);
      } else {
        console.log('Milestone notification sent for', currentStreak, 'days streak.');
      }
    }

    console.log('Streak updated successfully:', { currentStreak, longestStreak });
    return { currentStreak, completedToday: true };
  } catch (err) {
    console.error('Unexpected error updating streak:', err);
    toast.error('An unexpected error occurred');
    return { completedToday: false, currentStreak: 0 };
  }
}

export default function Quiz() {
  const {
    questions,
    totalTime,
    isSubmitted,
    setIsSubmitted,
    currentSubject,
    currentIndices,
    setCurrentIndices,
    userAnswers,
    examType,
    isStarting,
    calculateScores,
  } = useContext(QuizContext);

  const router = useRouter();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLeague, setCurrentLeague] = useState<string | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [completedToday, setCompletedToday] = useState(false);

  const currentIndex = currentIndices[currentSubject] ?? 0;
  const totalQuestions = questions[currentSubject]?.length ?? 0;

  const leagueThresholds = [
    { name: 'Palladium', min: 70, column: 'celebrated_palladium', component: PalladiumCelebration },
    { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
    { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
    { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
    { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
    { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
  ];

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex, currentSubject]);

  const jumpToQuestion = (index: number) => {
    setCurrentIndices({ ...currentIndices, [currentSubject]: index });
  };

  // Handle quiz submission
  useEffect(() => {
    if (!isSubmitted) return;

    const handleQuizSubmission = async () => {
      try {
        setSaving(true);
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) {
          console.error('No user authenticated.');
          toast.error('You must be logged in to submit a quiz');
          router.push('/auth/login');
          return;
        }

        // Calculate quiz results
        const answers = userAnswers[currentSubject] ?? [];
        const totalQ = questions[currentSubject]?.length ?? 0;
        const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
        const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
        const newPoints = calcPoints(percentage);

        // Calculate detailed scores for local storage
        const scoreResult = calculateScores();

        // Upsert quiz score
        const { data: existingData } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('student_id', user.id)
          .eq('quiz_id', currentSubject)
          .maybeSingle();

        let scoreId: number;
        if (existingData) {
          await supabase
            .from('quiz_scores')
            .update({
              points: existingData.points + newPoints,
              taken_at: new Date().toISOString(),
              exam_type: examType,
            })
            .eq('id', existingData.id);
          scoreId = existingData.id;
        } else {
          const { data: inserted, error } = await supabase
            .from('quiz_scores')
            .insert({
              student_id: user.id,
              quiz_id: currentSubject,
              points: newPoints,
              taken_at: new Date().toISOString(),
              exam_type: examType,
            })
            .select('id')
            .single();

          if (error || !inserted) {
            console.error('Insert failed', error?.message);
            toast.error('Failed to save quiz score');
            return;
          }
          scoreId = inserted.id;
        }

        // Fetch user profile for result storage
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url, user_type')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          console.error('Profile fetch error:', profileError?.message);
          toast.error('Failed to fetch profile');
          router.push('/main/dashboard');
          return;
        }

        // Fetch leaderboard data
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('leaderboard_view')
          .select('student_id, total_points, rank')
          .eq('student_id', user.id)
          .single();

        if (leaderboardError || !leaderboardData) {
          console.error('Leaderboard fetch error:', leaderboardError?.message);
          toast.error('Failed to fetch leaderboard data');
          router.push('/main/dashboard');
          return;
        }

        // Fetch all previous scores to calculate total points
        const { data: allScoresData } = await supabase
          .from('quiz_scores')
          .select('points')
          .eq('student_id', user.id)
          .lt('taken_at', new Date().toISOString());

        const previousTotal = (allScoresData || []).reduce((acc, s) => acc + Number(s.points), 0);
        const newTotal = previousTotal + newPoints;

        // Fetch streak data
        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user.id)
          .single();

        // Save results to local storage
        localStorage.setItem(
          'resultState',
          JSON.stringify({
            profile: profileData,
            score: scoreResult,
            latestScore: { points: newPoints, taken_at: new Date().toISOString(), exam_type: examType },
            leaderboardEntry: leaderboardData,
            previousPoints: previousTotal,
            totalPoints: newTotal,
            streak: streakData || { current_streak: 0, longest_streak: 0 },
          })
        );

        // Update streak and check if completed today
        const streakResponse = await updateStreak(user.id);
        setCompletedToday(streakResponse?.completedToday ?? false);

        // Fetch previous submission for league check
        const { data: prevSubmission } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('student_id', user.id)
          .eq('quiz_id', currentSubject)
          .order('taken_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!prevSubmission) {
          if (streakResponse?.completedToday) {
            router.push('/main/streaks');
          } else {
            router.push('/main/quiz/result');
          }
          return;
        }

        const totalPoints = prevSubmission.points;
        const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);

        if (!league) {
          if (streakResponse?.completedToday) {
            router.push('/main/streaks');
          } else {
            router.push('/main/quiz/result');
          }
          return;
        }

        const hasCelebrated = prevSubmission[league.column as keyof QuizScoreRow] ?? false;

        if (!hasCelebrated) {
          setCurrentLeague(league.name);
          await supabase
            .from('quiz_scores')
            .update({ [league.column]: true })
            .eq('id', prevSubmission.id);
        } else {
          if (streakResponse?.completedToday) {
            router.push('/main/streaks');
          } else {
            router.push('/main/quiz/result');
          }
        }
      } catch (err) {
        console.error('Error handling quiz submission:', err);
        toast.error('An unexpected error occurred');
        router.push('/main/dashboard');
      } finally {
        setSaving(false);
      }
    };
    handleQuizSubmission();
  }, [isSubmitted, calculateScores, currentSubject, userAnswers, examType, router, setCurrentIndices]);

  // Auto-submit if user leaves tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        console.log('Tab hidden, auto-submitting quiz');
        setIsSubmitted(true);
      }
    };
    const handleBlur = () => {
      if (!isSubmitted) {
        console.log('Window blurred, auto-submitting quiz');
        setIsSubmitted(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSubmitted, setIsSubmitted]);

  if (isStarting) {
    return <LoadingSpinner message="Starting quiz..." />;
  }

  if (!questions || Object.keys(questions).length === 0) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  const leagueObj = leagueThresholds.find((l) => l.name === currentLeague);
  const CelebrationComp = leagueObj?.component;

  if (CelebrationComp) {
    return (
      <CelebrationComp
        onClose={() => {
          setCurrentLeague(null);
          if (completedToday) {
            router.push('/main/streaks');
          } else {
            router.push('/main/quiz/result');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-3xl w-full p-4 sm:p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz in Progress</h1>
          <div className="flex items-center gap-4 text-lg font-semibold">
            <Timer
              totalSeconds={totalTime}
              onTick={(elapsed: number) => setTimeTaken(elapsed)}
              onTimeUp={() => {
                console.log('Time up, auto-submitting quiz');
                setIsSubmitted(true);
              }}
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button className="cursor-pointer" variant="default" size="icon">
                  <Calculator className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Calculator</SheetTitle>
                </SheetHeader>
                <CalculatorComponent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <SubjectSwitcher />

        <h2 className="mt-4 mb-4 text-center text-lg sm:text-xl md:text-2xl font-semibold">
          Question ({currentIndex + 1}/{totalQuestions})
        </h2>

        <QuestionDisplay />

        {/* Navigator */}
        <Box as="div" className="mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            {questions[currentSubject]?.map((_, idx) => {
              const isAnswered = userAnswers[currentSubject]?.[idx] !== -1;
              const isCurrent = currentIndex === idx;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer
                    border transition-colors duration-200
                    ${isAnswered ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-gray-300'}
                    ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => jumpToQuestion(idx)}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </Box>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <NavigationButtons />
          <Button onClick={() => setOpenConfirm(true)} className="flex cursor-pointer items-center justify-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Quiz
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsSubmitted(true)}>Yes, Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Calculator Component
function CalculatorComponent() {
  const [input, setInput] = useState('');

  const handleClick = (value: string) => {
    if (value === '=') {
      try {
        // eslint-disable-next-line no-eval
        setInput(eval(input).toString());
      } catch {
        setInput('Error');
      }
    } else if (value === 'C') {
      setInput('');
    } else {
      setInput(input + value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = '0123456789+-*/.=C';
    if (allowed.includes(e.key)) {
      e.preventDefault();
      if (e.key === 'Enter') handleClick('=');
      else if (e.key === 'Backspace') setInput(input.slice(0, -1));
      else handleClick(e.key === '.' ? '.' : e.key);
    }
  };

  const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(btn => (
          <Button
            key={btn}
            variant={btn === 'C' ? 'destructive' : 'secondary'}
            onClick={() => handleClick(btn)}
            className="cursor-pointer p-4"
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  );
}