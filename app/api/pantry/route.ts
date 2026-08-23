import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('user_pantry_items').select('*').eq('user_id', user.id).order('expires_on', { ascending: true, nullsFirst: false }).order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load pantry.' }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.ingredient_name !== 'string' || !body.ingredient_name.trim()) return NextResponse.json({ error: 'ingredient_name is required.' }, { status: 400 })
  const payload = { user_id: user.id, ingredient_name: body.ingredient_name.trim().slice(0, 120), quantity: typeof body.quantity === 'number' && body.quantity >= 0 ? body.quantity : null, unit: typeof body.unit === 'string' ? body.unit.trim().slice(0, 24) : null, expires_on: typeof body.expires_on === 'string' ? body.expires_on : null }
  const { data, error } = await supabase.from('user_pantry_items').insert(payload).select().single()
  if (error) return NextResponse.json({ error: 'Unable to add pantry item.' }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string') return NextResponse.json({ error: 'id is required.' }, { status: 400 })
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => ['quantity', 'unit', 'expires_on', 'ingredient_name'].includes(key)))
  const { data, error } = await supabase.from('user_pantry_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: 'Unable to update pantry item.' }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 })
  const { error } = await supabase.from('user_pantry_items').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Unable to delete pantry item.' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
