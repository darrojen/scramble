import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingProps {
  message: string;
}

export default function LoadingSpinner({ message }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        <Loader2 className="animate-spin h-16 w-16 text-blue-500 mb-4" />
        <p className="text-lg font-medium">{message}</p>
      </motion.div>
    </div>
  );
}