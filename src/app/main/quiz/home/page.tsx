'use client'

import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { QuizContext } from '@/features/quiz/context/QuizContext'
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner'
import SubjectSwitcher from '@/features/quiz/components/SubjectSwitcher'
import QuestionDisplay from '@/features/quiz/components/QuestionDisplay'
import Timer from '@/features/quiz/components/Timer'
import NavigationButtons from '@/features/quiz/components/NavigationButtons'
import { supabase } from '@/lib/supabaseClient'
import Box from '@/components/ui/box'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  SilverCelebration,
  GoldCelebration,
  PlatinumCelebration,
  DiamondCelebration,
  PalladiumCelebration,
} from '@/app/main/leagueBadge/page'
import BronzeCelebration from '@/app/main/leagueBadge/page'
import { QuizScoreRow } from '@/lib/types'

// ✅ Dynamic Points Calculation
const calcPoints = (
  percentage: number,
  totalQuestions: number,
  totalSubjects: number,
  timeTaken: number,
  totalTime: number
) => {
  let basePoints = 0
  if (percentage >= 90) basePoints = 10
  else if (percentage >= 70) basePoints = 8
  else if (percentage >= 50) basePoints = 6
  else if (percentage >= 30) basePoints = 4
  else if (percentage >= 10) basePoints = 2

  const timeFactor = totalTime > 0 ? (1 - timeTaken / totalTime) : 1
  const questionFactor = Math.min(totalQuestions / 20, 1)
  const subjectFactor = Math.min(totalSubjects / 5, 1)

  return Math.max(1, Math.round(basePoints * timeFactor * questionFactor * subjectFactor))
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
  } = useContext(QuizContext)

  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentLeague, setCurrentLeague] = useState<string | null>(null)
  const [timeTaken, setTimeTaken] = useState(0)

  const currentIndex = currentIndices[currentSubject] ?? 0
  const totalQuestions = questions[currentSubject]?.length ?? 0

  // Track time per question
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentIndex, currentSubject])

  const jumpToQuestion = (index: number) => {
    setCurrentIndices({ ...currentIndices, [currentSubject]: index })
  }

  // ✅ League thresholds
  const leagueThresholds = [
    { name: 'Palladium', min: 70, column: 'celebrated_palladium', component: PalladiumCelebration },
    { name: 'Bronze', min: 1300, column: 'celebrated_bronze', component: BronzeCelebration },
    { name: 'Silver', min: 2300, column: 'celebrated_silver', component: SilverCelebration },
    { name: 'Gold', min: 3300, column: 'celebrated_gold', component: GoldCelebration },
    { name: 'Platinum', min: 4300, column: 'celebrated_platinum', component: PlatinumCelebration },
    { name: 'Diamond', min: 5300, column: 'celebrated_diamond', component: DiamondCelebration },
  ]

  // ✅ Handle quiz submission
  useEffect(() => {
    if (!isSubmitted) return
    const handleQuizSubmission = async () => {
      try {
        setSaving(true)
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        if (!user) return

        const answers = userAnswers[currentSubject] ?? []
        const totalQ = questions[currentSubject]?.length ?? 0
        const correct =
          questions[currentSubject]?.filter((q, i) => answers[i] === q.correct).length ?? 0
        const percentage = totalQ ? Math.round((correct / totalQ) * 100) : 0
        const totalSubjects = Object.keys(questions).length

        const newPoints = calcPoints(percentage, totalQ, totalSubjects, timeTaken, totalTime)

        const { data: existingData } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('student_id', user.id)
          .eq('quiz_id', currentSubject)
          .maybeSingle()

        let scoreId: number
        if (existingData) {
          await supabase
            .from('quiz_scores')
            .update({
              points: existingData.points + newPoints,
              taken_at: new Date().toISOString(),
              exam_type: examType,
            })
            .eq('id', existingData.id)
          scoreId = existingData.id
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
            .single()
          if (error || !inserted) return
          scoreId = inserted.id
        }

        const { data: prevSubmission } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('student_id', user.id)
          .eq('quiz_id', currentSubject)
          .order('taken_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!prevSubmission) {
          router.push('/main/quiz/result')
          return
        }

        const totalPoints = prevSubmission.points
        const league = leagueThresholds.slice().reverse().find((l) => totalPoints >= l.min)

        if (!league) {
          router.push('/main/quiz/result')
          return
        }

        const hasCelebrated = prevSubmission[league.column as keyof QuizScoreRow] ?? false

        if (!hasCelebrated) {
          setCurrentLeague(league.name)
          await supabase
            .from('quiz_scores')
            .update({ [league.column]: true })
            .eq('id', prevSubmission.id)
        } else {
          router.push('/main/quiz/result')
        }
      } catch (err) {
        console.error('Error handling quiz submission:', err)
      } finally {
        setSaving(false)
      }
    }
    handleQuizSubmission()
  }, [isSubmitted])

  // ✅ Auto-submit if user leaves tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) setIsSubmitted(true)
    }
    const handleBlur = () => {
      if (!isSubmitted) setIsSubmitted(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isSubmitted, setIsSubmitted])

  // ✅ Auto-submit if user spends >4 minutes on one question
  useEffect(() => {
    if (isSubmitted) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - questionStartTime) / 1000
      if (elapsed >= 240) setIsSubmitted(true)
    }, 1000)
    return () => clearInterval(interval)
  }, [questionStartTime, isSubmitted, setIsSubmitted])

  if (isStarting) {
    return <LoadingSpinner message="Preparing your quiz..." />
  }

  if (!questions || Object.keys(questions).length === 0) {
    return <LoadingSpinner message="" />
  }

  const leagueObj = leagueThresholds.find((l) => l.name === currentLeague)
  const CelebrationComp = leagueObj?.component
  if (CelebrationComp) {
    return (
      <CelebrationComp
        onClose={() => {
          setCurrentLeague(null)
          router.push('/main/quiz/result')
        }}
      />
    )
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
              onTick={(elapsed) => setTimeTaken(elapsed)}
              onTimeUp={() => setIsSubmitted(true)}
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button className='cursor-pointer' variant="default" size="icon">
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
              const isAnswered = userAnswers[currentSubject]?.[idx] !== -1
              const isCurrent = currentIndex === idx
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
              )
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
  )
}

// ✅ Calculator Component
function CalculatorComponent() {
  const [input, setInput] = useState('')

  const handleClick = (value: string) => {
    if (value === '=') {
      try {
        // eslint-disable-next-line no-eval
        setInput(eval(input).toString())
      } catch {
        setInput('Error')
      }
    } else if (value === 'C') {
      setInput('')
    } else {
      setInput(input + value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = '0123456789+-*/.=C'
    if (allowed.includes(e.key)) {
      e.preventDefault()
      if (e.key === 'Enter') handleClick('=')
      else if (e.key === 'Backspace') setInput(input.slice(0, -1))
      else handleClick(e.key === '.' ? '.' : e.key)
    }
  }

  const buttons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C']

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Input value={input} onKeyDown={handleKeyDown} onChange={() => {}} className="text-right font-mono text-lg" />
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(btn => (
          <Button
            key={btn}
            variant={btn === 'C' ? 'destructive' : 'secondary'}
            onClick={() => handleClick(btn)}
            className=" cursor-pointer p-4"
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  )
}
