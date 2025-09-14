'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { LogOut, BookOpenCheck, Award, Cpu, User, Bell, LayoutDashboard, ChartNoAxesCombined } from 'lucide-react'
import { toast } from 'sonner'

export default function AppSidebar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const { data } = await supabase.auth.getUser()
        const currentUser = data.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()
          setProfile(profileData || null)
        }
      } catch (err) {
        console.error('Error fetching user/profile:', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
    toast.success('Successfully logged out')
  }

  const navItems = [
    { title: 'Dashboard', url: '/main/dashboard', icon: LayoutDashboard },
    { title: 'Quiz', url: '/main/quiz', icon: BookOpenCheck },
    { title: 'Leaderboard', url: '/main/leaderboard', icon: Award },
    { title: 'Progress', url: '/main/progress', icon: ChartNoAxesCombined },
    { title: 'Sponsors', url: '/main/sponsors', icon: ChartNoAxesCombined },
    { title: 'Ultimi AI', url: '/main/ultimi-ai', icon: Cpu },
  ]

  if (loading) {
    return (
      <Sidebar className="flex flex-col justify-between h-screen bg-background">
        <SidebarHeader className="p-4">
          <Skeleton className="h-6 w-24" />
        </SidebarHeader>
        <SidebarContent className="p-4 space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md" />
            ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Skeleton className="h-8 w-full rounded-md" />
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar className="flex flex-col justify-between h-screen bg-background">
      {/* Logo */}
      <SidebarHeader className="p-4 flex items-center justify-center">
        <span className="text-xl font-bold truncate">Ultimi</span>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-3 p-3 rounded-md transition
                      ${isActive ? 'border-l-4 border-primary bg-muted font-semibold' : 'hover:bg-muted'}
                    `}
                  >
                    {/* Icon always visible */}
                    <item.icon className="h-6 w-6 flex-shrink-0" />

                    {/* Label text: will collapse gracefully if Sidebar is collapsed */}
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-10 w-10">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} />
                ) : (
                  <AvatarFallback>U</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {profile?.username ?? user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {profile?.user_type ?? 'Member'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/main/settings/profile-setup">
                <User className="mr-2 h-4 w-4" /> Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/main/settings/notifications">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}