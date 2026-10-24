// app/api/reviews/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/
const MAX_PAGE = 100

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const recipeId = new URL(request.url).searchParams.get('recipeId')
  if (!recipeId || !ID_RE.test(recipeId)) return errJson('recipeId is required.', 'recipe_id_invalid', 400)

  const { data, error } = await supabase
    .from('recipe_reviews')
    .select('id, recipe_id, rating, review, created_at, updated_at')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
    .limit(MAX_PAGE)

  if (error) return errJson('Unable to load reviews.', 'db_error', 500)
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errJson('Valid recipeId and rating are required.', 'invalid_body', 400)
  }
  if (typeof body.recipeId !== 'string' || !ID_RE.test(body.recipeId)) {
    return errJson('Valid recipeId and rating are required.', 'recipe_id_invalid', 400)
  }
  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return errJson('Valid recipeId and rating are required.', 'rating_invalid', 400)
  }
  let review: string | null = null
  if (body.review !== undefined && body.review !== null) {
    if (typeof body.review !== 'string') return errJson('review must be a string.', 'review_invalid', 400)
    review = body.review.slice(0, 2000)
  }

  const { data, error } = await supabase
    .from('recipe_reviews')
    .upsert({ user_id: user.id, recipe_id: body.recipeId, rating, review }, { onConflict: 'user_id,recipe_id' })
    .select()
    .single()

  if (error) return errJson('Unable to save review.', 'db_error', 500)
  return NextResponse.json({ review: data })
}