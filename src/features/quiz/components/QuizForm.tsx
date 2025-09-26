'use client';

import { useContext, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Play, AlertCircle, RefreshCw, Plus, Minus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import questionsPool from '@/lib/questions';
import { QuizContext } from '@/features/quiz/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const scienceSubjects = [
  'english',
  'math',
  'physics',
  'chemistry',
  'biology',
  'further_math',
  'agricultural_science',
  'computer_studies',
];
const artsSubjects = [
  'english',
  'math',
  'literature',
  'government',
  'history',
  'economics',
  'geography',
  'civic_education',
  'crs',
  'irs',
  'commerce',
  'accounting',
  'fine_arts',
  'music',
  'home_economics',
  'french',
  'yoruba',
  'igbo',
  'hausa',
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy', timePerQuestion: 60 },
  { value: 'medium', label: 'Medium', timePerQuestion: 45 },
  { value: 'hard', label: 'Hard', timePerQuestion: 30 },
];

interface QuizFormProps {
  route: string;
  examType: string;
  onBack: () => void;
}

export default function QuizForm({ route, examType, onBack }: QuizFormProps) {
  const {
    selectedSubjects,
    setSelectedSubjects,
    questionsPerSubject,
    setQuestionsPerSubject,
    setTotalTime,
    generateQuestions,
    resetQuiz,
  } = useContext(QuizContext);
  const router = useRouter();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [timeMode, setTimeMode] = useState<'manual' | 'difficulty'>('difficulty');
  const [error, setError] = useState('');
  const maxSubjects =
    examType === 'WAEC' || examType === 'NECO'
      ? 9
      : examType === 'JAMB'
      ? 4
      : Infinity;

  const availableSubjects =
    route === 'science'
      ? scienceSubjects
      : route === 'arts'
      ? artsSubjects
      : [...scienceSubjects, ...artsSubjects];

  const handleSubjectChange = (sub: string, checked: boolean) => {
    if (examType === 'JAMB' && sub === 'english' && !checked) {
      setError('English is compulsory for JAMB.');
      return;
    }
    if (['WAEC', 'NECO'].includes(examType) && sub === 'math' && !checked) {
      setError('Mathematics is compulsory for WAEC/NECO.');
      return;
    }
    const newSubjects = checked
      ? [...selectedSubjects, sub]
      : selectedSubjects.filter(s => s !== sub);
    if (checked && newSubjects.length > maxSubjects) {
      setError(`You can select up to ${maxSubjects} subjects for ${examType}.`);
      return;
    }
    setSelectedSubjects(newSubjects);
    setQuestionsPerSubject(prevCounts => {
      const newCounts = { ...prevCounts };
      if (!checked) {
        delete newCounts[sub];
      } else if (!(sub in newCounts)) {
        newCounts[sub] = 1;
      }
      return newCounts;
    });
    setError('');
  };

  const handleQuestionCountChange = (sub: string, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = value === '' ? 0 : parseInt(value, 10);
    const maxQuestions = questionsPool[sub]?.length || 10;
    if (value === '' || (!isNaN(num) && num >= 0 && num <= maxQuestions)) {
      setQuestionsPerSubject(prev => ({ ...prev, [sub]: num }));
      setError('');
    } else if (!isNaN(num) && num > maxQuestions) {
      setError(`Only ${maxQuestions} questions available for ${sub.replace('_', ' ')}.`);
    }
  };

  const handleQuestionCountAdjust = (sub: string, increment: boolean) => {
    const maxQuestions = questionsPool[sub]?.length || 10;
    setQuestionsPerSubject(prev => {
      const current = prev[sub] || 1;
      const newCount = increment
        ? Math.min(current + 1, maxQuestions)
        : Math.max(current - 1, 1);
      return { ...prev, [sub]: newCount };
    });
    setError('');
  };

  const handleNumberInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    min = 0,
    max?: number
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= min && (max === undefined || num <= max)) {
      setter(num.toString());
    }
  };

  const calculateTotalQuestions = () => {
    return selectedSubjects.reduce((sum, sub) => sum + (questionsPerSubject[sub] || 0), 0);
  };

  const getTimeFromDifficulty = () => {
    const totalQuestions = calculateTotalQuestions();
    const selectedDifficulty = difficultyLevels.find(d => d.value === difficulty);
    return totalQuestions * (selectedDifficulty?.timePerQuestion || 45);
  };

  const isFormValid = () => {
    const hasQuestions = selectedSubjects.every(
      sub => (questionsPerSubject[sub] || 0) > 0
    );
    const withinLimits = selectedSubjects.every(
      sub =>
        (questionsPerSubject[sub] || 0) <= (questionsPool[sub]?.length || 10)
    );
    return (
      selectedSubjects.length > 0 &&
      hasQuestions &&
      withinLimits &&
      !(examType === 'JAMB' && !selectedSubjects.includes('english')) &&
      !(['WAEC', 'NECO'].includes(examType) && !selectedSubjects.includes('math'))
    );
  };

  const handleStart = () => {
    if (!isFormValid()) {
      if (selectedSubjects.length === 0) {
        setError('Please select at least one subject.');
      } else if (examType === 'JAMB' && !selectedSubjects.includes('english')) {
        setError('English is compulsory for JAMB.');
      } else if (['WAEC', 'NECO'].includes(examType) && !selectedSubjects.includes('math')) {
        setError('Mathematics is compulsory for WAEC/NECO.');
      } else if (!selectedSubjects.every(sub => (questionsPerSubject[sub] || 0) > 0)) {
        setError('Number of questions cannot be zero for any subject.');
      } else {
        setError('One or more subjects have too many questions selected.');
      }
      return;
    }
    const timeInSec =
      timeMode === 'manual' && (hours || minutes || seconds)
        ? (parseInt(hours) || 0) * 3600 +
          (parseInt(minutes) || 0) * 60 +
          (parseInt(seconds) || 0)
        : getTimeFromDifficulty();
    if (timeInSec === 0) {
      setError('Calculated time is zero. Please adjust questions or difficulty.');
      return;
    }
    setTotalTime(timeInSec);
    generateQuestions();
    router.push('/quiz/home');
  };

  const handleReset = () => {
    resetQuiz();
    setHours('');
    setMinutes('');
    setSeconds('');
    setDifficulty('medium');
    setTimeMode('difficulty');
    setError('');
  };

  return (
    <motion.form
      onSubmit={e => e.preventDefault()}
      className="space-y-8 max-w-6xl  w-full mx-auto px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center text-sm"
            role="alert"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exam Type
      </motion.button>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subjects (Max {maxSubjects})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {route !== 'arts' && (
            <div>
              <h3 className="font-medium mb-3">Science Subjects</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {scienceSubjects.map(sub => (
                  <motion.div
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={sub}
                      checked={selectedSubjects.includes(sub)}
                      onCheckedChange={checked => handleSubjectChange(sub, Boolean(checked))}
                      disabled={
                        (sub === 'english' && examType === 'JAMB' && selectedSubjects.includes('english')) ||
                        (sub === 'math' && ['WAEC', 'NECO'].includes(examType) && selectedSubjects.includes('math'))
                      }
                      className="h-6 w-6"
                      aria-label={`Select ${sub.replace('_', ' ')}`}
                    />
                    <Label htmlFor={sub} className="capitalize text-md">
                      {sub.replace('_', ' ')}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {route !== 'science' && (
            <div>
              <h3 className="font-medium mb-3">Arts/Commercial/Languages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {artsSubjects.map(sub => (
                  <motion.div
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={sub}
                      checked={selectedSubjects.includes(sub)}
                      onCheckedChange={checked => handleSubjectChange(sub, Boolean(checked))}
                      disabled={
                        (sub === 'english' && examType === 'JAMB' && selectedSubjects.includes('english')) ||
                        (sub === 'math' && ['WAEC', 'NECO'].includes(examType) && selectedSubjects.includes('math'))
                      }
                      className="h-6 w-6"
                      aria-label={`Select ${sub.replace('_', ' ')}`}
                    />
                    <Label htmlFor={sub} className="capitalize text-md">
                      {sub.replace('_', ' ')}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions per Subject */}
      {selectedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Number of Questions per Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedSubjects.map(sub => (
                <div key={sub} className="flex flex-wrap items-center gap-2">
                  <span className="w-28 capitalize text-md">
                    {sub.replace('_', ' ')}
                    <span className="text-sm ml-1">
                      (Max {questionsPool[sub]?.length || 10})
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleQuestionCountAdjust(sub, false)}
                      disabled={questionsPerSubject[sub] <= 1}
                      className="h-12 w-12"
                      aria-label={`Decrease questions for ${sub.replace('_', ' ')}`}
                    >
                      <Minus size={20} />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      max={questionsPool[sub]?.length || 10}
                      value={questionsPerSubject[sub] || 0}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionCountChange(sub, e)}
                      className="w-24 text-center h-12 text-md"
                      aria-label={`Number of questions for ${sub.replace('_', ' ')}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleQuestionCountAdjust(sub, true)}
                      disabled={questionsPerSubject[sub] >= (questionsPool[sub]?.length || 10)}
                      className="h-12 w-12"
                      aria-label={`Increase questions for ${sub.replace('_', ' ')}`}
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Time Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={timeMode}
            onValueChange={(value: 'manual' | 'difficulty') => setTimeMode(value)}
            className="flex space-x-4 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="difficulty" id="difficulty" className="h-6 w-6" />
              <Label htmlFor="difficulty" className="text-md">Difficulty-Based</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" className="h-6 w-6" />
              <Label htmlFor="manual" className="text-md">Manual Time</Label>
            </div>
          </RadioGroup>

          <AnimatePresence mode="wait">
            {timeMode === 'difficulty' ? (
              <motion.div
                key="difficulty"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="difficulty-select" className="block text-md mb-2">
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger
                    id="difficulty-select"
                    className="h-16 w-full text-md"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value} className="text-md">
                        {level.label} ({level.timePerQuestion}s per question)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm">
                  Total time: {Math.floor(getTimeFromDifficulty() / 60)} min {getTimeFromDifficulty() % 60} sec
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="manual"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="block text-md mb-2">Custom Time Limit</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="hours" className="text-sm mb-1">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      placeholder="Hours"
                      value={hours}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberInput(e.target.value, setHours, 0)}
                      className="h-12 text-md"
                      aria-label="Hours"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minutes" className="text-sm mb-1">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      placeholder="Minutes"
                      value={minutes}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberInput(e.target.value, setMinutes, 0, 59)}
                      className="h-12 text-md"
                      aria-label="Minutes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seconds" className="text-sm mb-1">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      placeholder="Seconds"
                      value={seconds}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberInput(e.target.value, setSeconds, 0, 59)}
                      className="h-12 text-md"
                      aria-label="Seconds"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleStart}
          disabled={!isFormValid()}
          className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
        >
          <Play className="mr-2" size={18} />
          Start Quiz
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleReset}
          className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-base"
        >
          <RefreshCw className="mr-2" size={18} />
          Reset
        </motion.button>
      </div>
    </motion.form>
  );
}