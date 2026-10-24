// app/api/recipe-images/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

const GLOBAL = process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE === 'global'
const USER_BUCKET = 'recipe-images' // private, per-user
const GLOBAL_BUCKET = 'meal-photos' // public, shared by everyone
const ID_RE = /^[a-z0-9-]+$/i
const URL_RE = /^https:\/\/\S+$/i
const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_URL_LEN = 2000
const MAX_FORM_BYTES = MAX_FILE_BYTES + 64 * 1024
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const NOT_ADMIN = { error: 'Only admins can change meal photos', code: 'forbidden' } as const

function errJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

const adminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function ensureBucket(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  name: string,
  isPublic: boolean
) {
  const { data: buckets, error: listErr } = await admin.storage.listBuckets()
  if (listErr) return false
  if (buckets?.some((b) => b.id === name || b.name === name)) return true
  const { error } = await admin.storage.createBucket(name, { public: isPublic })
  return !error || error.message.toLowerCase().includes('already exists')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)
  if (GLOBAL && !(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_FORM_BYTES) {
    return errJson('Image must be 8MB or smaller', 'payload_too_large', 413)
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    return errJson('Use a JPG, PNG or WebP image', 'invalid_content_type', 400)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return errJson('Use a JPG, PNG or WebP image', 'invalid_form_data', 400)
  }

  const rawRecipeId = formData.get('recipeId')
  const recipeId = typeof rawRecipeId === 'string' ? rawRecipeId.trim() : ''
  const file = formData.get('file')

  if (!ID_RE.test(recipeId) || recipeId.length > 80 || !(file instanceof File) || !EXT[file.type]) {
    return errJson('Use a JPG, PNG or WebP image', 'invalid_input', 400)
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return errJson('Image must be 8MB or smaller', 'payload_too_large', 413)
  }

  const { data: recipe, error: recipeErr } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .maybeSingle()
  if (recipeErr) return errJson('Could not save image', 'db_error', 500)
  if (!recipe) return errJson('Recipe not found', 'not_found', 404)

  const admin = adminClient()
  if (!admin) return errJson('Storage is not ready', 'storage_unavailable', 503)
  const bucket = GLOBAL ? GLOBAL_BUCKET : USER_BUCKET
  if (!(await ensureBucket(admin, bucket, GLOBAL))) {
    return errJson('Storage is not ready', 'storage_unavailable', 503)
  }
  const ext = EXT[file.type]

  if (GLOBAL) {
    const path = `${recipeId}/${Date.now()}.${ext}`
    const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, { contentType: file.type })
    if (uploadError) return errJson('Could not save image', 'storage_error', 500)
    const url = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
    const { error: dbError } = await admin.from('recipes').update({ image_url: url }).eq('id', recipeId)
    if (dbError) {
      await admin.storage.from(bucket).remove([path])
      return errJson('Could not save to database', 'db_error', 500)
    }
    const { data: old } = await admin.storage.from(bucket).list(recipeId)
    const stale = (old ?? []).map((f) => `${recipeId}/${f.name}`).filter((p) => p !== path)
    if (stale.length) await admin.storage.from(bucket).remove(stale)
    return NextResponse.json({ url, path, scope: 'global' })
  }

  const path = `${user.id}/${recipeId}.${ext}`
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: true,
  })
  if (uploadError) return errJson('Could not save image', 'storage_error', 500)
  const { data, error: signedError } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)
  if (signedError || !data?.signedUrl) return errJson('Could not prepare image', 'storage_error', 500)
  return NextResponse.json({ url: data.signedUrl, path, scope: 'user' })
}

// Save a pasted image link (global mode, admin only). Uses no storage.
export async function PATCH(request: Request) {
  if (!GLOBAL) return errJson('Links only work in global mode', 'mode_disabled', 400)
  if (!(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errJson('Paste a valid https:// image link', 'invalid_body', 400)
  }
  const recipeId = typeof body.recipeId === 'string' ? body.recipeId.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!ID_RE.test(recipeId) || recipeId.length > 80 || !URL_RE.test(url) || url.length > MAX_URL_LEN) {
    return errJson('Paste a valid https:// image link', 'invalid_input', 400)
  }

  const admin = adminClient()
  if (!admin) return errJson('Could not save to database', 'storage_unavailable', 503)
  const { error } = await admin.from('recipes').update({ image_url: url }).eq('id', recipeId)
  if (error) return errJson('Could not save to database', 'db_error', 500)
  return NextResponse.json({ url, scope: 'global' })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errJson('Unauthorized', 'unauthorized', 401)

  const recipeId = new URL(request.url).searchParams.get('recipeId')?.trim() ?? ''
  if (!ID_RE.test(recipeId) || recipeId.length > 80) {
    return errJson('Invalid recipe id', 'id_invalid', 400)
  }
  if (GLOBAL && !(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })

  const admin = adminClient()
  if (!admin) return errJson('Storage is not ready', 'storage_unavailable', 503)

  if (GLOBAL) {
    const { error: dbError } = await admin.from('recipes').update({ image_url: null }).eq('id', recipeId)
    if (dbError) return errJson('Could not update database', 'db_error', 500)
    const { data: files } = await admin.storage.from(GLOBAL_BUCKET).list(recipeId)
    const paths = (files ?? []).map((f) => `${recipeId}/${f.name}`)
    if (paths.length) {
      const { error: rmErr } = await admin.storage.from(GLOBAL_BUCKET).remove(paths)
      if (rmErr) return errJson('Could not remove image', 'storage_error', 500)
    }
    return NextResponse.json({ ok: true, scope: 'global' })
  }

  const { data: files, error: listErr } = await admin.storage.from(USER_BUCKET).list(user.id, { search: recipeId })
  if (listErr) return errJson('Could not remove image', 'storage_error', 500)
  const paths = (files ?? [])
    .filter((f) => f.name.startsWith(`${recipeId}.`))
    .map((f) => `${user.id}/${f.name}`)
  if (paths.length) {
    const { error } = await admin.storage.from(USER_BUCKET).remove(paths)
    if (error) return errJson('Could not remove image', 'storage_error', 500)
  }
  return NextResponse.json({ ok: true, scope: 'user' })
}