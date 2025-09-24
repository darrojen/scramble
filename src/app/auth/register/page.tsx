'use client';

import '../../globals.css';

import { Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/features/quiz/components/LoadingSpinner';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local validation
  const validate = () => {
    if (!firstName.trim()) return toast.error('First name is required');
    if (!lastName.trim()) return toast.error('Last name is required');
    if (!email.trim()) return toast.error('Email is required');
    if (!password) return toast.error('Password is required');
    if (!confirmPassword) return toast.error('Confirm password is required');
    if (password !== confirmPassword)
      return toast.error('Passwords do not match');
    return true;
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (error) {
        toast.error(error.message || 'Signup failed');
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        // Insert full profile data into 'profiles' table
        const { error: insertError } = await supabase.from('profiles').upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
          email,
          is_verified: false,
        });
        if (insertError) {
          toast.error(insertError.message || 'Failed to create profile');
          return;
        }
      }

      toast.success(
        'Signup successful! Check your email to verify your account.'
      );
      router.push('/auth/login');
    } catch (err: unknown) {
      const msg =
        (err as { response: { message: string } })?.response?.message ||
        (err as { messgae: string }).messgae ||
        'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="" />;

  return (
    <Box className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-primary/10 via-background to-background">
      <Box
        as="form"
        onSubmit={handleRegister}
        // className="w-[370px] max-w-md rounded-2xl border bg-card shadow-xl p-6 flex flex-col gap-4"
        className="w-[370px] max-w-md auth-card flex flex-col gap-4"
      >
        <Box as="h1" className="text-2xl font-bold text-center text-primary">
          Create an account
        </Box>

        <Box className="grid gap-2">
          <Label>First Name</Label>
          <Input
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
        </Box>

        <Box className="grid gap-2">
          <Label>Last Name</Label>
          <Input
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </Box>

        <Box className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </Box>

        <Box className="grid gap-2">
          <Label>User Type</Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="sponsor">Sponsor</SelectItem>
            </SelectContent>
          </Select>
        </Box>

        <Box className="grid gap-2 relative">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </Box>

        <Box className="grid gap-2 relative">
          <Label>Confirm Password</Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <span
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-muted-foreground"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </Box>

        <Button
          type="submit"
          className="w-full bg-primary cursor-pointer  hover:bg-primary-dark"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </Button>

        <Box className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary  hover:underline">
            Login
          </a>
        </Box>
      </Box>
    </Box>
  );
}
