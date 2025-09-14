
// 'use client'

// import { useRouter } from 'next/navigation'
// import { useState } from 'react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { supabase } from '@/lib/supabaseClient'
// import Box from '@/components/ui/box'
// import { toast } from 'sonner'
// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       })

//       if (loginError) throw loginError

//       // Check if user profile exists
//       const userId = sessionData.user?.id
//       const { data: profileData, error: profileError } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if (profileError && profileError.code !== 'PGRST116') throw profileError

//       // Redirect based on profile existence
//       if (profileData) {
//         router.push('/main/dashboard')
//       } else {
//         router.push('/main/settings/profile-setup')
//       }

//       toast.success('Login successful!')
//     } catch (err: any) {
//       toast.error(err.message || 'Login failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Box
//       as="div"
//       className={cn('flex flex-col gap-6 items-center justify-center min-h-screen p-6')}
//     >
//       <Box as="form" onSubmit={handleLogin} className="w-[350px] max-w-md flex flex-col gap-6">
//         <Box as="h1" className="text-2xl font-bold text-center">
//           Welcome back
//         </Box>

//         <Box className="grid gap-2">
//           <Label>Email</Label>
//           <Input
//             type="email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             placeholder="m@example.com"
//             required
//           />
//         </Box>

//         <Box className="grid gap-2">
//           <Label>Password</Label>
//           <Input
//             type="password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />
//         </Box>

//         <Button type="submit" className="w-full" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </Button>

//         <Box className="text-center text-sm">
//           Don't have an account?{' '}
//           <a href="/auth/register" className="underline underline-offset-4">
//             Sign up
//           </a>
//         </Box>
//       </Box>
//     </Box>
//   )
// }




// 'use client'

// import { useRouter } from 'next/navigation'
// import { useState } from 'react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { supabase } from '@/lib/supabaseClient'
// import Box from '@/components/ui/box'
// import { toast } from 'sonner'

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       })

//       // toast any response message
//       if ((sessionData as any)?.message) toast((sessionData as any).message)
//       if (loginError) throw loginError

//       const userId = sessionData.user?.id
//       if (!userId) {
//         // maybe email not verified or other issue
//         toast.error('No user returned. Check your email verification or credentials.')
//         setLoading(false)
//         return
//       }

//       // Check profile table for this user id
//       const { data: profileData, error: profileError } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if ((profileData as any)?.message) toast((profileData as any).message)
//       if (profileError && (profileError as any).code !== 'PGRST116') throw profileError

//       // If profile exists -> dashboard else -> profile setup
//       if (profileData) {
//         router.push('/main/dashboard')
//       } else {
//         router.push('/main/settings/profile-setup')
//       }
//       toast.success('Login successful')
//     } catch (err: any) {
//       // always toast response.message if present, else error.message
//       const msg = (err?.response?.message) || err?.message || 'Login failed'
//       toast.error(msg)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Box as="div" className={cn('flex flex-col gap-6 items-center justify-center min-h-screen p-6')}>
//       <Box as="form" onSubmit={handleLogin} className="w-[370px] max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
//         <Box as="h1" className="text-2xl font-bold text-center">Welcome back</Box>

//         <Box className="grid gap-2">
//           <Label>Email</Label>
//           <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="m@example.com" required />
//         </Box>

//         <Box className="grid gap-2">
//           <Label>Password</Label>
//           <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
//         </Box>

//         <Button type="submit" className="w-full" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </Button>

//         <Box className="text-center text-sm">
//           Don't have an account? <a href="/auth/register" className="underline text-indigo-600">Sign up</a>
//         </Box>
//       </Box>
//     </Box>
//   )
// }



// 'use client'

// import { useRouter } from 'next/navigation'
// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { supabase } from '@/lib/supabaseClient'
// import Box from '@/components/ui/box'
// import { toast } from 'sonner'
// import { Eye, EyeOff } from 'lucide-react'

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       })

//       if ((sessionData as any)?.message) toast((sessionData as any).message)
//       if (loginError) throw loginError

//       const userId = sessionData.user?.id
//       if (!userId) {
//         toast.error('No user returned. Check your email verification or credentials.')
//         setLoading(false)
//         return
//       }

//       const { data: profileData, error: profileError } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if ((profileData as any)?.message) toast((profileData as any).message)
//       if (profileError && (profileError as any).code !== 'PGRST116') throw profileError

//       if (profileData) {
//         router.push('/main/dashboard')
//       } else {
//         router.push('/settings/profile-setup')
//       }
//       toast.success('Login successful')
//     } catch (err: any) {
//       const msg = err?.response?.message || err?.message || 'Login failed'
//       toast.error(msg)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Box className="flex items-center justify-center min-h-screen p-6">
//       <Box
//         as="form"
//         onSubmit={handleLogin}
//         className="w-[370px] max-w-md auth-card flex flex-col gap-4"
//       >
//         <Box as="h1" className="text-2xl font-bold text-center">
//           Welcome back
//         </Box>

//         <Box className="grid gap-2">
//           <Label>Email</Label>
//           <Input
//             type="email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             placeholder="m@example.com"
//             required
//           />
//         </Box>

//         <Box className="grid gap-2 relative">
//           <Label>Password</Label>
//           <Input
//             type={showPassword ? 'text' : 'password'}
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />
//           <Box
//             as="span"
//             className="absolute right-3 top-9 cursor-pointer text-muted-foreground"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </Box>
//         </Box>

//         <Button type="submit" className="w-full" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </Button>

//         <Box className="text-center text-sm">
//           Don&apos;t have an account?{' '}
//           <a href="/auth/register" className="link">
//             Sign up
//           </a>
//         </Box>
//       </Box>
//     </Box>
//   )
// }






'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Box from '@/components/ui/box'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginError) throw loginError

      // Go straight to dashboard
      router.push('/main/dashboard')
      toast.success('Login successful')
    } catch (err: any) {
      const msg = err?.response?.message || err?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    // <Box className="flex items-center justify-center min-h-screen p-6">
        <Box className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-primary/10 via-background to-background">

      <Box as="form" onSubmit={handleLogin} className="w-[370px] max-w-md auth-card flex flex-col gap-4">
        <Box as="h1" className="text-2xl font-bold text-center">Welcome back</Box>

        <Box className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="m@example.com" required />
        </Box>

        <Box className="grid gap-2 relative">
          <Label>Password</Label>
          <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
          <Box as="span" className="absolute right-3 top-9 cursor-pointer text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Box>
        </Box>

        <Button type="submit" className="cursor-pointer w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Box className="text-center text-sm">
          Don&apos;t have an account? <a href="/auth/register" className="link">Sign up</a>
        </Box>
      </Box>
    </Box>
  )
}
