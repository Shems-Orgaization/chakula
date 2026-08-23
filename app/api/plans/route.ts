import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function userClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await userClient()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('user_meal_plans').select('*').eq('user_id', user.id).order('plan_date')
  if (error) return NextResponse.json({ error: 'Unable to load meal plans.' }, { status: 500 })
  return NextResponse.json({ plans: data ?? [] })
}

export async function PUT(request: Request) {
  const { supabase, user } = await userClient()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (typeof body.recipe_id !== 'string' || typeof body.plan_date !== 'string') return NextResponse.json({ error: 'recipe_id and plan_date are required.' }, { status: 400 })
  const { data, error } = await supabase.from('user_meal_plans').upsert({ user_id: user.id, recipe_id: body.recipe_id, plan_date: body.plan_date }, { onConflict: 'user_id,plan_date' }).select().single()
  if (error) return NextResponse.json({ error: 'Unable to save meal plan.' }, { status: 500 })
  return NextResponse.json({ plan: data })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await userClient()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const date = new URL(request.url).searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date is required.' }, { status: 400 })
  const { error } = await supabase.from('user_meal_plans').delete().eq('user_id', user.id).eq('plan_date', date)
  if (error) return NextResponse.json({ error: 'Unable to delete meal plan.' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
