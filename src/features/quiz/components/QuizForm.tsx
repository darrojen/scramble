'use client';

import { useContext, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Play, AlertCircle, RefreshCw, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import questionsPool from '@/lib/questions';
import { QuizContext } from '@/features/quiz/context/QuizContext';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface QuizFormProps {
  route: string;
  examType: string;
}

export default function QuizForm({ route, examType }: QuizFormProps) {
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
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [error, setError] = useState('');

  // const availableSubjects =
  //   route === 'science'
  //     ? scienceSubjects
  //     : route === 'arts'
  //     ? artsSubjects
  //     : [...scienceSubjects, ...artsSubjects];

  const maxSubjects =
    examType === 'WAEC' || examType === 'NECO'
      ? 9
      : examType === 'JAMB'
      ? 4
      : Infinity;

  const handleSubjectChange = (sub: string, checked: boolean) => {
    if (['JAMB', 'WAEC', 'NECO'].includes(examType) && sub === 'english' && !checked) {
      setError(`${examType} requires English.`);
      return;
    }
    if (['WAEC', 'NECO'].includes(examType) && sub === 'math' && !checked) {
      setError(`${examType} requires Mathematics.`);
      return;
    }

    const newSubjects = checked
      ? [...selectedSubjects, sub]
      : selectedSubjects.filter((s) => s !== sub);

    if (checked && newSubjects.length > maxSubjects) {
      setError(`Maximum ${maxSubjects} subjects allowed for ${examType}.`);
      return;
    }

    setSelectedSubjects(newSubjects);
    setQuestionsPerSubject((prev) => {
      const updated = { ...prev };
      if (!checked) {
        delete updated[sub];
      } else if (!(sub in updated)) {
        updated[sub] = 1;
      }
      return updated;
    });
    setError('');
  };

  const handleQuestionCountChange = (sub: string, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = value === '' ? 0 : parseInt(value, 10);
    const max = questionsPool[sub]?.length || 10;

    if (value === '' || (!isNaN(num) && num >= 0 && num <= max)) {
      setQuestionsPerSubject((prev) => ({ ...prev, [sub]: num }));
      setError('');
    } else if (!isNaN(num) && num > max) {
      setError(`Only ${max} questions available for ${sub.replace('_', ' ')}.`);
    }
  };

  const handleQuestionCountAdjust = (sub: string, increment: boolean) => {
    const max = questionsPool[sub]?.length || 10;
    setQuestionsPerSubject((prev) => {
      const current = prev[sub] || 1;
      const next = increment
        ? Math.min(current + 1, max)
        : Math.max(current - 1, 1);
      return { ...prev, [sub]: next };
    });
    setError('');
  };

  const isFormValid = () => {
    const hasQuestions = selectedSubjects.every(
      (sub) => (questionsPerSubject[sub] || 0) > 0
    );
    const withinLimits = selectedSubjects.every(
      (sub) => (questionsPerSubject[sub] || 0) <= (questionsPool[sub]?.length || 10)
    );
    return selectedSubjects.length > 0 && hasQuestions && withinLimits;
  };

  const handleStart = () => {
    setError('');
    if (!isFormValid()) {
      setError('Please complete all required fields correctly.');
      return;
    }
    const totalQuestions = selectedSubjects.reduce((acc, sub) => acc + (questionsPerSubject[sub] || 0), 0);
    const timePerQuestion = 180; // 3 minutes per question
    const timeInSec = totalQuestions * timePerQuestion;
    setTotalTime(timeInSec);
    generateQuestions();
    router.push('/main/quiz/home');
  };

  const handleReset = () => {
    resetQuiz();
    setDifficulty('Medium');
    setError('');
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className=" space-y-8 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center text-sm"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </motion.div>
      )}

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {route !== 'arts' && (
            <div>
              <h3 className="font-medium mb-3">Science Subjects</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {scienceSubjects.map((sub) => (
                  <motion.div
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={selectedSubjects.includes(sub)}
                      onCheckedChange={(checked) => handleSubjectChange(sub, Boolean(checked))}
                      id={sub}
                    />
                    <Label htmlFor={sub} className="capitalize">
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
                {artsSubjects.map((sub) => (
                  <motion.div
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={selectedSubjects.includes(sub)}
                      onCheckedChange={(checked) => handleSubjectChange(sub, Boolean(checked))}
                      id={sub}
                    />
                    <Label htmlFor={sub} className="capitalize">
                      {sub.replace('_', ' ')}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions per subject */}
      {selectedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Number of Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedSubjects.map((sub) => (
                <div key={sub} className="flex flex-wrap items-center gap-2">
                  <span className="capitalize w-28">{sub.replace('_', ' ')}</span>
                  <Button
                    type="button"
                    className='cursor-pointer'
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuestionCountAdjust(sub, false)}
                    disabled={questionsPerSubject[sub] <= 1}
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    max={questionsPool[sub]?.length || 10}
                    value={questionsPerSubject[sub] || 0}
                    onChange={(e) => handleQuestionCountChange(sub, e)}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    className='cursor-pointer'
                    size="icon"
                    variant="outline"
                    onClick={() => handleQuestionCountAdjust(sub, true)}
                    disabled={questionsPerSubject[sub] >= (questionsPool[sub]?.length || 10)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={difficulty} onValueChange={(val: 'Easy' | 'Medium' | 'Hard') => setDifficulty(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy (4 min/question)</SelectItem>
              <SelectItem value="Medium">Medium (3 min/question)</SelectItem>
              <SelectItem value="Hard">Hard (2 min/question)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={handleStart}
          disabled={!isFormValid()}
          className=" cursor-pointer flex-1"
        >
          <Play className="mr-2 h-4 w-4" /> Start Quiz
        </Button>
        <Button type="button" onClick={handleReset} variant="outline" className="flex-1">
          <RefreshCw className=" cursor-pointer mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </form>
  );
}