'use client';

import { Eye, EyeOff } from 'lucide-react';

import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      // Go straight to dashboard
      router.push('/main/dashboard');
      toast.success('Login successful');
    } catch (err: unknown) {
      const msg =
        (err as { response: { message: string } })?.response?.message ||
        (err as { messgae: string }).messgae ||
        'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <Box className="flex items-center justify-center min-h-screen p-6">
    <Box className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-primary/10 via-background to-background">
      <Box
        as="form"
        onSubmit={handleLogin}
        className="w-[370px] max-w-md auth-card flex flex-col gap-4"
      >
        <Box as="h1" className="text-2xl font-bold text-center">
          Welcome back
        </Box>

        <Box className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
          />
        </Box>

        <Box className="grid gap-2 relative">
          <Label>Password</Label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Box
            as="span"
            className="absolute right-3 top-9 cursor-pointer text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Box>
        </Box>

        <Button
          type="submit"
          className="cursor-pointer w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Box className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="link">
            Sign up
          </a>
        </Box>
      </Box>
    </Box>
  );
}
