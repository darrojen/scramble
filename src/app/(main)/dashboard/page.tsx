'use client';

import * as THREE from 'three';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Canvas, useFrame } from '@react-three/fiber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Flame, MoreHorizontal, Search } from 'lucide-react';
import { Float, OrbitControls } from '@react-three/drei';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Line } from 'react-chartjs-2';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const cartoonAvatars = [
  'https://avatar.iran.liara.run/public/29',
  'https://avatar.iran.liara.run/public/31',
  'https://avatar.iran.liara.run/public/32',
  'https://avatar.iran.liara.run/public/33',
  'https://avatar.iran.liara.run/public/34',
  'https://avatar.iran.liara.run/public/35',
  'https://avatar.iran.liara.run/public/36',
  'https://avatar.iran.liara.run/public/37',
  'https://avatar.iran.liara.run/public/38',
  'https://avatar.iran.liara.run/public/39',
  'https://avatar.iran.liara.run/public/42',
  'https://avatar.iran.liara.run/public/43',
  'https://avatar.iran.liara.run/public/46',
  'https://avatar.iran.liara.run/public/62',
  'https://avatar.iran.liara.run/public/67',
  'https://avatar.iran.liara.run/public/70',
  'https://avatar.iran.liara.run/public/76',
  'https://avatar.iran.liara.run/public/77',
  'https://avatar.iran.liara.run/public/80',
  'https://avatar.iran.liara.run/public/88',
  'https://avatar.iran.liara.run/public/90',
  'https://avatar.iran.liara.run/public/97',
];

interface LeaderboardEntry {
  student_id: string;
  username: string;
  exam_type: string;
  total_points: number;
  rank: number;
  avatar_url?: string;
}

interface Score {
  date: string;
  avg_points: number;
}

interface League {
  league: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  emissive: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
}


const LEAGUE_THRESHOLDS: League[] = [
  {
    league: 'Palladium',
    minPoints: 0,
    maxPoints: 899,
    color: '#CED0DD',
    emissive: '#A9A9B3',
  },
  {
    league: 'Bronze',
    minPoints: 900,
    maxPoints: 1299,
    color: '#CD7F32',
    emissive: '#B87333',
  },
  {
    league: 'Silver',
    minPoints: 1300,
    maxPoints: 5299,
    color: '#C0C0C0',
    emissive: '#A9A9A9',
  },
  {
    league: 'Gold',
    minPoints: 5300,
    maxPoints: 13299,
    color: '#FFD700',
    emissive: '#FFA500',
  },
  {
    league: 'Platinum',
    minPoints: 13300,
    maxPoints: 27299,
    color: '#E5E4E2',
    emissive: '#BEBEBE',
  },
  {
    league: 'Diamond',
    minPoints: 27300,
    maxPoints: Infinity,
    color: '#B9F2FF',
    emissive: '#40E0D0',
  },
];

function LeagueBadgeMesh({ league }: { league: string }) {
  const meshRef =
    useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const leagueData =
    LEAGUE_THRESHOLDS.find(l => l.league === league) || LEAGUE_THRESHOLDS[0];
  const { color, emissive } = leagueData;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.75;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <Float speed={1.3} rotationIntensity={1} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          metalness={0.9}
          roughness={0.25}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.35}
        />
      </mesh>
    </Float>
  );
}

function LeagueBadge3D({ league }: { league: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 5]} intensity={1.2} />
      <LeagueBadgeMesh league={league} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [filteredLeaderboardData, setFilteredLeaderboardData] = useState<
    LeaderboardEntry[]
  >([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalSponsors, setTotalSponsors] = useState<number>(0);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [searchTermLeaderboard, setSearchTermLeaderboard] = useState('');

  const sortOrder = useRef<'asc' | 'desc'>("desc")
  const [chartType, setChartType] = useState<'line' | 'curve' | 'area'>('line');
  const [filter, setFilter] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('weekly');
  const [maxQuizPoints] = useState<number>(10);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        toast.error('Failed to authenticate user');
        return;
      }
      setCurrentUserId(user?.id ?? null);
    };
    fetchCurrentUser();
  }, []);

  // Fetch streak and profile data
  useEffect(() => {
    async function fetchStreakAndProfile() {
      if (!currentUserId) return;
      setLoadingStreak(true);

      const { data, error } = await supabase
        .from('streaks')
        .select(
          `
          current_streak,
          longest_streak,
          students!inner(first_name, last_name)
        `
        )
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        toast.error('Failed to load streak data');
        setLoadingStreak(false);
        return;
      }

      setStreak({
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
      });

     
      setLoadingStreak(false);
    }
    fetchStreakAndProfile();
  }, [currentUserId]);

  // Fetch leaderboard data (top 7)
  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    const query = supabase.from('leaderboard_view').select('*').limit(7);

    const { data: result, error } = await query;
    if (error || !result) {
      toast.error('Failed to load leaderboard data');
      setLeaderboardData([]);
      setFilteredLeaderboardData([]);
      setLoadingLeaderboard(false);
      return;
    }

    const withAvatars = await Promise.all(
      (result || []).map(async (entry: LeaderboardEntry, idx: number) => {
        let avatarUrl: string | null = null;

        if (entry?.student_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', entry?.student_id)
            .single();
          avatarUrl = profile?.avatar_url || null;
        }

        return {
          ...entry,
          avatar_url: avatarUrl || cartoonAvatars[idx % cartoonAvatars.length],
          rank: idx + 1,
        };
      })
    );

    const sorted = [...withAvatars].sort((a, b) =>
      sortOrder.current === 'asc'
        ? a.total_points - b.total_points
        : b.total_points - a.total_points
    );

    console.log('Leaderboard Data:', sorted);
    setLeaderboardData(sorted);
    setFilteredLeaderboardData(sorted);
    setLoadingLeaderboard(false);
  };

  // Fetch total students and sponsors
  const fetchCounts = async () => {
    setLoadingCounts(true);
    try {
      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('id', { count: 'exact' });

      const { count: sponsorCount, error: sponsorError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('user_type', 'sponsor');

      if (studentError || sponsorError) {
        toast.error('Failed to load counts');
        return;
      }

      setTotalStudents(studentCount ?? 0);
      setTotalSponsors(sponsorCount ?? 0);
      

    }catch (err: unknown) {
      const msg =
        (err as { response: { message: string } })?.response?.message ||
        (err as { messgae: string }).messgae ||
        'An unexpected error occurred';
      toast.error(msg);
    } finally {
      setLoadingCounts(false);
    }
  };

  // Fetch average scores for chart
  const fetchScores = async () => {
    setLoadingScores(true);
    const { data, error } = await supabase
      .rpc('get_avg_scores_by_interval', { interval_type: filter })
      .select('date, avg_points')
      .order('date', { ascending: true });

    if (error || !data) {
      toast.error('Failed to load performance data');
      setScores([]);
    } else {
      setScores(data.filter((s: Score) => s.avg_points != null));
    }
    setLoadingScores(false);
  };

  useEffect(() => {
    fetchLeaderboardData();
    fetchCounts();
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentUserId, filter, sortOrder]);

  // Filter leaderboard data
  useEffect(() => {
    let filtered = leaderboardData.filter(entry =>
      entry?.username?.toLowerCase().includes(searchTermLeaderboard.toLowerCase())
    );

    if (leagueFilter !== 'all') {
      filtered = filtered.filter(entry => {
        const points = entry?.total_points;
        if (points >= 27300) return leagueFilter === 'Diamond';
        if (points >= 13300) return leagueFilter === 'Platinum';
        if (points >= 5300) return leagueFilter === 'Gold';
        if (points >= 1300) return leagueFilter === 'Silver';
        if (points >= 900) return leagueFilter === 'Bronze';
        return leagueFilter === 'Palladium';
      });
    }

    setFilteredLeaderboardData(filtered);
  }, [searchTermLeaderboard, leagueFilter, leaderboardData]);

  // Handle connection request
  const handleConnect = async (toUserId: string, toUsername: string) => {
    if (!currentUserId) {
      toast.error('You must be logged in to send a connection request');
      return;
    }
    if (toUserId === currentUserId) {
      toast.error('You cannot connect with yourself');
      return;
    }

    const { data: existingConnection } = await supabase
      .from('connections')
      .select('*')
      .eq('from_user_id', currentUserId)
      .eq('to_user_id', toUserId)
      .single();

    if (existingConnection) {
      toast.error('Connection request already sent or accepted');
      return;
    }

    const { error: connectionError } = await supabase
      .from('connections')
      .insert({
        from_user_id: currentUserId,
        to_user_id: toUserId,
        status: 'pending',
      });

    if (connectionError) {
      toast.error('Failed to send connection request');
      return;
    }

    const { data: fromUser } = await supabase
      .from('students')
      .select('first_name, last_name')
      .eq('id', currentUserId)
      .single();

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'connection_request',
        from_user_id: currentUserId,
        message: `${fromUser?.first_name} ${fromUser?.last_name} sent you a connection request.`,
        status: 'pending',
      });

    if (notificationError) {
      toast.error('Failed to send notification');
      return;
    }

    toast.success(`Connection request sent to ${toUsername}`);
  };

  // Calculate overall performance rate
  const calculatePerformanceRate = () => {
    if (scores.length < 2) return 0;
    const validScores = scores.filter(
      s => s.avg_points != null && !isNaN(s.avg_points)
    );
    if (validScores.length < 2) return 0;

    const avgScore =
      validScores.reduce(
        (sum, s) => sum + (s.avg_points / maxQuizPoints) * 100,
        0
      ) / validScores.length;
    return Math.round(avgScore);
  };

  // Chart data for average performance
  const chartData = {
    labels: scores.map(s => s.date),
    datasets: [
      {
        label: 'Average Performance',
        data: scores.map(s =>
          s.avg_points != null ? (s.avg_points / maxQuizPoints) * 100 : 0
        ),
        borderColor: theme === 'custom' ? '#60a5fa' : '#00b7eb',
        backgroundColor: theme === 'custom' ? '#60a5fa33' : '#00b7eb33',
        fill: chartType === 'area',
        tension: chartType === 'curve' ? 0.5 : 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color:
            theme === 'custom'
              ? '#1f2937'
              : theme === 'light'
              ? '#1f2937'
              : '#e5e7eb',
        },
      },
      tooltip: {
        backgroundColor:
          theme === 'custom'
            ? '#f8fafc'
            : theme === 'light'
            ? '#ffffff'
            : '#0f172a',
        borderColor: theme === 'custom' ? '#60a5fa' : '#00f2ff',
        borderWidth: 1,
        titleColor: theme === 'custom' ? '#60a5fa' : '#00f2ff',
        bodyColor:
          theme === 'custom'
            ? '#1f2937'
            : theme === 'light'
            ? '#1f2937'
            : '#e5e7eb',
        // callbacks: {'{:?}
        //   label: context => `${context.parsed.y.toFixed(2)}%`,
        // },
        callback: (value: number | string,) =>
          `${value}%`,
      },
    },
    scales: {
      x: {
        ticks: {
          color:
            theme === 'custom'
              ? '#1f2937'
              : theme === 'light'
              ? '#1f2937'
              : '#e5e7eb',
        },
        grid: {
          color:
            theme === 'custom'
              ? '#e5e7eb'
              : theme === 'light'
              ? '#e5e7eb'
              : '#1e293b',
        },
      },
      y: {
        ticks: {
          color:
            theme === 'custom'
              ? '#1f2937'
              : theme === 'light'
              ? '#1f2937'
              : '#e5e7eb',
          callbacks: {
            // 👇 context explicitly typed
            label: (context: TooltipItem<'line'>): string =>
              `${context.parsed.y?.toFixed(2) ?? '0.00'}%`,
          },
        },
        grid: {
          color:
            theme === 'custom'
              ? '#e5e7eb'
              : theme === 'light'
              ? '#e5e7eb'
              : '#1e293b',
        },
        suggestedMax: 100,
        suggestedMin: 0,
      },
    },
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-[#DAA425] text-white';
    if (rank === 2) return 'bg-[#C0C0C0] text-white';
    if (rank === 3) return 'bg-amber-700 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  const getLeagueBadgeColor = (league: string): string => {
    switch (league) {
      case 'Diamond':
        return 'bg-[#B9F2FF] text-[#1a3c34]';
      case 'Platinum':
        return 'bg-[#E5E4E2] text-[#1a1a1a]';
      case 'Gold':
        return 'bg-[#FFD700] text-[#1a1a1a]';
      case 'Silver':
        return 'bg-[#C0C0C0] text-[#1a1a1a]';
      case 'Bronze':
        return 'bg-[#CD7F32] text-[#1a1a1a]';
      default:
        return 'bg-[#CED0DD] text-[#1a1a1a]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex-1 max-h-[100vh] p-4 sm:p-6 lg:p-8 ${
        theme === 'custom'
          ? 'bg-slate-50 text-gray-900'
          : theme === 'light'
          ? 'bg-gray-50 text-gray-900'
          : 'bg-[#16161a] text-gray-100'
      } flex-1 grid grid-cols-1 gap-6`}
    >
      <h1
        className={`text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left bg-gradient-to-r ${
          theme === 'custom'
            ? 'from-blue-400 to-blue-600'
            : theme === 'light'
            ? 'from-blue-500 to-indigo-500'
            : 'from-cyan-400 to-fuchsia-500'
        } bg-clip-text text-transparent`}
      >
        Dashboard
      </h1>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className={`p-4 ${
            theme === 'custom'
              ? 'bg-white border-blue-400 shadow-md'
              : theme === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
          } rounded-2xl`}
        >
          <CardHeader>
            <CardTitle
              className={`text-lg font-semibold ${
                theme === 'custom'
                  ? 'text-gray-900'
                  : theme === 'light'
                  ? 'text-gray-900'
                  : 'text-cyan-300'
              }`}
            >
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCounts ? (
              <Skeleton
                className={`h-8 w-20 ${
                  theme === 'custom'
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                    : theme === 'light'
                    ? 'from-gray-100 to-gray-200'
                    : 'from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10'
                } animate-pulse`}
              />
            ) : (
              <span className="text-2xl font-bold">{totalStudents}</span>
            )}
          </CardContent>
        </Card>
        <Card
          className={`p-4 ${
            theme === 'custom'
              ? 'bg-white border-blue-400 shadow-md'
              : theme === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
          } rounded-2xl`}
        >
          <CardHeader>
            <CardTitle
              className={`text-lg font-semibold ${
                theme === 'custom'
                  ? 'text-gray-900'
                  : theme === 'light'
                  ? 'text-gray-900'
                  : 'text-cyan-300'
              }`}
            >
              Total Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCounts ? (
              <Skeleton
                className={`h-8 w-20 ${
                  theme === 'custom'
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                    : theme === 'light'
                    ? 'from-gray-100 to-gray-200'
                    : 'from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10'
                } animate-pulse`}
              />
            ) : (
              <span className="text-2xl font-bold">{totalSponsors}</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Streak Display */}
      <Card
        className={`p-4 ${
          theme === 'custom'
            ? 'bg-white border-blue-400 shadow-md'
            : theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
        } rounded-2xl`}
      >
        <CardHeader>
          <CardTitle
            className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'custom'
                ? 'text-gray-900'
                : theme === 'light'
                ? 'text-gray-900'
                : 'text-cyan-300'
            }`}
          >
            <Flame className="w-6 h-6 text-orange-500" />
            {'Your Streak'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStreak ? (
            <Skeleton
              className={`h-16 w-full rounded-lg ${
                theme === 'custom'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                  : theme === 'light'
                  ? 'from-gray-100 to-gray-200'
                  : 'from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10'
              } animate-pulse`}
            />
          ) : (
            <div className="flex justify-around">
              <div className="text-center">
                <p
                  className={`text-sm ${
                    theme === 'custom'
                      ? 'text-gray-600'
                      : theme === 'light'
                      ? 'text-gray-400'
                      : 'text-gray-400'
                  }`}
                >
                  Current Streak
                </p>
                <p
                  className={`font-bold text-lg flex items-center justify-center ${
                    theme === 'custom'
                      ? 'text-gray-900'
                      : theme === 'light'
                      ? 'text-gray-900'
                      : 'text-white'
                  }`}
                >
                  {streak?.current_streak || 0} day
                  {streak?.current_streak !== 1 ? 's' : ''}
                  {streak?.current_streak && streak.current_streak > 5
                    ? ' 🔥'
                    : ''}
                </p>
              </div>
              <div className="text-center">
                <p
                  className={`text-sm ${
                    theme === 'custom'
                      ? 'text-gray-600'
                      : theme === 'light'
                      ? 'text-gray-400'
                      : 'text-gray-400'
                  }`}
                >
                  Longest Streak
                </p>
                <p
                  className={`font-bold text-lg ${
                    theme === 'custom'
                      ? 'text-gray-900'
                      : theme === 'light'
                      ? 'text-gray-900'
                      : 'text-white'
                  }`}
                >
                  {streak?.longest_streak || 0} day
                  {streak?.longest_streak !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Students Section */}
      <Card
        className={`mb-6 ${
          theme === 'custom'
            ? 'bg-white border-blue-400 shadow-md'
            : theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
        } rounded-2xl`}
      >
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle
            className={`text-lg font-semibold bg-gradient-to-r ${
              theme === 'custom'
                ? 'from-blue-400 to-blue-600'
                : theme === 'light'
                ? 'from-blue-500 to-indigo-500'
                : 'from-cyan-400 to-fuchsia-500'
            } bg-clip-text text-transparent`}
          >
            Top 7 Students
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <Input
                placeholder="Search by username..."
                value={searchTermLeaderboard}
                onChange={e => setSearchTermLeaderboard(e.target.value)}
                className={`pl-10 w-full rounded-lg ${
                  theme === 'custom'
                    ? 'bg-white border-blue-400 text-blue-400'
                    : theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-black/50 border-cyan-500/30 text-cyan-400'
                }`}
              />
            </div>
            <Select
              defaultValue="all"
              onValueChange={val => setLeagueFilter(val)}
            >
              <SelectTrigger
                className={`w-32 rounded-lg ${
                  theme === 'custom'
                    ? 'bg-white border-blue-400 text-blue-400'
                    : theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-black/50 border-cyan-500/30 text-cyan-400'
                }`}
              >
                <SelectValue placeholder="League" />
              </SelectTrigger>
              <SelectContent
                className={`${
                  theme === 'custom'
                    ? 'bg-white text-blue-600'
                    : theme === 'light'
                    ? 'bg-white text-gray-900'
                    : 'bg-black/80 text-cyan-300'
                }`}
              >
                <SelectItem value="all">All Leagues</SelectItem>
                {LEAGUE_THRESHOLDS.map(league => (
                  <SelectItem key={league.league} value={league.league}>
                    {league.league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              
          </div>
        </CardHeader>
        <CardContent>
          {loadingLeaderboard ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, idx) => (
                <Skeleton
                  key={idx}
                  className={`h-10 w-full rounded-lg ${
                    theme === 'custom'
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                      : theme === 'light'
                      ? 'from-gray-100 to-gray-200'
                      : 'from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10'
                  } animate-pulse`}
                />
              ))}
            </div>
          ) : filteredLeaderboardData.length === 0 ? (
            <div
              className={`text-center ${
                theme === 'custom'
                  ? 'text-gray-500'
                  : theme === 'light'
                  ? 'text-gray-500'
                  : 'text-gray-400'
              }`}
            >
              No students found
            </div>
          ) : (
            <>
              <div className="block sm:hidden space-y-4">
                {filteredLeaderboardData.map((entry, idx) => {
                  console.log({entry})
                  const rank = idx + 1;
                  const league =
                    entry?.total_points >= 27300
                      ? 'Diamond'
                      : entry?.total_points >= 13300
                      ? 'Platinum'
                      : entry?.total_points >= 5300
                      ? 'Gold'
                      : entry?.total_points >= 1300
                      ? 'Silver'
                      : entry?.total_points >= 900
                      ? 'Bronze'
                      : 'Palladium';
                  const isCurrentUser = entry?.student_id === currentUserId;

                  return (
                    <Card
                      key={entry?.student_id}
                      className={`p-4 ${
                        isCurrentUser
                          ? theme === 'custom'
                            ? 'bg-blue-200'
                            : theme === 'light'
                            ? 'bg-blue-100'
                            : 'bg-blue-900'
                          : ''
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(
                              rank
                            )}`}
                          >
                            {rank}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry?.avatar_url ?? ''}
                              alt={entry?.username}
                            />
                            <AvatarFallback>{entry?.username}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">
                            {entry?.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${
                                  theme === 'custom'
                                    ? 'text-blue-400 hover:bg-blue-100'
                                    : theme === 'light'
                                    ? 'text-gray-900 hover:bg-gray-100'
                                    : 'text-cyan-400 hover:bg-gray-800'
                                }`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className={`${
                                theme === 'custom'
                                  ? 'bg-white text-blue-600'
                                  : theme === 'light'
                                  ? 'bg-white text-gray-900'
                                  : 'bg-black/80 text-cyan-300'
                              }`}
                            >
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  router.push(
                                    `/users/${entry?.student_id}`
                                  );
                                }}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  router.push(
                                    `/messages?userId=${entry?.student_id}`
                                  );
                                }}
                              >
                                Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  handleConnect(
                                    entry?.student_id,
                                    entry?.username
                                  );
                                }}
                              >
                                Connect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div>
                          <span
                            className={`text-sm ${
                              theme === 'custom'
                                ? 'text-gray-600'
                                : theme === 'light'
                                ? 'text-gray-600'
                                : 'text-gray-300'
                            }`}
                          >
                            Points: {entry?.total_points}
                            <span className="text-[12px]">{' 𝙐𝙥'}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <Badge className={getLeagueBadgeColor(league)}>
                            {league}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <Table className="hidden sm:table">
                <TableHeader>
                  <TableRow
                    className={`${
                      theme === 'custom'
                        ? 'border-blue-200'
                        : theme === 'light'
                        ? 'border-gray-200'
                        : 'border-cyan-500/30'
                    }`}
                  >
                    <TableHead
                      className={`${
                        theme === 'custom'
                          ? 'text-gray-900'
                          : theme === 'light'
                          ? 'text-gray-900'
                          : 'text-cyan-300'
                      }`}
                    >
                      Rank
                    </TableHead>
                    <TableHead
                      className={`${
                        theme === 'custom'
                          ? 'text-gray-900'
                          : theme === 'light'
                          ? 'text-gray-900'
                          : 'text-cyan-300'
                      }`}
                    >
                      Username
                    </TableHead>
                    <TableHead
                      className={`${
                        theme === 'custom'
                          ? 'text-gray-900'
                          : theme === 'light'
                          ? 'text-gray-900'
                          : 'text-cyan-300'
                      }`}
                    >
                      Points
                    </TableHead>
                    <TableHead
                      className={`${
                        theme === 'custom'
                          ? 'text-gray-900'
                          : theme === 'light'
                          ? 'text-gray-900'
                          : 'text-cyan-300'
                      }`}
                    >
                      League
                    </TableHead>
                    <TableHead
                      className={`text-right ${
                        theme === 'custom'
                          ? 'text-gray-900'
                          : theme === 'light'
                          ? 'text-gray-900'
                          : 'text-cyan-300'
                      }`}
                    >
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboardData.map((entry, idx) => {
                    const rank = idx + 1;
                    const league =
                      entry?.total_points >= 27300
                        ? 'Diamond'
                        : entry?.total_points >= 13300
                        ? 'Platinum'
                        : entry?.total_points >= 5300
                        ? 'Gold'
                        : entry?.total_points >= 1300
                        ? 'Silver'
                        : entry?.total_points >= 900
                        ? 'Bronze'
                        : 'Palladium';
                    const isCurrentUser = entry?.student_id === currentUserId;

                    return (
                      <TableRow
                        key={entry?.student_id}
                        className={`cursor-pointer ${
                          theme === 'custom'
                            ? 'hover:bg-blue-50'
                            : theme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-gray-800'
                        } ${
                          isCurrentUser
                            ? theme === 'custom'
                              ? 'bg-blue-200'
                              : theme === 'light'
                              ? 'bg-blue-100'
                              : 'bg-blue-900'
                            : ''
                        }`}
                        onClick={() =>
                          router.push(`/users/${entry?.student_id}`)
                        }
                      >
                        <TableCell>
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(
                              rank
                            )}`}
                          >
                            {rank}
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry?.avatar_url ?? ''}
                              alt={entry?.username}
                            />
                            <AvatarFallback>{entry?.username}</AvatarFallback>
                          </Avatar>
                          <span
                            className={`${
                              theme === 'custom'
                                ? 'text-gray-900'
                                : theme === 'light'
                                ? 'text-gray-900'
                                : 'text-white'
                            }`}
                          >
                            {entry?.username}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`${
                            theme === 'custom'
                              ? 'text-gray-900'
                              : theme === 'light'
                              ? 'text-gray-900'
                              : 'text-white'
                          }`}
                        >
                          {entry?.total_points}{' '}
                          <span className="text-[12px]">{'𝙐𝙥'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLeagueBadgeColor(league)}>
                            {league}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${
                                  theme === 'custom'
                                    ? 'text-blue-400 hover:bg-blue-100'
                                    : theme === 'light'
                                    ? 'text-gray-900 hover:bg-gray-100'
                                    : 'text-cyan-400 hover:bg-gray-800'
                                }`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className={`${
                                theme === 'custom'
                                  ? 'bg-white text-blue-600'
                                  : theme === 'light'
                                  ? 'bg-white text-gray-900'
                                  : 'bg-black/80 text-cyan-300'
                              }`}
                            >
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  router.push(
                                    `/users/${entry?.student_id}`
                                  );
                                }}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  router.push(
                                    `/messages?userId=${entry?.student_id}`
                                  );
                                }}
                              >
                                Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  handleConnect(
                                    entry?.student_id,
                                    entry?.username
                                  );
                                }}
                              >
                                Connect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card
        className={`mb-6 ${
          theme === 'custom'
            ? 'bg-white border-blue-400 shadow-md'
            : theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
        } rounded-2xl`}
      >
        <CardHeader>
          <CardTitle
            className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${
              theme === 'custom'
                ? 'from-blue-400 to-blue-600'
                : theme === 'light'
                ? 'from-blue-500 to-indigo-500'
                : 'from-cyan-400 to-fuchsia-500'
            } bg-clip-text text-transparent`}
          >
            Average Student Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select
              onValueChange={(v: 'line' | 'curve' | 'area') => setChartType(v)}
              defaultValue="line"
            >
              <SelectTrigger
                className={`w-full sm:w-40 ${
                  theme === 'custom'
                    ? 'bg-white border-blue-400 text-blue-400'
                    : theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-black/40 border-cyan-500/30 text-cyan-400'
                }`}
              >
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent
                className={`${
                  theme === 'custom'
                    ? 'bg-white text-blue-600'
                    : theme === 'light'
                    ? 'bg-white text-gray-900'
                    : 'bg-black/80 text-cyan-300'
                }`}
              >
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="curve">Curve</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(v: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
                setFilter(v)
              }
              defaultValue="weekly"
            >
              <SelectTrigger
                className={`w-full sm:w-40 ${
                  theme === 'custom'
                    ? 'bg-white border-blue-400 text-blue-400'
                    : theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-black/40 border-fuchsia-500/30 text-fuchsia-400'
                }`}
              >
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent
                className={`${
                  theme === 'custom'
                    ? 'bg-white text-blue-600'
                    : theme === 'light'
                    ? 'bg-white text-gray-900'
                    : 'bg-black/80 text-fuchsia-300'
                }`}
              >
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loadingScores ? (
            <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center">
              <Skeleton
                className={`w-full h-full rounded-xl ${
                  theme === 'custom'
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200'
                    : theme === 'light'
                    ? 'from-gray-100 to-gray-200'
                    : 'from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10'
                } animate-pulse`}
              />
            </div>
          ) : scores.length === 0 ? (
            <div
              className={`text-center ${
                theme === 'custom'
                  ? 'text-gray-500'
                  : theme === 'light'
                  ? 'text-gray-500'
                  : 'text-gray-400'
              }`}
            >
              No performance data available
            </div>
          ) : (
            <div className="w-full h-[300px] sm:h-[400px] transition-all duration-500 ease-in-out">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          <div className="mt-4 text-center">
            <span
              className={`text-lg font-semibold bg-gradient-to-r ${
                theme === 'custom'
                  ? 'from-blue-400 to-blue-600'
                  : theme === 'light'
                  ? 'from-blue-500 to-indigo-500'
                  : 'from-cyan-400 to-fuchsia-500'
              } bg-clip-text text-transparent`}
            >
              Average Performance:{' '}
              {loadingScores ? (
                <Skeleton className="inline-block h-5 w-16" />
              ) : (
                `${calculatePerformanceRate()}%`
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* League Badges Section */}
      <Card
        className={`rounded-2xl ${
          theme === 'custom'
            ? 'bg-white border-blue-400 shadow-md'
            : theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-black/40 border-cyan-500/30 shadow-xl shadow-cyan-500/20'
        }`}
      >
        <CardHeader>
          <CardTitle
            className={`text-lg font-semibold bg-gradient-to-r ${
              theme === 'custom'
                ? 'from-blue-400 to-blue-600'
                : theme === 'light'
                ? 'from-blue-500 to-indigo-500'
                : 'from-cyan-400 to-fuchsia-500'
            } bg-clip-text text-transparent`}
          >
            League Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel
            opts={{ align: 'start' }}
            orientation="horizontal"
            className="w-full max-w-xs mx-auto"
          >
            <CarouselContent className="-mt-1">
              {LEAGUE_THRESHOLDS.map(league => (
                <CarouselItem key={league.league} className="pt-1">
                  <div className="p-1">
                    <Card
                      className={`h-full flex flex-col items-center justify-center ${
                        theme === 'custom'
                          ? 'bg-white border-blue-200'
                          : theme === 'light'
                          ? 'bg-white border-gray-200'
                          : 'bg-[#1e293b] border-cyan-500/30'
                      }`}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <h3
                          className={`text-lg font-semibold mb-2 ${
                            theme === 'custom'
                              ? 'text-gray-900'
                              : theme === 'light'
                              ? 'text-gray-900'
                              : 'text-cyan-300'
                          }`}
                        >
                          {league.league}
                        </h3>
                        <div className="w-24 h-24 mb-2">
                          <LeagueBadge3D league={league.league} />
                        </div>
                        <p
                          className={`text-sm text-center ${
                            theme === 'custom'
                              ? 'text-gray-600'
                              : theme === 'light'
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {league.minPoints}
                          <span className="text-[10px]">{'𝙐𝙥'}</span> -{' '}
                          {league.maxPoints === Infinity
                            ? '∞'
                            : league.maxPoints}
                          <span className="text-[10px]">{'𝙐𝙥'}</span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={`${
                theme === 'custom'
                  ? 'bg-blue-400 text-white hover:bg-blue-500'
                  : theme === 'light'
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  : 'bg-cyan-500/30 text-cyan-400 hover:bg-cyan-500/50'
              } border-none`}
            />
            <CarouselNext
              className={`${
                theme === 'custom'
                  ? 'bg-blue-400 text-white hover:bg-blue-500'
                  : theme === 'light'
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  : 'bg-cyan-500/30 text-cyan-400 hover:bg-cyan-500/50'
              } border-none`}
            />
          </Carousel>
        </CardContent>
      </Card>
    </motion.div>
  );
}