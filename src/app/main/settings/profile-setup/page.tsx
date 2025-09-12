'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Box from '@/components/ui/box'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import Textarea from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { theme } = useTheme()

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [profile, setProfile] = useState<any>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fetch logged-in user and profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const currentUser = authData.user

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUserId(currentUser.id)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      setProfile(profileData || {
        username: '',
        first_name: '',
        last_name: '',
        company: '',
        email: currentUser.email || '',
        phone: '',
        department: '',
        city: '',
        join_date: '',
        bio: '',
        avatar_url: null,
        profile_completion: 0
      })

      setPreviewUrl(profileData?.avatar_url || null)
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!userId) return toast.error('User not found')
    if (!profile.username?.trim()) return toast.error('Username is required')
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) return toast.error('Full name is required')

    setSaving(true)
    try {
      let avatar_url = previewUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const fileName = `${userId}.${ext}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true })
        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatar_url = publicUrlData.publicUrl
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (existingProfile) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ ...profile, avatar_url })
          .eq('id', userId)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: userId, ...profile, avatar_url })
        if (insertErr) throw insertErr
      }

      toast.success('Profile updated!')
      setEditMode(false)
    } catch (err: any) {
      console.error('Profile setup error:', err)
      toast.error(err?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen gap-4"
    >
      <Skeleton className="w-40 h-40 rounded-full" />
      <Skeleton className="w-48 h-6 rounded-md" />
    </motion.div>
  )

  const fields = [
    { label: 'Username', key: 'username' },
    { label: 'First Name', key: 'first_name' },
    { label: 'Last Name', key: 'last_name' },
    { label: 'Company', key: 'company' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Department', key: 'department' },
    { label: 'City', key: 'city' },
    { label: 'Join Date', key: 'join_date' },
    { label: 'Bio', key: 'bio', isTextarea: true }
  ]

  return (
    <motion.div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${theme === 'system' ? 'bg-gray-900 text-white' : ''}`}>
      <motion.div className="w-full bg-gradient-to-r from-blue-200 via-orange-200 to-blue-400 p-6 rounded-lg mb-8 flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="w-20 h-20 shadow-md">
          {previewUrl ? <AvatarImage src={previewUrl} /> : <AvatarFallback>{profile.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>}
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <p>{profile.first_name} {profile.last_name} ● {profile.company} | {profile.city} | Joined {profile.join_date}</p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        <Box className="w-full lg:w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold">Profile Completion</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${profile.profile_completion || 0}%` }} />
          </div>
          <span>{profile.profile_completion || 0}% completed</span>
        </Box>

        <Box className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Profile Details</h1>
            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <AnimatePresence>
            <motion.div className="flex flex-col gap-3">
              {fields.map(field => (
                <Box key={field.key} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                  <span>{field.label}</span>
                  {editMode ? (
                    field.isTextarea ? (
                      <Textarea
                        value={profile[field.key] || ''}
                        onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                        className="w-full sm:w-80"
                      />
                    ) : (
                      <Input
                        value={profile[field.key] || ''}
                        onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                        className="w-full sm:w-80"
                      />
                    )
                  ) : (
                    <span>{profile[field.key] || '---'}</span>
                  )}
                </Box>
              ))}
            </motion.div>
          </AnimatePresence>

          {editMode && (
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          )}
        </Box>
      </div>
    </motion.div>
  )
}
