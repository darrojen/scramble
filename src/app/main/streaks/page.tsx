// // /app/main/streaks/page.tsx
// 'use client';

// import { BatteryCharging, X } from 'lucide-react';
// import { useEffect, useState } from 'react';

// import { Button } from '@/components/ui/button';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import { motion } from 'framer-motion';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';

// export default function Streaks() {
//   const [streakData, setStreakData] = useState<any>(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchStreak() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/login'); // or handle unauth
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

//   if (!streakData) {
//     return <LoadingSpinner message="" />;
//   }

//   const currentStreak = streakData.current_streak;

//   // Weekly display logic
//   const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
//   const today = new Date();
//   const todayStr = today.toISOString().split('T')[0];
//   const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
//   const offset = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
//   const monday = new Date(today);
//   monday.setDate(today.getDate() + offset);

//   const weekDates: string[] = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     weekDates.push(d.toISOString().split('T')[0]);
//   }

//   const streakStart = new Date(today);
//   streakStart.setDate(today.getDate() - (currentStreak - 1));
//   const streakStartStr = streakStart.toISOString().split('T')[0];

//   const isTodayFunc = (dateStr: string) => dateStr === todayStr;
//   const isPast = (dateStr: string) => new Date(dateStr) < today;
//   const isActive = (dateStr: string) => dateStr >= streakStartStr && dateStr <= todayStr;

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="card max-w-3xl w-full p-4 sm:p-6 md:p-8 text-center"
//       >
//         {/* Bot Placeholder */}
//         <div className="h-64 w-full bg-gray-200 flex items-center justify-center mb-6">
//           {/* Three.js Bot Character Here - Integrate @react-three/fiber for actual 3D model */}
//           <p className="text-xl font-bold">Bot congratulates you!</p>
//         </div>

//         <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
//         <p className="text-xl mb-2">
//           {currentStreak === 1 ? "You've started your streak!" : `You've extended your streak to ${currentStreak} days!`}
//         </p>
//         <p className="text-lg mb-6">You earned 4 points!</p>

//         {/* Weekly Display */}
//         <div className="flex justify-around mb-8">
//           {dayLabels.map((label, idx) => {
//             const dateStr = weekDates[idx];
//             const isTod = isTodayFunc(dateStr);
//             const active = isActive(dateStr);
//             const past = isPast(dateStr);
//             let icon = null;
//             if (active) {
//               icon = <BatteryCharging className="h-6 w-6 text-green-500" />;
//             } else if (past) {
//               icon = <X className="h-6 w-6 text-red-500" />;
//             }
//             return (
//               <div key={idx} className={`flex flex-col items-center ${isTod ? 'font-bold' : ''}`}>
//                 {icon}
//                 <span>{label}</span>
//               </div>
//             );
//           })}
//         </div>

//         <Button onClick={() => router.push('/main/quiz/result')} className="mt-4">
//           Continue to Results
//         </Button>
//       </motion.div>
//     </div>
//   );
// }




// 'use client';

// import * as THREE from 'three';

// import { BatteryCharging, X } from 'lucide-react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Float, OrbitControls } from '@react-three/drei';
// import { useEffect, useRef, useState } from 'react';

// import { Button } from '@/components/ui/button';
// import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
// import { motion } from 'framer-motion';
// import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation';
// import { useTheme } from 'next-themes';

// function BotAvatar() {
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame((_, delta) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y += delta * 0.3;
//     }
//   });

//   return (
//     <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
//       <mesh ref={meshRef}>
//         <sphereGeometry args={[1, 32, 32]} />
//         <meshStandardMaterial
//           color="#4CAF50"
//           metalness={0.6}
//           roughness={0.4}
//           emissive="#2E7D32"
//           emissiveIntensity={0.3}
//         />
//       </mesh>
//     </Float>
//   );
// }

// function BotAvatar3D() {
//   return (
//     <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[2, 2, 3]} intensity={1} />
//       <BotAvatar />
//       <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
//     </Canvas>
//   );
// }

// export default function Streaks() {
//   const [streakData, setStreakData] = useState<any>(null);
//   const router = useRouter();
//   const { theme } = useTheme();

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

//   if (!streakData) {
//     return <LoadingSpinner message="" />;
//   }

//   const currentStreak = streakData.current_streak;

//   // Weekly display logic
//   const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
//   const today = new Date();
//   const todayStr = today.toISOString().split('T')[0];
//   const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
//   const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
//   const monday = new Date(today);
//   monday.setDate(today.getDate() + offset);

//   const weekDates: string[] = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     weekDates.push(d.toISOString().split('T')[0]);
//   }

//   const streakStart = new Date(today);
//   streakStart.setDate(today.getDate() - (currentStreak - 1));
//   const streakStartStr = streakStart.toISOString().split('T')[0];

//   const isTodayFunc = (dateStr: string) => dateStr === todayStr;
//   const isPast = (dateStr: string) => new Date(dateStr) < today;
//   const isActive = (dateStr: string) => dateStr >= streakStartStr && dateStr <= todayStr;

//   return (
//     <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className={`card max-w-3xl w-full p-4 sm:p-6 md:p-8 text-center ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'} rounded-2xl shadow-xl`}
//       >
//         {/* Bot Avatar */}
//         <motion.div
//           initial={{ scale: 0.8 }}
//           animate={{ scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="h-48 w-full flex items-center justify-center mb-6"
//         >
//           <BotAvatar3D />
//         </motion.div>

//         <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
//         <p className="text-xl mb-2">
//           {currentStreak === 1 ? "You've started your streak!" : `You've extended your streak to ${currentStreak} days!`}
//         </p>
//         <p className="text-lg mb-6">You earned 4 points!</p>

//         {/* Weekly Display */}
//         <div className="flex justify-around mb-8">
//           {dayLabels.map((label, idx) => {
//             const dateStr = weekDates[idx];
//             const isTod = isTodayFunc(dateStr);
//             const active = isActive(dateStr);
//             const past = isPast(dateStr);
//             let icon = null;
//             if (active) {
//               icon = <BatteryCharging className="h-6 w-6 text-green-500" />;
//             } else if (past) {
//               icon = <X className="h-6 w-6 text-red-500" />;
//             }
//             return (
//               <div key={idx} className={`flex flex-col items-center ${isTod ? 'font-bold' : ''}`}>
//                 {icon}
//                 <span>{label}</span>
//               </div>
//             );
//           })}
//         </div>

//         <Button
//           onClick={() => router.push('/main/quiz/result')}
//           className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all duration-300 shadow-md"
//         >
//           Continue to Results
//         </Button>
//       </motion.div>
//     </div>
//   );
// }


'use client';

import * as THREE from 'three';

import { BatteryCharging, X } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

function BotAvatar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#4CAF50"
          metalness={0.6}
          roughness={0.4}
          emissive="#2E7D32"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function BotAvatar3D() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 3]} intensity={1} />
      <BotAvatar />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}

export default function Streaks() {
  const [streakData, setStreakData] = useState<Record<string | undefined>>(null);
  const router = useRouter();
  const { theme } = useTheme();

  // --- Count-up animation for points ---
  const points = 4; // You can make this dynamic later
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.floor(latest));

  useEffect(() => {
    const controls = animate(count, points, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [points, count]);

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

  if (!streakData) {
    return <LoadingSpinner message="" />;
  }

  const currentStreak = streakData.current_streak;

  // Weekly display logic
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay();
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  const streakStart = new Date(today);
  streakStart.setDate(today.getDate() - (currentStreak - 1));
  const streakStartStr = streakStart.toISOString().split('T')[0];

  const isTodayFunc = (dateStr: string) => dateStr === todayStr;
  const isPast = (dateStr: string) => new Date(dateStr) < today;
  const isActive = (dateStr: string) => dateStr >= streakStartStr && dateStr <= todayStr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`card max-w-3xl w-full p-4 sm:p-6 md:p-8 text-center ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'
        } rounded-2xl shadow-xl`}
      >
        {/* Bot Avatar */}
        <div className="h-48 w-full flex items-center justify-center mb-6">
          <BotAvatar3D />
        </div>

        <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
        <p className="text-xl mb-2">
          {currentStreak === 1
            ? "You've started your streak!"
            : `You've extended your streak to ${currentStreak} days!`}
        </p>

        {/* --- Animated Points Display --- */}
        <motion.p
          className="text-5xl font-extrabold text-green-500 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          +<motion.span>{rounded}</motion.span>
        </motion.p>

        {/* Weekly Display */}
        <div className="flex justify-around mb-8">
          {dayLabels.map((label, idx) => {
            const dateStr = weekDates[idx];
            const isTod = isTodayFunc(dateStr);
            const active = isActive(dateStr);
            const past = isPast(dateStr);
            let icon = null;
            if (active) {
              icon = <BatteryCharging className="h-6 w-6 text-green-500" />;
            } else if (past) {
              icon = <X className="h-6 w-6 text-red-500" />;
            }
            return (
              <div
                key={idx}
                className={`flex flex-col items-center ${
                  isTod ? 'font-bold text-blue-500' : ''
                }`}
              >
                {icon}
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push('/main/quiz/result')}
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all duration-300 shadow-md"
        >
          Continue to Results
        </Button>
      </motion.div>
    </motion.div>
  );
}



// 'use client';
// import { BatteryCharging, X } from 'lucide-react';

// import * as THREE from 'three';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Float, OrbitControls, Points, PointMaterial } from '@react-three/drei';
// import { useEffect, useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
// import { useTheme } from 'next-themes';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';
// import Lottie from 'lottie-react';
// import fingerAnimation from './finger-loading.json'; // Assume this is a finger-pointing Lottie file

// function BotAvatar() {
//   const meshRef = useRef<THREE.Mesh>(null);

//   useFrame((_, delta) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y += delta * 0.3;
//     }
//   });

//   return (
//     <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
//       <mesh ref={meshRef}>
//         <sphereGeometry args={[1, 32, 32]} />
//         <meshStandardMaterial
//           color="#4CAF50"
//           metalness={0.6}
//           roughness={0.4}
//           emissive="#2E7D32"
//           emissiveIntensity={0.3}
//         />
//       </mesh>
//     </Float>
//   );
// }

// function OrbitingParticles() {
//   const pointsRef = useRef<THREE.Points>(null);
//   const particles = Array.from({ length: 50 }, () => [
//     (Math.random() - 0.5) * 5,
//     (Math.random() - 0.5) * 5,
//     (Math.random() - 0.5) * 5,
//   ]);

//   useFrame((_, delta) => {
//     if (pointsRef.current) {
//       pointsRef.current.rotation.y += delta * 0.2;
//     }
//   });

//   return (
//     <Points ref={pointsRef}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           count={particles.length}
//           array={new Float32Array(particles.flat())}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <PointMaterial
//         size={0.1}
//         color="#00ffcc"
//         transparent
//         opacity={0.8}
//         sizeAttenuation
//       />
//     </Points>
//   );
// }

// function BotAvatar3D() {
//   return (
//     <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[2, 2, 3]} intensity={1} />
//       <BotAvatar />
//       <OrbitingParticles />
//       <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
//     </Canvas>
//   );
// }

// export default function Streaks() {
//   const [streakData, setStreakData] = useState<any>(null);
//   const [pointsEarned, setPointsEarned] = useState(0);
//   const router = useRouter();
//   const { theme } = useTheme();

//   // Count-up animation for points
//   const count = useMotionValue(0);
//   const rounded = useTransform(count, latest => Math.floor(latest));

//   useEffect(() => {
//     async function fetchStreak() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/auth/login');
//         return;
//       }
//       const { data, error } = await supabase
//         .from('streaks')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();
//       if (error) {
//         console.error('Streak fetch error:', error.message);
//         return;
//       }
//       setStreakData(data);

//       // Calculate points earned (4 points daily + streak milestone points)
//       const dailyPoints = 4;
//       const streakPoints = [7, 30, 100].includes(data.current_streak) ? [5, 15, 50][Math.floor((data.current_streak - 1) / 7)] : 0;
//       const totalPoints = dailyPoints + (streakPoints || 0);
//       setPointsEarned(totalPoints);
//       animate(count, totalPoints, { duration: 1.2, ease: 'easeOut' });
//     }
//     fetchStreak();
//   }, [router, count]);

//   if (!streakData) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <Lottie animationData={fingerAnimation} loop autoplay style={{ width: 200, height: 200 }} />
//       </div>
//     );
//   }

//   const currentStreak = streakData.current_streak;

//   // Weekly display logic
//   const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
//   const today = new Date();
//   const todayStr = today.toISOString().split('T')[0];
//   const dayOfWeek = today.getDay();
//   const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
//   const monday = new Date(today);
//   monday.setDate(today.getDate() + offset);

//   const weekDates: string[] = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     weekDates.push(d.toISOString().split('T')[0]);
//   }

//   const streakStart = new Date(today);
//   streakStart.setDate(today.getDate() - (currentStreak - 1));
//   const streakStartStr = streakStart.toISOString().split('T')[0];

//   const isTodayFunc = (dateStr: string) => dateStr === todayStr;
//   const isPast = (dateStr: string) => new Date(dateStr) < today;
//   const isActive = (dateStr: string) => dateStr >= streakStartStr && dateStr <= todayStr;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: 'easeOut' }}
//       className={`min-h-screen flex flex-col items-center justify-center p-4 ${
//         theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
//       }`}
//     >
//       {/* First Section: Points Earned */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6 }}
//         className={`card max-w-2xl w-full p-6 sm:p-8 text-center ${
//           theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'
//         } rounded-2xl shadow-xl mb-8`}
//       >
//         <h1 className="text-3xl font-bold mb-4">Points Earned</h1>
//         <p className="text-xl mb-6">Great job completing your streak today!</p>
//         <motion.p
//           className="text-5xl font-extrabold text-green-500 mb-6"
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//         >
//           +<motion.span>{rounded}</motion.span> points
//         </motion.p>
//         <p className="text-md text-gray-400">Earned for your daily streak and milestones!</p>
//       </motion.div>

//       {/* Second Section: Streak Celebration with 3D and Animation */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.3 }}
//         className={`card max-w-3xl w-full p-6 sm:p-8 text-center ${
//           theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'
//         } rounded-2xl shadow-xl`}
//       >
//         <div className="h-64 w-full flex items-center justify-center mb-6">
//           <BotAvatar3D />
//         </div>
//         <h1 className="text-4xl font-bold mb-4">Streak Celebration!</h1>
//         <p className="text-xl mb-6">
//           {currentStreak === 1
//             ? "You've started your streak!"
//             : `You've extended your streak to ${currentStreak} days!`}
//         </p>
//         <motion.div
//           className="text-6xl font-extrabold text-blue-500 mb-8"
//           initial={{ y: 50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ type: 'spring', stiffness: 100, damping: 20 }}
//         >
//           {currentStreak}
//           <span className="text-3xl ml-2">days</span>
//         </motion.div>
//         <div className="flex justify-around mb-8">
//           {dayLabels.map((label, idx) => {
//             const dateStr = weekDates[idx];
//             const isTod = isTodayFunc(dateStr);
//             const active = isActive(dateStr);
//             const past = isPast(dateStr);
//             let icon = null;
//             if (active) {
//               icon = <BatteryCharging className="h-6 w-6 text-green-500" />;
//             } else if (past) {
//               icon = <X className="h-6 w-6 text-red-500" />;
//             }
//             return (
//               <motion.div
//                 key={idx}
//                 className={`flex flex-col items-center ${isTod ? 'font-bold text-blue-500' : ''}`}
//                 whileHover={{ scale: 1.1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {icon}
//                 <span>{label}</span>
//               </motion.div>
//             );
//           })}
          
//         </div>
//         <Button
//           onClick={() => router.push('/main/quiz/result')}
//           className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition-all duration-300 shadow-md"
//         >
//           Continue to Results
//         </Button>
//       </motion.div>
//     </motion.div>
//   );
// }