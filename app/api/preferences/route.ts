// app/api/preferences/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_JSON_BYTES = 200_000;
const MAX_ARRAY_ITEMS = 1000;
const MAX_STRING_LEN = 200;

const ALLOWED_KEYS = [
  'favorites', 'history', 'pantry', 'shopping', 'reminders',
  'image_overrides', 'user_budget', 'dietary_tags'
] as const;

type AllowedKey = typeof ALLOWED_KEYS[number];

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

// Ensure value is JSON-safe and bounded; throws nothing, returns {ok, value|reason}
function sanitizeValue(key: string, value: unknown): { ok: true; value: unknown } | { ok: false; reason: string } {
  if (value === undefined) return { ok: false, reason: 'undefined' }

  if (key === 'user_budget') {
    if (value === null) return { ok: true, value: null }
    if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, reason: 'number_required' }
    if (value < 0 || value > 10_000_000) return { ok: false, reason: 'out_of_range' }
    return { ok: true, value }
  }

  if (key === 'dietary_tags') {
    if (value === null) return { ok: true, value: null }
    if (!Array.isArray(value)) return { ok: false, reason: 'array_required' }
    if (value.length > MAX_ARRAY_ITEMS) return { ok: false, reason: 'too_many' }
    const out: string[] = []
    for (const v of value) {
      if (typeof v !== 'string') return { ok: false, reason: 'string_items_required' }
      if (v.length > MAX_STRING_LEN) return { ok: false, reason: 'string_too_long' }
      out.push(v)
    }
    return { ok: true, value: out }
  }

  if (key === 'image_overrides') {
    if (value === null) return { ok: true, value: null }
    if (typeof value !== 'object' || Array.isArray(value)) return { ok: false, reason: 'object_required' }
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length > MAX_ARRAY_ITEMS) return { ok: false, reason: 'too_many' }
    const out: Record<string, unknown> = {}
    for (const [k, v] of entries) {
      if (k.length > MAX_STRING_LEN) return { ok: false, reason: 'key_too_long' }
      if (typeof v !== 'string' && v !== null) return { ok: false, reason: 'string_or_null' }
      if (typeof v === 'string' && v.length > MAX_STRING_LEN * 10) return { ok: false, reason: 'value_too_long' }
      out[k] = v
    }
    return { ok: true, value: out }
  }

  // Array-of-strings keys: favorites, history, pantry, shopping, reminders
  if (value === null) return { ok: true, value: null }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) return { ok: false, reason: 'too_many' }
    const out: string[] = []
    for (const v of value) {
      if (typeof v !== 'string') return { ok: false, reason: 'string_items_required' }
      if (v.length > MAX_STRING_LEN) return { ok: false, reason: 'string_too_long' }
      out.push(v)
    }
    return { ok: true, value: out }
  }
  // reminders could be object keyed by meal type; accept bounded object
  if (key === 'reminders' && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length > 10) return { ok: false, reason: 'too_many' }
    return { ok: true, value }
  }
  return { ok: false, reason: 'invalid_type' }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle()
  if (error) return errJson('Unable to load preferences.', 'db_error', 500)
  return NextResponse.json({ preferences: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)

  // Size guard before parsing
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    return errJson('Payload too large.', 'payload_too_large', 413)
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errJson('Invalid body.', 'invalid_body', 400)
  }

  const updates: Partial<Record<AllowedKey, unknown>> = {}
  for (const [rawKey, rawValue] of Object.entries(body as Record<string, unknown>)) {
    if (!(ALLOWED_KEYS as readonly string[]).includes(rawKey)) continue
    const key = rawKey as AllowedKey
    if (rawValue === undefined) continue
    const res = sanitizeValue(key, rawValue)
    if (!res.ok) return errJson(`Invalid value for ${key}: ${res.reason}`, 'invalid_value', 400)
    updates[key] = res.value
  }

  if (Object.keys(updates).length === 0) {
    return errJson('No updatable fields.', 'nothing_to_update', 400)
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return errJson('Unable to save preferences.', 'db_error', 500)
  return NextResponse.json({ preferences: data })
}