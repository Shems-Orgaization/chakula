import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const recipeId = new URL(request.url).searchParams.get('recipeId')
  if (!recipeId) return NextResponse.json({ error: 'recipeId is required.' }, { status: 400 })
  const { data, error } = await supabase.from('recipe_reviews').select('id, recipe_id, rating, review, created_at, updated_at').eq('recipe_id', recipeId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load reviews.' }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rating = Number(body.rating)
  if (typeof body.recipeId !== 'string' || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Valid recipeId and rating are required.' }, { status: 400 })
  const { data, error } = await supabase.from('recipe_reviews').upsert({ user_id: user.id, recipe_id: body.recipeId, rating, review: typeof body.review === 'string' ? body.review.slice(0, 2000) : null }, { onConflict: 'user_id,recipe_id' }).select().single()
  if (error) return NextResponse.json({ error: 'Unable to save review.' }, { status: 500 })
  return NextResponse.json({ review: data })
}
