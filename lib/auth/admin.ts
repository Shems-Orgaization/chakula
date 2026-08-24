import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  return user
}
