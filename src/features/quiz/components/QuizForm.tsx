
'use client';

import { useContext, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Play, AlertCircle, RefreshCw, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import questionsPool from '@/lib/questions';
import { QuizContext } from '@/features/quiz/context/QuizContext';

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
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');

  const availableSubjects =
    route === 'science'
      ? scienceSubjects
      : route === 'arts'
      ? artsSubjects
      : [...scienceSubjects, ...artsSubjects];

  const maxSubjects =
    examType === 'WAEC' || examType === 'NECO'
      ? 9
      : examType === 'JAMB'
      ? 4
      : Infinity;

  const handleSubjectChange = (sub: string, checked: boolean) => {
    if (examType === 'JAMB' && sub === 'english' && !checked) {
      setError('English is compulsory for JAMB.');
      return;
    }
    if (examType === 'WAEC' && sub === 'english' && !checked) {
      setError('English is compulsory for WAEC.');
      return;
    }
    if (examType === 'NECO' && sub === 'english' && !checked) {
      setError('English is compulsory for NECO.');
      return;
    }
    if (examType === 'WAEC' && sub === 'math' && !checked) {
      setError('Mathematics is compulsory for WAEC.');
      return;
    }
    if (examType === 'NECO' && sub === 'math' && !checked) {
      setError('Mathematics is compulsory for NECO.');
      return;
    }
    const newSubjects = checked
      ? [...selectedSubjects, sub]
      : selectedSubjects.filter(s => s !== sub);
    if (checked && newSubjects.length > maxSubjects) {
      setError(`Maximum ${maxSubjects} subjects allowed for ${examType}.`);
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

  const handleQuestionCountChange = (
    sub: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const num = value === '' ? 0 : parseInt(value, 10);
    const maxQuestions = questionsPool[sub]?.length || 10;
    if (value === '' || (!isNaN(num) && num >= 0 && num <= maxQuestions)) {
      setQuestionsPerSubject(prev => ({ ...prev, [sub]: num }));
      setError('');
    } else if (!isNaN(num) && num > maxQuestions) {
      setError(
        `Only ${maxQuestions} questions available for ${sub.replace('_', ' ')}.`
      );
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

  const isFormValid = () => {
    const timeInSec =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    const hasQuestions = selectedSubjects.every(
      sub => (questionsPerSubject[sub] || 0) > 0
    );
    const withinLimits = selectedSubjects.every(
      sub =>
        (questionsPerSubject[sub] || 0) <= (questionsPool[sub]?.length || 10)
    );
    return (
      selectedSubjects.length > 0 &&
      timeInSec > 0 &&
      hasQuestions &&
      withinLimits
    );
  };

  const handleStart = () => {
    setError('');
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject.');
      return;
    }
    if (examType === 'JAMB' && !selectedSubjects.includes('english')) {
      setError('English is compulsory for JAMB.');
      return;
    }
    if (!selectedSubjects.every(sub => (questionsPerSubject[sub] || 0) > 0)) {
      setError('Number of questions cannot be zero for any subject.');
      return;
    }
    if (
      !selectedSubjects.every(
        sub =>
          (questionsPerSubject[sub] || 0) <= (questionsPool[sub]?.length || 10)
      )
    ) {
      setError('One or more subjects have too many questions selected.');
      return;
    }
    const timeInSec =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    if (timeInSec === 0) {
      setError('Please set a valid time (at least 1 second).');
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
    setError('');
  };

  return (
    <form
      onSubmit={e => e.preventDefault()}
      className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
    >
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center text-red-500 dark:text-red-400 text-sm sm:text-base"
        >
          <AlertCircle className="mr-2" size={18} />
          {error}
        </motion.p>
      )}

      {/* Subjects */}
      <div>
        <label className="block text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Select Subjects
        </label>
        <div className="space-y-4">
          {route !== 'arts' && (
            <div>
              <h3 className="text-md sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Science Subjects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {scienceSubjects.map(sub => (
                  <motion.label
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(sub)}
                      onChange={e => handleSubjectChange(sub, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                    />
                    <span className="capitalize text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      {sub.replace('_', ' ')}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          )}
          {route !== 'science' && (
            <div>
              <h3 className="text-md sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Arts/Commercial/Languages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {artsSubjects.map(sub => (
                  <motion.label
                    key={sub}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(sub)}
                      onChange={e => handleSubjectChange(sub, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                    />
                    <span className="capitalize text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      {sub.replace('_', ' ')}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions per subject */}
      {selectedSubjects.length > 0 && (
        <div>
          <label className="block text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Number of Questions
          </label>
          <div className="space-y-4">
            {selectedSubjects.map(sub => (
              <div
                key={sub}
                className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0"
              >
                <span className="capitalize text-gray-800 dark:text-gray-200 text-sm sm:text-base sm:w-40">
                  {sub.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <motion.button
                    type="button"
                    onClick={() => handleQuestionCountAdjust(sub, false)}
                    disabled={questionsPerSubject[sub] <= 1}
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-l-lg disabled:opacity-50"
                  >
                    <Minus size={16} className="text-gray-800 dark:text-gray-200" />
                  </motion.button>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    min={0}
                    max={questionsPool[sub]?.length || 10}
                    value={questionsPerSubject[sub] || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleQuestionCountChange(sub, e)
                    }
                    className="w-20 p-2 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm sm:text-base"
                  />
                  <motion.button
                    type="button"
                    onClick={() => handleQuestionCountAdjust(sub, true)}
                    disabled={
                      questionsPerSubject[sub] >=
                      (questionsPool[sub]?.length || 10)
                    }
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-r-lg disabled:opacity-50"
                  >
                    <Plus size={16} className="text-gray-800 dark:text-gray-200" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time limit */}
      <div>
        <label className="block text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Time Limit
        </label>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            placeholder="Hours"
            value={hours}
            onChange={e => handleNumberInput(e.target.value, setHours, 0)}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            placeholder="Minutes"
            value={minutes}
            onChange={e => handleNumberInput(e.target.value, setMinutes, 0, 59)}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            placeholder="Seconds"
            value={seconds}
            onChange={e => handleNumberInput(e.target.value, setSeconds, 0, 59)}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleStart}
          disabled={!isFormValid()}
          className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 sm:py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition text-sm sm:text-base"
        >
          <Play className="mr-2" size={16} /> Start Quiz
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleReset}
          className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base"
        >
          <RefreshCw className="mr-2" size={16} /> Reset
        </motion.button>
      </div>
    </form>
  );
}
