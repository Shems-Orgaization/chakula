// app/api/pantry/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

const MAX_PANTRY_ITEMS = 500;
const MAX_DATE_LEN = 32;
const ALLOWED_UNIT_RE = /^[A-Za-z0-9 .\-/]{0,24}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function GET() {
  const { supabase, user } = await getContext()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)
  const { data, error } = await supabase.from('user_pantry_items').select('*').eq('user_id', user.id).order('expires_on', { ascending: true, nullsFirst: false }).order('updated_at', { ascending: false }).limit(MAX_PANTRY_ITEMS)
  if (error) return errJson('Unable to load pantry.', 'db_error', 500)
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return errJson('ingredient_name is required.', 'invalid_body', 400)
  if (typeof body.ingredient_name !== 'string' || !body.ingredient_name.trim()) return errJson('ingredient_name is required.', 'ingredient_name_required', 400)

  // Per-user cap
  const { count, error: countErr } = await supabase.from('user_pantry_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if (countErr) return errJson('Unable to add pantry item.', 'db_error', 500)
  if ((count ?? 0) >= MAX_PANTRY_ITEMS) return errJson('Pantry limit reached.', 'limit_reached', 403)

  let quantity: number | null = null
  if (body.quantity !== undefined && body.quantity !== null) {
    if (typeof body.quantity !== 'number' || !Number.isFinite(body.quantity)) return errJson('quantity must be a number.', 'quantity_invalid', 400)
    if (body.quantity < 0 || body.quantity > 100000) return errJson('quantity out of range.', 'quantity_out_of_range', 400)
    quantity = body.quantity
  }

  let unit: string | null = null
  if (body.unit !== undefined && body.unit !== null) {
    if (typeof body.unit !== 'string') return errJson('unit must be a string.', 'unit_invalid', 400)
    const u = body.unit.trim().slice(0, 24)
    if (u && !ALLOWED_UNIT_RE.test(u)) return errJson('unit invalid.', 'unit_invalid', 400)
    unit = u || null
  }

  let expires_on: string | null = null
  if (body.expires_on !== undefined && body.expires_on !== null) {
    if (typeof body.expires_on !== 'string') return errJson('expires_on must be a string.', 'expires_on_invalid', 400)
    const d = body.expires_on.trim().slice(0, MAX_DATE_LEN)
    if (d && !ISO_DATE_RE.test(d)) return errJson('expires_on must be YYYY-MM-DD.', 'expires_on_invalid', 400)
    expires_on = d || null
  }

  const payload = {
    user_id: user.id,
    ingredient_name: body.ingredient_name.trim().slice(0, 120),
    quantity,
    unit,
    expires_on,
  }
  const { data, error } = await supabase.from('user_pantry_items').insert(payload).select().single()
  if (error) return errJson('Unable to add pantry item.', 'db_error', 500)
  return NextResponse.json({ item: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return errJson('id is required.', 'invalid_body', 400)
  if (typeof body.id !== 'string' || !body.id.trim()) return errJson('id is required.', 'id_required', 400)
  const id = body.id.trim().slice(0, 64)
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return errJson('id invalid.', 'id_invalid', 400)

  const updates: Record<string, unknown> = {}
  if (body.quantity !== undefined) {
    if (body.quantity === null) updates.quantity = null
    else if (typeof body.quantity === 'number' && Number.isFinite(body.quantity) && body.quantity >= 0 && body.quantity <= 100000) updates.quantity = body.quantity
    else return errJson('quantity out of range.', 'quantity_out_of_range', 400)
  }
  if (body.unit !== undefined) {
    if (body.unit === null) updates.unit = null
    else if (typeof body.unit === 'string') {
      const u = body.unit.trim().slice(0, 24)
      if (u && !ALLOWED_UNIT_RE.test(u)) return errJson('unit invalid.', 'unit_invalid', 400)
      updates.unit = u || null
    } else return errJson('unit invalid.', 'unit_invalid', 400)
  }
  if (body.expires_on !== undefined) {
    if (body.expires_on === null) updates.expires_on = null
    else if (typeof body.expires_on === 'string') {
      const d = body.expires_on.trim().slice(0, MAX_DATE_LEN)
      if (d && !ISO_DATE_RE.test(d)) return errJson('expires_on must be YYYY-MM-DD.', 'expires_on_invalid', 400)
      updates.expires_on = d || null
    } else return errJson('expires_on invalid.', 'expires_on_invalid', 400)
  }
  if (body.ingredient_name !== undefined) {
    if (typeof body.ingredient_name !== 'string' || !body.ingredient_name.trim()) return errJson('ingredient_name invalid.', 'ingredient_name_invalid', 400)
    updates.ingredient_name = body.ingredient_name.trim().slice(0, 120)
  }
  if (Object.keys(updates).length === 0) return errJson('No updatable fields.', 'nothing_to_update', 400)

  const { data, error } = await supabase.from('user_pantry_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return errJson('Unable to update pantry item.', 'db_error', 500)
  if (!data) return errJson('Pantry item not found.', 'not_found', 404)
  return NextResponse.json({ item: data })
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getContext()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !id.trim()) return errJson('id is required.', 'id_required', 400)
  const cleanId = id.trim().slice(0, 64)
  if (!/^[A-Za-z0-9_-]+$/.test(cleanId)) return errJson('id invalid.', 'id_invalid', 400)
  const { error } = await supabase.from('user_pantry_items').delete().eq('id', cleanId).eq('user_id', user.id)
  if (error) return errJson('Unable to delete pantry item.', 'db_error', 500)
  return new NextResponse(null, { status: 204 })
}