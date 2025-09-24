// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { motion } from 'framer-motion';
// import { BatteryCharging, ArrowRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import { useTheme } from 'next-themes';

// // Network Background Component (Enhanced with Lines)
// function NetworkBackground({ mouse }: { mouse: { x: number; y: number } }) {
//   const meshRef = useRef<THREE.Points>(null);
//   const linesRef = useRef<THREE.LineSegments>(null);
//   const particles = 100; // Fewer for performance, premium feel

//   useEffect(() => {
//     if (meshRef.current && linesRef.current) {
//       const positions = new Float32Array(particles * 3);
//       const linePositions = new Float32Array(particles * 6); // For connecting lines
//       for (let i = 0; i < particles; i++) {
//         positions[i * 3] = (Math.random() - 0.5) * 15;
//         positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
//         positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
//         if (i > 0) {
//           linePositions[(i - 1) * 6] = positions[(i - 1) * 3];
//           linePositions[(i - 1) * 6 + 1] = positions[(i - 1) * 3 + 1];
//           linePositions[(i - 1) * 6 + 2] = positions[(i - 1) * 3 + 2];
//           linePositions[(i - 1) * 6 + 3] = positions[i * 3];
//           linePositions[(i - 1) * 6 + 4] = positions[i * 3 + 1];
//           linePositions[(i - 1) * 6 + 5] = positions[i * 3 + 2];
//         }
//       }
//       meshRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//       linesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
//     }
//   }, []);

//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y = mouse.x * Math.PI / 10;
//       meshRef.current.rotation.x = mouse.y * Math.PI / 10;
//       meshRef.current.position.z = Math.sin(state.clock.getElapsedTime() / 2) * 2;
//     }
//     if (linesRef.current) {
//       linesRef.current.rotation.copy(meshRef.current.rotation);
//       linesRef.current.position.copy(meshRef.current.position);
//     }
//   });

//   return (
//     <>
//       <points ref={meshRef}>
//         <bufferGeometry />
//         <pointsMaterial color="#1E40AF" size={0.1} transparent={true} opacity={0.9} />
//       </points>
//       <lineSegments ref={linesRef}>
//         <bufferGeometry />
//         <lineBasicMaterial color="#60A5FA" transparent={true} opacity={0.5} />
//       </lineSegments>
//     </>
//   );
// }

// function BackgroundCanvas({ mouse }: { mouse: { x: number; y: number } }) {
//   return (
//     <Canvas
//       camera={{ position: [0, 0, 15], fov: 60 }}
//       className="absolute inset-0 h-full w-full"
//     >
//       <ambientLight intensity={0.4} />
//       <NetworkBackground mouse={mouse} />
//     </Canvas>
//   );
// }

// // Page 1: Points Gained
// function PointsPage({ currentStreak, onNext, mouse }: { currentStreak: number; onNext: () => void; mouse: { x: number; y: number } }) {
//   const { theme } = useTheme();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className={`flex flex-col items-center justify-center min-h-screen w-full text-center relative z-10 ${
//         theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
//       }`}
//     >
//       <header className="w-full py-4 bg-gray-50 dark:bg-gray-800 shadow-md">
//         <div className="container mx-auto px-4 flex items-center justify-between">
//           <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Logo</span>
//         </div>
//       </header>
//       <div className="flex-1 flex items-center justify-center px-4">
//         <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
//           <div className="h-48 w-full mb-6 relative">
//             <BackgroundCanvas mouse={mouse} />
//           </div>
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
//             Streak Reactivated
//           </h1>
//           <p className="text-sm sm:text-base md:text-lg mb-4 text-gray-600 dark:text-gray-300">
//             {currentStreak === 1
//               ? "You've started your streak."
//               : `${currentStreak} days in a row.`}
//           </p>
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="text-lg sm:text-xl md:text-2xl font-medium text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2"
//           >
//             +4 <BatteryCharging className="h-5 w-5 sm:h-6 sm:w-6" />
//           </motion.div>
//           <Button
//             onClick={onNext}
//             className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
//             aria-label="View weekly streak"
//           >
//             Next <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // Page 2: Week View (Matches Image with Pro Design)
// function WeekViewPage({ onContinue }: { onContinue: () => void }) {
//   const { theme } = useTheme();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={`flex flex-col items-center justify-center min-h-screen w-full text-center relative z-10 ${
//         theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
//       }`}
//     >
//       <header className="w-full py-4 bg-gray-50 dark:bg-gray-800 shadow-md">
//         <div className="container mx-auto px-4 flex items-center justify-between">
//           <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Logo</span>
//         </div>
//       </header>
//       <div className="flex-1 flex items-center justify-center px-4">
//         <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
//           <div className="h-48 w-full mb-6 relative">
//             <BackgroundCanvas mouse={{ x: 0, y: 0 }} /> {/* Static for consistency */}
//           </div>
//           <div className="mb-6">
//             <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">1</span>
//           </div>
//           <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-6">Streak reactivated!</p>
//           <div className="flex justify-center gap-4 mb-8">
//             <div className="flex flex-col items-center">
//               <BatteryCharging className="h-8 w-8 text-green-600" />
//               <span className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-300">T</span>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="h-8 w-8 rounded-full border-2 border-gray-300 dark:border-gray-600" />
//               <span className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-300">W</span>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="h-8 w-8 rounded-full border-2 border-gray-300 dark:border-gray-600" />
//               <span className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-300">Th</span>
//             </div>
//           </div>
//           <Button
//             onClick={onContinue}
//             className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm sm:text-base font-medium transition-colors"
//             aria-label="Continue to quiz results"
//           >
//             Continue
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function Streaks() {
//   const [streakData, setStreakData] = useState<any>(null);
//   const [page, setPage] = useState<'points' | 'week'>('points');
//   const [mouse, setMouse] = useState({ x: 0, y: 0 });
//   const router = useRouter();
//   const { theme } = useTheme();

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       const { innerWidth: width, innerHeight: height } = window;
//       setMouse({
//         x: (e.clientX / width) * 2 - 1,
//         y: -(e.clientY / height) * 2 + 1,
//       });
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   useEffect(() => {
//     async function fetchStreak() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/login');
//         return;
//       }
//       const { data } = await supabase
//         .from('streaks')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();
//       setStreakData(data);
//     }
//     fetchStreak();
//   }, [router]);

//   if (!streakData) return <LoadingSpinner message="" />;

//   const currentStreak = streakData.current_streak;

//   return (
//     <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 ml-0 md:ml-64"> {/* Adjust ml-64 to match your sidebar width */}
//       <BackgroundCanvas mouse={mouse} />
//       {page === 'points' ? (
//         <PointsPage currentStreak={currentStreak} onNext={() => setPage('week')} mouse={mouse} />
//       ) : (
//         <WeekViewPage onContinue={() => router.push('/main/quiz/result')} />
//       )}
//     </div>
//   );
// }



'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { BatteryCharging, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

//
// Types
//
interface MousePosition {
  x: number;
  y: number;
}

interface PointsPageProps {
  currentStreak: number;
  onNext: () => void;
  mouse: MousePosition;
}

interface WeekViewPageProps {
  onContinue: () => void;
}

//
// Network Background
//
function NetworkBackground({ mouse }: { mouse: MousePosition }) {
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const PARTICLES = 100;

  useEffect(() => {
    if (!meshRef.current || !linesRef.current) return;

    const positions = new Float32Array(PARTICLES * 3);
    const linePositions = new Float32Array(PARTICLES * 6);

    for (let i = 0; i < PARTICLES; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      if (i > 0) {
        const baseIndex = (i - 1) * 6;
        linePositions[baseIndex] = positions[(i - 1) * 3];
        linePositions[baseIndex + 1] = positions[(i - 1) * 3 + 1];
        linePositions[baseIndex + 2] = positions[(i - 1) * 3 + 2];
        linePositions[baseIndex + 3] = positions[i * 3];
        linePositions[baseIndex + 4] = positions[i * 3 + 1];
        linePositions[baseIndex + 5] = positions[i * 3 + 2];
      }
    }

    meshRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    linesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !linesRef.current) return;

    const { x, y } = mouse;
    meshRef.current.rotation.y = x * Math.PI / 10;
    meshRef.current.rotation.x = y * Math.PI / 10;
    meshRef.current.position.z = Math.sin(state.clock.getElapsedTime() / 2) * 2;

    linesRef.current.rotation.copy(meshRef.current.rotation);
    linesRef.current.position.copy(meshRef.current.position);
  });

  return (
    <>
      <points ref={meshRef}>
        <bufferGeometry />
        <pointsMaterial color="#1E40AF" size={0.1} transparent opacity={0.9} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#60A5FA" transparent opacity={0.5} />
      </lineSegments>
    </>
  );
}

function BackgroundCanvas({ mouse }: { mouse: MousePosition }) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} className="absolute inset-0 h-full w-full">
      <ambientLight intensity={0.4} />
      <NetworkBackground mouse={mouse} />
    </Canvas>
  );
}

//
// UI Components
//
function AppHeader() {
  return (
    <header className="w-full py-4 bg-gray-50 dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Logo</span>
      </div>
    </header>
  );
}

//
// Page 1: Points
//
function PointsPage({ currentStreak, onNext, mouse }: PointsPageProps) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex flex-col items-center justify-center min-h-screen text-center relative z-10 ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}
    >
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="h-48 w-full mb-6 relative">
            <BackgroundCanvas mouse={mouse} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Streak Reactivated</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {currentStreak === 1 ? "You've started your streak." : `${currentStreak} days in a row.`}
          </p>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-6 flex items-center justify-center gap-2"
          >
            +4 <BatteryCharging className="h-6 w-6" />
          </motion.div>

          <Button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2"
            aria-label="View weekly streak"
          >
            Next <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </motion.div>
  );
}

//
// Page 2: Week View
//
function WeekViewPage({ onContinue }: WeekViewPageProps) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center min-h-screen text-center relative z-10 ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}
    >
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="h-48 w-full mb-6 relative">
            <BackgroundCanvas mouse={{ x: 0, y: 0 }} />
          </div>

          <div className="mb-6 text-4xl font-bold">1</div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Streak reactivated!</p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <BatteryCharging className="h-8 w-8 text-green-600" />
              <span className="text-sm mt-1">T</span>
            </div>
            {['W', 'Th'].map((day) => (
              <div key={day} className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                <span className="text-sm mt-1">{day}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={onContinue}
            className="w-full"
            aria-label="Continue to quiz results"
          >
            Continue
          </Button>
        </div>
      </main>
    </motion.div>
  );
}

//
// Main Container
//
export default function Streaks() {
  const [streakData, setStreakData] = useState<any>(null);
  const [page, setPage] = useState<'points' | 'week'>('points');
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 });
  const router = useRouter();

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch streak
  useEffect(() => {
    async function fetchStreak() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setStreakData(data);
    }
    fetchStreak();
  }, [router]);

  if (!streakData) return <LoadingSpinner message="" />;

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackgroundCanvas mouse={mouse} />
      {page === 'points' ? (
        <PointsPage currentStreak={streakData.current_streak} onNext={() => setPage('week')} mouse={mouse} />
      ) : (
        <WeekViewPage onContinue={() => router.push('/main/quiz/result')} />
      )}
    </div>
  );
}
