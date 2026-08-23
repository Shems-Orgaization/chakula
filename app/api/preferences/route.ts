import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load preferences.' }, { status: 500 })
  return NextResponse.json({ preferences: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const allowed = ['favorites', 'history', 'pantry', 'shopping', 'reminders', 'image_overrides']
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  const { data, error } = await supabase.from('user_preferences').upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() }).select().single()
  if (error) return NextResponse.json({ error: 'Unable to save preferences.' }, { status: 500 })
  return NextResponse.json({ preferences: data })
}
