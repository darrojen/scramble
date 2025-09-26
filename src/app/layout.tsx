


// 'use client';
// import './globals.css';
// import { ThemeProvider } from 'next-themes';
// import { Toaster } from 'sonner';
// import ModeToggle from '@/app/theme/page';
// import { useState, useEffect } from 'react';
// import { WifiOff } from 'lucide-react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // Create a QueryClient instance
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000,
//       gcTime: 10 * 60 * 1000,
//       retry: 2,
//       enabled: typeof window !== 'undefined' && navigator.onLine,
//     },
//   },
// });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const [isOnline, setIsOnline] = useState(true);

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     setIsOnline(navigator.onLine);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   return (
//     <html  lang="en">
//       <body suppressHydrationWarning className="relative">
//         <QueryClientProvider client={queryClient}>
//           <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//             {/* Offline Banner */}
//             {!isOnline && (
//               <div className="w-full bg-red-600 text-white p-2 text-center font-medium flex items-center justify-center fixed top-0 left-0 z-50 gap-2">
//                 <WifiOff className="w-5 h-5" />
//                 No internet connection. Please connect to the internet.
//               </div>
//             )}

//             {/* Content */}
//             <div className={`${!isOnline ? 'pt-10' : ''}`}>
//               <ModeToggle />
//               {children}
//             </div>

//             <Toaster />
//           </ThemeProvider>
//         </QueryClientProvider>
//       </body>
//     </html>
//   );
// }


'use client';

import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import ModeToggle from '@/app/theme/page';
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

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
    <html lang="en">
      <body suppressHydrationWarning className="relative">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            
            {/* Offline Banner with Animation */}
            <AnimatePresence>
              {!isOnline && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -80, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[500px]"
                >
                  <div className="flex absolute items-center gap-3 bg-white dark:bg-gray-900 border border-red-500 text-red-600 px-4 py-3 rounded-xl shadow-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                      <WifiOff className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">No Internet Connection</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Please check your connection and try again.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Page Content */}
            <div className={`${!isOnline ? 'pt-20' : ''} transition-all`}>
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
