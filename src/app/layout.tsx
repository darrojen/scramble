


'use client';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import ModeToggle from '@/app/theme/page';
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      enabled: typeof window !== 'undefined' && navigator.onLine,
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <html  lang="en">
      <body suppressHydrationWarning className="relative">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Offline Banner */}
            {!isOnline && (
              <div className="w-full bg-red-600 text-white p-2 text-center font-medium flex items-center justify-center fixed top-0 left-0 z-50 gap-2">
                <WifiOff className="w-5 h-5" />
                No internet connection. Please connect to the internet.
              </div>
            )}

            {/* Content */}
            <div className={`${!isOnline ? 'pt-10' : ''}`}>
              <ModeToggle />
              {children}
            </div>

            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}