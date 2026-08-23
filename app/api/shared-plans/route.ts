import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token is required.' }, { status: 400 })
  const { data, error } = await supabase.from('shared_plans').select('id, plan, created_at, expires_at').eq('share_token', token).or('expires_at.is.null,expires_at.gt.now()').maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Shared plan not found.' }, { status: 404 })
  return NextResponse.json({ plan: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!Array.isArray(body.plan)) return NextResponse.json({ error: 'plan must be an array.' }, { status: 400 })
  const token = crypto.randomUUID().replaceAll('-', '')
  const { data, error } = await supabase.from('shared_plans').insert({ user_id: user.id, share_token: token, plan: body.plan.slice(0, 31), expires_at: body.expiresAt ?? null }).select('id, share_token, created_at, expires_at').single()
  if (error) return NextResponse.json({ error: 'Unable to create shared plan.' }, { status: 500 })
  return NextResponse.json({ share: data }, { status: 201 })
}
