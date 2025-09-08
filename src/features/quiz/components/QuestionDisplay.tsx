'use client';

import { useContext } from 'react';
import { motion } from 'framer-motion';
import { QuizContext } from '@/features/quiz/context/QuizContext';

export default function QuestionDisplay() {
  const { questions, userAnswers, setUserAnswers, currentSubject, currentIndices } = useContext(QuizContext);
  const currentIndex = currentIndices[currentSubject] || 0;
  const question = questions[currentSubject]?.[currentIndex];
  const selectedOption = userAnswers[currentSubject]?.[currentIndex] ?? -1;

  if (!question) return <p className="text-center text-gray-500">No questions available for this subject.</p>;

  const handleOptionChange = (optionIndex: number) => {
    const newAnswers = { ...userAnswers };
    newAnswers[currentSubject][currentIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  return (
    <motion.div
      key={`${currentSubject}-${currentIndex}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <label
            key={idx}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
              selectedOption === idx ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="option"
              checked={selectedOption === idx}
              onChange={() => handleOptionChange(idx)}
              className="form-radio h-5 w-5 text-blue-600 mr-3"
            />
            {opt}
          </label>
        ))}
      </div>
    </motion.div>
  );
}