import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await context()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('user_shopping_items').select('*').eq('user_id', user.id).order('checked').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load shopping list.' }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user } = await context()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.ingredient_name !== 'string' || !body.ingredient_name.trim()) return NextResponse.json({ error: 'ingredient_name is required.' }, { status: 400 })
  const { data, error } = await supabase.from('user_shopping_items').insert({ user_id: user.id, ingredient_name: body.ingredient_name.trim().slice(0, 120), quantity: typeof body.quantity === 'number' && body.quantity > 0 ? body.quantity : null, unit: typeof body.unit === 'string' ? body.unit.trim().slice(0, 24) : null, source: body.source === 'recipe' ? 'recipe' : 'manual' }).select().single()
  if (error) return NextResponse.json({ error: 'Unable to add shopping item.' }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await context()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || typeof body.checked !== 'boolean') return NextResponse.json({ error: 'id and checked are required.' }, { status: 400 })
  const { data, error } = await supabase.from('user_shopping_items').update({ checked: body.checked, updated_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: 'Unable to update shopping item.' }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await context()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 })
  const { error } = await supabase.from('user_shopping_items').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Unable to delete shopping item.' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
