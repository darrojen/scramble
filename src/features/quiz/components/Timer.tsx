'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <motion.span
      animate={{ color: timeLeft < 60 ? '#ef4444' : '#3b82f6' }}
      transition={{ duration: 0.5 }}
    >
      {formatTime(timeLeft)}
    </motion.span>
  );
}