'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Box from '@/components/ui/box';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import Textarea from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Camera } from 'lucide-react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';

interface Profile {
  username: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  created_at: string;
  bio: string;
  avatar_url: string | null;
  profile_completion: number;
}
interface FieldDef {
  label: string;
  key: keyof Profile;
  isTextarea?: boolean;
}

type ExamLeague = {
  exam_type: string;
  points: number;
  league: string;
};

const cartoonAvatars = [
  'https://avatar.iran.liara.run/public/29',
  'https://avatar.iran.liara.run/public/31',
  'https://avatar.iran.liara.run/public/32',
  'https://avatar.iran.liara.run/public/33',
  'https://avatar.iran.liara.run/public/34',
  'https://avatar.iran.liara.run/public/35',
];

/* ---------- league decision (same thresholds you used earlier) ---------- */
function getLeague(points: number): string {
  if (points >= 27300) return 'Diamond';
  if (points >= 13300) return 'Platinum';
  if (points >= 5300) return 'Gold';
  if (points >= 1300) return 'Silver';
  if (points >= 900) return 'Bronze';
  return 'Palladium';
}

/* ---------- colors for small 3D material + badge ---------- */
const LEAGUE_COLORS: Record<string, { color: string; emissive: string }> = {
  Diamond: { color: '#B9F2FF', emissive: '#40E0D0' },
  Platinum: { color: '#E5E4E2', emissive: '#BEBEBE' },
  Gold: { color: '#FFD700', emissive: '#FFA500' },
  Silver: { color: '#C0C0C0', emissive: '#A9A9A9' },
  Bronze: { color: '#CD7F32', emissive: '#B87333' },
  Palladium: { color: '#CED0DD', emissive: '#A9A9B3' },
};

/* ---------- small rotating 3D badge used in header (medium sized) ---------- */
function LeagueBadge3D({ league }: { league: string }) {
  const { color, emissive } = LEAGUE_COLORS[league] ?? LEAGUE_COLORS.Palladium;

  return (
    <div className="w-24 h-24">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 5]} intensity={1.2} />
        <LeagueBadgeMesh league={league} color={color} emissive={emissive} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

/* ---------- 3D badge mesh with rotation logic ---------- */
function LeagueBadgeMesh({ league, color, emissive }: { league: string; color: string; emissive: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.75;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  const geometry = (() => {
    switch (league) {
      case 'Diamond':
        return <octahedronGeometry args={[0.9, 0]} />;
      case 'Platinum':
        return <cylinderGeometry args={[0.8, 0.8, 0.8, 6]} />;
      case 'Gold':
        return <icosahedronGeometry args={[0.9, 0]} />;
      case 'Silver':
        return <torusGeometry args={[0.5, 0.18, 16, 100]} />;
      case 'Bronze':
        return <coneGeometry args={[0.9, 1.1, 4]} />;
      default:
        return <dodecahedronGeometry args={[0.9, 0]} />;
    }
  })();

  return (
    <Float speed={1.3} rotationIntensity={1} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={[1.0, 1.0, 1.0]}>
        {geometry}
        <meshStandardMaterial metalness={0.9} roughness={0.25} color={color} emissive={emissive} emissiveIntensity={0.35} />
      </mesh>
    </Float>
  );
}

/* ---------- main ProfileSetupPage component, enhanced ---------- */
export default function ProfileSetupPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    username: '',
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    department: '',
    city: '',
    created_at: '',
    bio: '',
    avatar_url: null,
    profile_completion: 0,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [examLeagues, setExamLeagues] = useState<ExamLeague[]>([]);
  const [pointsLoading, setPointsLoading] = useState(true);

  const calculateCompletion = (p: Profile) => {
    const fields = ['username', 'first_name', 'last_name', 'company', 'phone', 'department', 'city', 'bio'] as const;
    const filled = fields.filter((key) => Boolean(p[key])).length;
    return Math.round((filled / fields.length) * 100);
  };

  useEffect(() => {
    const fetchProfileAndPoints = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user;

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUserId(currentUser.id);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        const fetchedProfile: Profile = {
          username: profileData?.username || '',
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          company: profileData?.company || '',
          email: currentUser.email || '',
          phone: profileData?.phone || '',
          department: profileData?.department || '',
          city: profileData?.city || '',
          created_at: profileData?.created_at?.split('T')[0] || '',
          bio: profileData?.bio || '',
          avatar_url: profileData?.avatar_url || null,
          profile_completion: 0,
        };

        fetchedProfile.profile_completion = calculateCompletion(fetchedProfile);

        setProfile(fetchedProfile);
        setPreviewUrl(profileData?.avatar_url || null);
      } catch (err) {
        console.error('Profile fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPoints();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchPoints = async () => {
      setPointsLoading(true);
      try {
        const { data: scoresData, error } = await supabase
          .from('quiz_scores')
          .select('points, exam_type')
          .eq('student_id', userId);

        if (error) {
          console.error('Error fetching quiz_scores', error);
          setTotalPoints(0);
          setExamLeagues([]);
          return;
        }

        const map = new Map<string, number>();
        (scoresData || []).forEach((row: any) => {
          const exam = row.exam_type || 'normal';
          const pts = Number(row.points) || 0;
          map.set(exam, (map.get(exam) || 0) + pts);
        });

        const examArr: ExamLeague[] = [];
        for (const [exam_type, points] of map.entries()) {
          examArr.push({ exam_type, points, league: getLeague(points) });
        }

        const total = examArr.reduce((s, r) => s + r.points, 0);
        if (!cancelled) {
          setTotalPoints(total);
          setExamLeagues(examArr);
        }
      } catch (err) {
        console.error('fetchPoints error', err);
        if (!cancelled) {
          setTotalPoints(0);
          setExamLeagues([]);
        }
      } finally {
        if (!cancelled) setPointsLoading(false);
      }
    };

    fetchPoints();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!userId) return toast.error('User not found');
    if (!profile.username?.trim()) return toast.error('Username is required');
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) return toast.error('Full name is required');

    setSaving(true);
    try {
      let avatar_url = previewUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const fileName = `${userId}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = publicUrlData.publicUrl;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      const profileToSave = { ...profile, avatar_url, profile_completion: calculateCompletion(profile) };

      if (existingProfile) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(profileToSave)
          .eq('id', userId);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: userId, ...profileToSave });
        if (insertErr) throw insertErr;
      }

      setProfile(profileToSave);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err: any) {
      console.error('Profile setup error:', err);
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Skeleton className="w-40 h-40 rounded-full" />
        <Skeleton className="w-48 h-6 rounded-md" />
      </motion.div>
    );
  }

  const fields: FieldDef[] = [
    { label: 'Username', key: 'username' },
    { label: 'First Name', key: 'first_name' },
    { label: 'Last Name', key: 'last_name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email' },
    { label: 'Department', key: 'department' },
    { label: 'State', key: 'city' },
    { label: 'Bio', key: 'bio', isTextarea: true },
  ] as const;

  const overallLeague = totalPoints !== null ? getLeague(totalPoints) : 'Palladium';

  return (
    <motion.div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}>
      <motion.div
        className="w-full p-6 rounded-lg mb-8 flex items-center justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
            <div className="relative">
  <Avatar className="w-24 h-24 rounded-full overflow-hidden border">
    {previewUrl ? (
      <AvatarImage
        src={previewUrl}
        alt="Profile"
        className="object-contain w-full h-full"
      />
    ) : (
      <AvatarFallback className="text-lg font-semibold">
        {profile.username?.[0]?.toUpperCase() || 'U'}
      </AvatarFallback>
    )}
  </Avatar>

  {editMode && (
    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md">
      <Camera className="w-4 h-4" />
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </label>
  )}
</div>
          <div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <p className="text-sm opacity-80">{profile.first_name} {profile.last_name} ● {profile.company || '—'}</p>
            <p className="text-xs opacity-60 mt-1">{profile.department || '—'} • {profile.city || '—'} • Joined {profile.created_at || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/6 dark:bg-white/5 p-3 rounded-lg shadow-sm border border-white/6">
            <div className="p-2 rounded-md bg-gradient-to-br from-yellow-400 to-orange-400 text-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-80">Total Points</div>
              <div className="text-lg font-bold">{pointsLoading ? <span className="inline-block w-16"><Skeleton className="h-5 w-16" /></span> : totalPoints ?? 0}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/6 dark:bg-white/5 p-3 rounded-lg shadow-sm border border-white/6">
            <LeagueBadge3D league={overallLeague} />
            <div>
              <div className="text-sm opacity-80">League</div>
              <div className="text-lg font-bold">{pointsLoading ? <Skeleton className="h-5 w-16" /> : overallLeague}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        <Box className="w-full lg:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold">Profile Completion</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full my-3">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${profile.profile_completion}%` }} />
          </div>
          <span>{profile.profile_completion}% completed</span>
        </Box>

        <Box className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Profile Details</h1>
            <Button className='cursor-pointer' onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit Profile'}</Button>
          </div>

          <AnimatePresence>
            <motion.div className="flex flex-col gap-3">
              {fields.map((field) => (
                <Box key={field.key} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                  <span>{field.label}</span>
                  {editMode ? (
                    field.isTextarea ? (
                      <Textarea
                        value={(profile as any)[field.key] as string}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            [(field.key as unknown) as string]: e.target.value,
                            profile_completion: calculateCompletion({ ...profile, [(field.key as unknown) as string]: e.target.value } as Profile),
                          })
                        }
                        className="w-full sm:w-80"
                      />
                    ) : (
                      <Input
                        value={(profile as any)[field.key] as string}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            [(field.key as unknown) as string]: e.target.value,
                            profile_completion: calculateCompletion({ ...profile, [(field.key as unknown) as string]: e.target.value } as Profile),
                          })
                        }
                        className="w-full sm:w-80"
                      />
                    )
                  ) : (
                    <span>{(profile as any)[field.key] || '---'}</span>
                  )}
                </Box>
              ))}
            </motion.div>
          </AnimatePresence>

          {editMode && (
            <div className="flex justify-end gap-3 mt-4">
              <Button className='cursor-pointer' onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          )}
        </Box>
      </div>
    </motion.div>
  );
}