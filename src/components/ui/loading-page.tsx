'use client'

import Box from './box'

interface LoadingPageProps {
  message?: string
}

export default function LoadingPage({ message = 'Loading' }: LoadingPageProps) {
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-6">
      <Box className="animate-spin h-12 w-12 border-4 border-t-primary border-gray-200 rounded-full mb-4" />
      <Box className="text-lg font-medium">{message}</Box>
    </Box>
  )
}
