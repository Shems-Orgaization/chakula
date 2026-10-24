// app/api/shared-plans/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const MAX_PLAN_ITEMS = 31
const MAX_PLAN_ITEM_BYTES = 8_000
const MAX_TOTAL_BYTES = 100_000
const TOKEN_RE = /^[A-Za-z0-9]{8,128}$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// GET — public share lookup by exact token, service client, plan fields only.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token || !TOKEN_RE.test(token)) return errJson('token is required.', 'token_invalid', 400)

  const svc = serviceClient()
  if (!svc) return errJson('Shared plan not found.', 'not_found', 404)

  const nowIso = new Date().toISOString()

  const { data, error } = await svc
    .from('shared_plans')
    .select('id, plan, created_at, expires_at')
    .eq('share_token', token)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(1)
    .maybeSingle()

  if (error || !data) return errJson('Shared plan not found.', 'not_found', 404)

  // Return only plan fields (id, plan, created_at, expires_at) — no user_id, no share_token.
  return NextResponse.json({ plan: { id: data.id, plan: data.plan, created_at: data.created_at, expires_at: data.expires_at } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_TOTAL_BYTES) {
    return errJson('Payload too large.', 'payload_too_large', 413)
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errJson('Invalid body.', 'invalid_body', 400)
  }
  if (!Array.isArray(body.plan)) return errJson('plan must be an array.', 'plan_invalid', 400)
  if (body.plan.length > MAX_PLAN_ITEMS) return errJson('plan too large.', 'plan_too_large', 413)

  // Cap per-item size
  for (const item of body.plan) {
    let size = 0
    try { size = JSON.stringify(item)?.length ?? 0 } catch { return errJson('plan item not serializable.', 'plan_item_invalid', 400) }
    if (size > MAX_PLAN_ITEM_BYTES) return errJson('plan item too large.', 'plan_item_too_large', 413)
  }

  let expiresAt: string | null = null
  if (body.expiresAt !== undefined && body.expiresAt !== null) {
    if (typeof body.expiresAt !== 'string' || !ISO_RE.test(body.expiresAt)) {
      return errJson('expiresAt invalid.', 'expires_at_invalid', 400)
    }
    const ts = Date.parse(body.expiresAt)
    if (!Number.isFinite(ts)) return errJson('expiresAt invalid.', 'expires_at_invalid', 400)
    if (ts <= Date.now()) return errJson('expiresAt must be in the future.', 'expires_at_in_past', 400)
    expiresAt = new Date(ts).toISOString()
  }

  const token = crypto.randomUUID().replaceAll('-', '')

  const { data, error } = await supabase
    .from('shared_plans')
    .insert({ user_id: user.id, share_token: token, plan: body.plan.slice(0, MAX_PLAN_ITEMS), expires_at: expiresAt })
    .select('id, share_token, created_at, expires_at')
    .single()

  if (error) return errJson('Unable to create shared plan.', 'db_error', 500)
  return NextResponse.json({ share: data }, { status: 201 })
}