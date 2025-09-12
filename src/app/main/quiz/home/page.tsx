// 'use client';

// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calculator, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import Timer from '@/features/quiz/components/Timer';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import { supabase } from '@/lib/supabaseClient';
// import Box from '@/components/ui/box';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

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
//     examType, // use actual selected exam type
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const currentIndex = currentIndices[currentSubject] || 0;
//   const totalQuestions = questions[currentSubject]?.length || 0;

//      const jumpToQuestion = (index: number) => {
//   const updated = { ...currentIndices, [currentSubject]: index };
//   setCurrentIndices(updated);
// };

//   const calcPoints = (percentage: number) => {
//     if (percentage >= 90) return 10;
//     if (percentage >= 70) return 8;
//     if (percentage >= 50) return 6;
//     if (percentage >= 30) return 4;
//     if (percentage >= 10) return 2;
//     return 0;
//   };

//   useEffect(() => {
//     const saveScore = async () => {
//       if (!isSubmitted) return;

//       try {
//         setSaving(true);

//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) return;

//         const answers = userAnswers[currentSubject] || [];
//         const totalQ = questions[currentSubject]?.length || 0;
//         const correct = questions[currentSubject]?.filter(
//           (q, i) => answers[i] !== -1 && answers[i] === q.correct
//         ).length;

//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const newPoints = calcPoints(percentage);

//         const { data: existing } = await supabase
//           .from('quiz_scores')
//           .select('id, points')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (existing) {
//           await supabase
//             .from('quiz_scores')
//             .update({
//               points: existing.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existing.id);
//         } else {
//           await supabase.from('quiz_scores').insert({
//             student_id: user.id,
//             quiz_id: currentSubject,
//             points: newPoints,
//             taken_at: new Date().toISOString(),
//             exam_type: examType,
//           });
//         }

//         router.push('/main/quiz/result');
//       } catch (err) {
//         console.error('Error saving score:', err);
//       } finally {
//         setSaving(false);
//       }
//     };

//     saveScore();
//   }, [isSubmitted, currentSubject, questions, userAnswers, router, examType]);

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="Loading quiz..." />;
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
//             <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="default" size="icon">
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

//         {/* Subject Switcher */}
//         <SubjectSwitcher />

//         {/* Question Number */}
//         <h2 className="mt-4 mb-4 text-center text-lg sm:text-xl md:text-2xl font-semibold">
//           Question ({currentIndex + 1}/{totalQuestions})
//         </h2>

//         {/* Question Display */}
//         <QuestionDisplay />

//         {/* Question Tracker */}
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

//         {/* Navigation + Submit */}
//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button
//             onClick={() => setOpenConfirm(true)}
//             className="flex items-center justify-center gap-2"
//           >
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

//       {/* Confirmation Dialog */}
//       <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => setIsSubmitted(true)}>
//               Yes, Submit
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// /* Calculator Component with keyboard input */
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

//   const buttons = [
//     '7', '8', '9', '/',
//     '4', '5', '6', '*',
//     '1', '2', '3', '-',
//     '0', '.', '=', '+',
//     'C',
//   ];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input
//         value={input}
//         onKeyDown={handleKeyDown}
//         onChange={() => {}}
//         className="text-right font-mono text-lg"
//       />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }






// 'use client';

// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calculator, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import Timer from '@/features/quiz/components/Timer';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import { supabase } from '@/lib/supabaseClient';
// import Box from '@/components/ui/box';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// // 🎉 Import league celebrations
// import {
//   SilverCelebration,
//   GoldCelebration,
//   PlatinumCelebration,
//   DiamondCelebration,
//   PalladiumCelebration,
// } from '@/app/main/leagueBadge/page';
// import BronzeCelebration from '@/app/main/leagueBadge/page';

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
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);
//   const [lastCelebratedLeague, setLastCelebratedLeague] = useState<string | null>(null);

//   const currentIndex = currentIndices[currentSubject] || 0;
//   const totalQuestions = questions[currentSubject]?.length || 0;

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const calcPoints = (percentage: number) => {
//     if (percentage >= 90) return 10;
//     if (percentage >= 70) return 8;
//     if (percentage >= 50) return 6;
//     if (percentage >= 30) return 4;
//     if (percentage >= 10) return 2;
//     return 0;
//   };

//   // 🏆 League thresholds
//   const leagueThresholds = [
//     { name: 'Palladium', min: 0, component: PalladiumCelebration },
//     { name: 'Bronze', min: 1300, component: BronzeCelebration },
//     { name: 'Silver', min: 2300, component: SilverCelebration },
//     { name: 'Gold', min: 3300, component: GoldCelebration },
//     { name: 'Platinum', min: 4300, component: PlatinumCelebration },
//     { name: 'Diamond', min: 5300, component: DiamondCelebration },
//   ];

//   useEffect(() => {
//     const saveScore = async () => {
//       if (!isSubmitted) return;

//       try {
//         setSaving(true);

//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) return;

//         const answers = userAnswers[currentSubject] || [];
//         const totalQ = questions[currentSubject]?.length || 0;
//         const correct = questions[currentSubject]?.filter(
//           (q, i) => answers[i] !== -1 && answers[i] === q.correct
//         ).length;

//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const newPoints = calcPoints(percentage);

//         const { data: existing } = await supabase
//           .from('quiz_scores')
//           .select('id, points')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (existing) {
//           await supabase
//             .from('quiz_scores')
//             .update({
//               points: existing.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existing.id);
//         } else {
//           await supabase.from('quiz_scores').insert({
//             student_id: user.id,
//             quiz_id: currentSubject,
//             points: newPoints,
//             taken_at: new Date().toISOString(),
//             exam_type: examType,
//           });
//         }

//         const { data: totals } = await supabase
//           .from('quiz_scores')
//           .select('points')
//           .eq('student_id', user.id);

//         const totalPoints = totals?.reduce((acc, row) => acc + row.points, 0) || 0;

//         const league = leagueThresholds
//           .slice()
//           .reverse()
//           .find((l) => totalPoints >= l.min);

//         if (league && league.name !== lastCelebratedLeague) {
//           setCurrentLeague(league.name);
//           setLastCelebratedLeague(league.name);
//         } else {
//           router.push('/main/quiz/result');
//         }
//       } catch (err) {
//         console.error('Error saving score:', err);
//       } finally {
//         setSaving(false);
//       }
//     };

//     saveScore();
//   }, [isSubmitted]);

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="Loading quiz..." />;
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
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//             <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="default" size="icon">
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

//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

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

// /* Calculator Component */
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

//   const buttons = [
//     '7', '8', '9', '/',
//     '4', '5', '6', '*',
//     '1', '2', '3', '-',
//     '0', '.', '=', '+',
//     'C',
//   ];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calculator, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import Timer from '@/features/quiz/components/Timer';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import { supabase } from '@/lib/supabaseClient';
// import Box from '@/components/ui/box';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// import {
//   SilverCelebration,
//   GoldCelebration,
//   PlatinumCelebration,
//   DiamondCelebration,
//   PalladiumCelebration,
// } from '@/app/main/leagueBadge/page';
// import BronzeCelebration from '@/app/main/leagueBadge/page';
// import { QuizScoreRow } from '@/lib/types';

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
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);

//   const currentIndex = currentIndices[currentSubject] || 0;
//   const totalQuestions = questions[currentSubject]?.length || 0;

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const calcPoints = (percentage: number) => {
//     if (percentage >= 90) return 10;
//     if (percentage >= 70) return 8;
//     if (percentage >= 50) return 6;
//     if (percentage >= 30) return 4;
//     if (percentage >= 10) return 2;
//     return 0;
//   };

//   const leagueThresholds = [
//     { name: 'Palladium', min: 0, column: 'celebrated_palladium', component: PalladiumCelebration },
//     { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
//     { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
//     { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
//     { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
//     { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
//   ];

//   useEffect(() => {
//     const saveScore = async () => {
//       if (!isSubmitted) return;
//       try {
//         setSaving(true);

//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) return;

//         const answers = userAnswers[currentSubject] || [];
//         const totalQ = questions[currentSubject]?.length || 0;
//         const correct = questions[currentSubject]?.filter(
//           (q, i) => answers[i] !== -1 && answers[i] === q.correct
//         ).length;

//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const newPoints = calcPoints(percentage);

//         // Update or insert score for this quiz
//         const { data: existing } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (existing) {
//           await supabase
//             .from('quiz_scores')
//             .update({
//               points: existing.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existing.id);
//         } else {
//           await supabase.from('quiz_scores').insert({
//             student_id: user.id,
//             quiz_id: currentSubject,
//             points: newPoints,
//             taken_at: new Date().toISOString(),
//             exam_type: examType,
//           });
//         }

//         // Fetch total points for user
//         const { data: totals } = await supabase
//           .from('quiz_scores')
//           .select('points')
//           .eq('student_id', user.id);

//         const totalPoints = totals?.reduce((acc, row) => acc + row.points, 0) || 0;

//         // Determine league
//         const league = leagueThresholds
//           .slice()
//           .reverse()
//           .find((l) => totalPoints >= l.min);

//         if (!league) {
//           router.push('/main/quiz/result');
//           return;
//         }

//         // Check if celebration has already been shown
//         // const { data: scoreData } = await supabase
//         //   .from('quiz_scores')
//         //   .select(`id, ${league.column}`)
//         //   .eq('student_id', user.id)
//         //   .maybeSingle();

//         // // const hasCelebrated = scoreData?.[league.column] ?? false;
//           const { data, error } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (error) {
//           console.error('Supabase fetch error:', error);
//           return;
//         }

// const scoreData = data as QuizScoreRow; // ✅ safe now because error is checked

// const hasCelebrated = scoreData[league.column as keyof QuizScoreRow] ?? false;

//         if (!hasCelebrated) {
//           setCurrentLeague(league.name);
//           // Mark league as celebrated
//           await supabase
//             .from('quiz_scores')
//             .update({ [league.column]: true })
//             .eq('id', scoreData?.id);
//         } else {
//           router.push('/main/quiz/result');
//         }
//       } catch (err) {
//         console.error('Error saving score:', err);
//       } finally {
//         setSaving(false);
//       }
//     };

//     saveScore();
//   }, [isSubmitted]);

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="Loading quiz..." />;
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
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//             <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="default" size="icon">
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

//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

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

//   const buttons = [
//     '7', '8', '9', '/',
//     '4', '5', '6', '*',
//     '1', '2', '3', '-',
//     '0', '.', '=', '+',
//     'C',
//   ];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calculator, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import Timer from '@/features/quiz/components/Timer';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import { supabase } from '@/lib/supabaseClient';
// import Box from '@/components/ui/box';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// import {
//   SilverCelebration,
//   GoldCelebration,
//   PlatinumCelebration,
//   DiamondCelebration,
//   PalladiumCelebration,
// } from '@/app/main/leagueBadge/page';
// import BronzeCelebration from '@/app/main/leagueBadge/page';
// import { QuizScoreRow } from '@/lib/types';

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
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);

//   const currentIndex = currentIndices[currentSubject] || 0;
//   const totalQuestions = questions[currentSubject]?.length || 0;

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const calcPoints = (percentage: number) => {
//     if (percentage >= 90) return 10;
//     if (percentage >= 70) return 8;
//     if (percentage >= 50) return 6;
//     if (percentage >= 30) return 4;
//     if (percentage >= 10) return 2;
//     return 0;
//   };

//   const leagueThresholds = [
//     { name: 'Palladium', min: 0, column: 'celebrated_palladium', component: PalladiumCelebration },
//     { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
//     { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
//     { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
//     { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
//     { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
//   ];

//   useEffect(() => {
//     const handleQuizSubmission = async () => {
//       if (!isSubmitted) return;

//       try {
//         setSaving(true);

//         // Get current user
//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) return;

//         // Calculate quiz points
//         const answers = userAnswers[currentSubject] || [];
//         const totalQ = questions[currentSubject]?.length || 0;
//         const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const newPoints = calcPoints(percentage);

//         // Upsert quiz score
//         const { data: existing } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         let scoreId: number;

//         if (existing) {
//           await supabase
//             .from('quiz_scores')
//             .update({
//               points: existing.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existing.id);
//           scoreId = existing.id;
//         } else {
//           const { data: inserted } = await supabase
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
//             if (error || !inserted) {
//   console.error('Insert failed', error);
//   return;
// }
//           scoreId = inserted.id;
//         }

//         // Fetch total points across all quizzes
//         const { data: allScores } = await supabase
//           .from('quiz_scores')
//           .select('points')
//           .eq('student_id', user.id);

//         const totalPoints = allScores?.reduce((acc, row) => acc + row.points, 0) ?? 0;

//         // Determine current league
//         const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);
//         if (!league) {
//           router.push('/main/quiz/result');
//           return;
//         }

//         // Fetch score row to check if league celebration was already shown
//         const { data: scoreRowData, error } = await supabase
//           .from('quiz_scores')
//           .select(`id, ${league.column}`)
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (error || !scoreRowData) {
//           console.error('Error fetching score row or row not found', error);
//           router.push('/main/quiz/result');
//           return;
//         }

//         const scoreRow = scoreRowData as QuizScoreRow;
//         const hasCelebrated = scoreRow[league.column as keyof QuizScoreRow] ?? false;

//         if (!hasCelebrated) {
//           setCurrentLeague(league.name);
//           await supabase
//             .from('quiz_scores')
//             .update({ [league.column]: true })
//             .eq('id', scoreRow.id);
//         } else {
//           router.push('/main/quiz/result');
//         }
//       } catch (err) {
//         console.error('Error processing quiz submission:', err);
//       } finally {
//         setSaving(false);
//       }
//     };

//     handleQuizSubmission();
//   }, [isSubmitted]);

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="Loading quiz..." />;
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
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//             <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="default" size="icon">
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

//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

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

//   const buttons = [
//     '7', '8', '9', '/',
//     '4', '5', '6', '*',
//     '1', '2', '3', '-',
//     '0', '.', '=', '+',
//     'C',
//   ];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }






// 'use client';

// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calculator, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { QuizContext } from '@/features/quiz/context/QuizContext';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
// import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
// import Timer from '@/features/quiz/components/Timer';
// import NavigationButtons from '@/features/quiz/components/NavigationButtons';
// import { supabase } from '@/lib/supabaseClient';
// import Box from '@/components/ui/box';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// import {
//   SilverCelebration,
//   GoldCelebration,
//   PlatinumCelebration,
//   DiamondCelebration,
//   PalladiumCelebration,
// } from '@/app/main/leagueBadge/page';
// import BronzeCelebration from '@/app/main/leagueBadge/page';
// import { QuizScoreRow } from '@/lib/types';

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
//   } = useContext(QuizContext);

//   const router = useRouter();
//   const [openConfirm, setOpenConfirm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [currentLeague, setCurrentLeague] = useState<string | null>(null);

//   const currentIndex = currentIndices[currentSubject] ?? 0;
//   const totalQuestions = questions[currentSubject]?.length ?? 0;

//   const jumpToQuestion = (index: number) => {
//     setCurrentIndices({ ...currentIndices, [currentSubject]: index });
//   };

//   const calcPoints = (percentage: number) => {
//     if (percentage >= 90) return 10;
//     if (percentage >= 70) return 8;
//     if (percentage >= 50) return 6;
//     if (percentage >= 30) return 4;
//     if (percentage >= 10) return 2;
//     return 0;
//   };

//   const leagueThresholds = [
//     { name: 'Palladium', min: 30, column: 'celebrated_palladium', component: PalladiumCelebration },
//     { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
//     { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
//     { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
//     { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
//     { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
//   ];

//   useEffect(() => {
//     const handleQuizSubmission = async () => {
//       if (!isSubmitted) return;

//       try {
//         setSaving(true);

//         const { data: authData } = await supabase.auth.getUser();
//         const user = authData?.user;
//         if (!user) return;

//         const answers = userAnswers[currentSubject] ?? [];
//         const totalQ = questions[currentSubject]?.length ?? 0;
//         const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
//         const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
//         const newPoints = calcPoints(percentage);

//         // Upsert quiz score
//         const { data: existingData } = await supabase
//           .from('quiz_scores')
//           .select('*')
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         let scoreId: number;

//         if (existingData) {
//           await supabase
//             .from('quiz_scores')
//             .update({
//               points: existingData.points + newPoints,
//               taken_at: new Date().toISOString(),
//               exam_type: examType,
//             })
//             .eq('id', existingData.id);
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
//             console.error('Insert failed', error);
//             return;
//           }

//           scoreId = inserted.id;
//         }

//         // Fetch total points for user
//         const { data: allScores } = await supabase
//           .from('quiz_scores')
//           .select('points')
//           .eq('student_id', user.id);

//         const totalPoints = allScores?.reduce((acc, row) => acc + row.points, 0) ?? 0;

//         // Determine league
//         const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);
//         if (!league) {
//           router.push('/main/quiz/result');
//           return;
//         }

//         // Check if celebration already shown
//         const { data: scoreRowData, error: scoreError } = await supabase
//           .from('quiz_scores')
//           .select(`id, ${league.column}`)
//           .eq('student_id', user.id)
//           .eq('quiz_id', currentSubject)
//           .maybeSingle();

//         if (scoreError || !scoreRowData) {
//           console.error('Error fetching score row', scoreError);
//           router.push('/main/quiz/result');
//           return;
//         }

//           const scoreRow = scoreRowData as unknown as QuizScoreRow;
//          const hasCelebrated = scoreRow[league.column as keyof QuizScoreRow] ?? false;

//         if (!hasCelebrated) {
//           setCurrentLeague(league.name);
//           await supabase
//             .from('quiz_scores')
//             .update({ [league.column]: true })
//             .eq('id', scoreRow.id);
//         } else {
//           router.push('/main/quiz/result');
//         }

//       } catch (err) {
//         console.error('Error handling quiz submission', err);
//       } finally {
//         setSaving(false);
//       }
//     };

//     handleQuizSubmission();
//   }, [isSubmitted]);

//   if (!questions || Object.keys(questions).length === 0) {
//     return <LoadingSpinner message="Loading quiz..." />;
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
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Quiz in Progress</h1>
//           <div className="flex items-center gap-4 text-lg font-semibold">
//             <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="default" size="icon">
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

//         <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
//           <NavigationButtons />
//           <Button onClick={() => setOpenConfirm(true)} className="flex items-center justify-center gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Submit Quiz
//           </Button>
//         </div>
//       </motion.div>

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

//   const buttons = [
//     '7', '8', '9', '/',
//     '4', '5', '6', '*',
//     '1', '2', '3', '-',
//     '0', '.', '=', '+',
//     'C',
//   ];

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
//       <div className="grid grid-cols-4 gap-2">
//         {buttons.map(btn => (
//           <Button
//             key={btn}
//             variant={btn === 'C' ? 'destructive' : 'secondary'}
//             onClick={() => handleClick(btn)}
//             className="p-4"
//           >
//             {btn}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }






'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher';
import QuestionDisplay from '@/features/quiz/components/QuestionDisplay';
import Timer from '@/features/quiz/components/Timer';
import NavigationButtons from '@/features/quiz/components/NavigationButtons';
import { supabase } from '@/lib/supabaseClient';
import Box from '@/components/ui/box';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  SilverCelebration,
  GoldCelebration,
  PlatinumCelebration,
  DiamondCelebration,
  PalladiumCelebration,
} from '@/app/main/leagueBadge/page';
import BronzeCelebration from '@/app/main/leagueBadge/page';
import { QuizScoreRow } from '@/lib/types';

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
  } = useContext(QuizContext);

  const router = useRouter();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLeague, setCurrentLeague] = useState<string | null>(null);

  const currentIndex = currentIndices[currentSubject] ?? 0;
  const totalQuestions = questions[currentSubject]?.length ?? 0;

  const jumpToQuestion = (index: number) => {
    setCurrentIndices({ ...currentIndices, [currentSubject]: index });
  };

  const calcPoints = (percentage: number) => {
    if (percentage >= 90) return 10;
    if (percentage >= 70) return 8;
    if (percentage >= 50) return 6;
    if (percentage >= 30) return 4;
    if (percentage >= 10) return 2;
    return 0;
  };

  const leagueThresholds = [
    { name: 'Palladium', min: 70, column: 'celebrated_palladium', component: PalladiumCelebration },
    { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
    { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
    { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
    { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
    { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
  ];

  useEffect(() => {
    const handleQuizSubmission = async () => {
      if (!isSubmitted) return;

      try {
        setSaving(true);

        // Get current user
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        // Calculate points for this submission
        const answers = userAnswers[currentSubject] ?? [];
        const totalQ = questions[currentSubject]?.length ?? 0;
        const correct = questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0;
        const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0;
        const newPoints = calcPoints(percentage);

        // Upsert current quiz score
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
            console.error('Insert failed', error);
            return;
          }

          scoreId = inserted.id;
        }

        // Fetch only the immediate previous submission
        const { data: prevSubmission } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('student_id', user.id)
          .eq('quiz_id', currentSubject)
          .order('taken_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!prevSubmission) {
          router.push('/main/quiz/result');
          return;
        }

        const totalPoints = prevSubmission.points;
        const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min);

        if (!league) {
          router.push('/main/quiz/result');
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
          router.push('/main/quiz/result');
        }
      } catch (err) {
        console.error('Error handling quiz submission:', err);
      } finally {
        setSaving(false);
      }
    };

    handleQuizSubmission();
  }, [isSubmitted]);

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
          router.push('/main/quiz/result');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz in Progress</h1>
          <div className="flex items-center gap-4 text-lg font-semibold">
            <Timer totalSeconds={totalTime} onTimeUp={() => setIsSubmitted(true)} />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="icon">
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

        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <NavigationButtons />
          <Button onClick={() => setOpenConfirm(true)} className="flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Quiz
          </Button>
        </div>
      </motion.div>

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

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
    'C',
  ];

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(btn => (
          <Button
            key={btn}
            variant={btn === 'C' ? 'destructive' : 'secondary'}
            onClick={() => handleClick(btn)}
            className="p-4"
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  );
}
