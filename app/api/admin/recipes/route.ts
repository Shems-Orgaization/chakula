import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminServiceClient } from '@/lib/auth/admin-service'

function payload(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const mealType = typeof body.meal_type === 'string' ? body.meal_type.trim() : ''
  if (!name || !slug || !category || !mealType) return null
  return {
    id: typeof body.id === 'string' && body.id ? body.id : slug,
    name,
    slug,
    description: typeof body.description === 'string' ? body.description.trim() : '',
    category,
    meal_type: mealType,
    difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'easy',
    total_time_minutes: Number(body.total_time_minutes) || 30,
    cost_min_kes: Number(body.cost_min_kes) || 0,
    cost_max_kes: Number(body.cost_max_kes) || 0,
    servings: Number(body.servings) || 2,
    image_url: typeof body.image_url === 'string' ? body.image_url : null,
    image_alt: typeof body.image_alt === 'string' ? body.image_alt : name,
    dietary_tags: Array.isArray(body.dietary_tags) ? body.dietary_tags.filter((x): x is string => typeof x === 'string') : [],
    tags: Array.isArray(body.tags) ? body.tags.filter((x): x is string => typeof x === 'string') : [],
    ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
    instructions: Array.isArray(body.instructions) ? body.instructions : [],
    is_published: body.is_published !== false,
    updated_at: new Date().toISOString(),
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createAdminServiceClient()
  const { data, error } = await db.from('recipes').select('*').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Could not load recipes' }, { status: 500 })
  return NextResponse.json({ recipes: data ?? [] })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const recipe = payload(body)
  if (!recipe) return NextResponse.json({ error: 'Name, slug, category and meal type are required' }, { status: 400 })
  const { data, error } = await createAdminServiceClient().from('recipes').insert(recipe).select().single()
  if (error) return NextResponse.json({ error: 'Could not create recipe' }, { status: 400 })
  return NextResponse.json({ recipe: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Recipe id is required' }, { status: 400 })
  const recipe = payload(body)
  if (!recipe) return NextResponse.json({ error: 'Name, slug, category and meal type are required' }, { status: 400 })
  const { id, ...changes } = recipe
  const { data, error } = await createAdminServiceClient().from('recipes').update(changes).eq('id', body.id).select().single()
  if (error) return NextResponse.json({ error: 'Could not update recipe' }, { status: 400 })
  return NextResponse.json({ recipe: data })
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Recipe id is required' }, { status: 400 })
  const { error } = await createAdminServiceClient().from('recipes').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: 'Could not delete recipe' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
