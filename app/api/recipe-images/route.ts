import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

const GLOBAL = process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE === 'global'
const USER_BUCKET = 'recipe-images' // private, per-user
const GLOBAL_BUCKET = 'meal-photos' // public, shared by everyone
const ID_RE = /^[a-z0-9-]+$/i
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
const NOT_ADMIN = { error: 'Only admins can change meal photos' }

const adminClient = () =>
  createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

async function ensureBucket(admin: ReturnType<typeof adminClient>, name: string, isPublic: boolean) {
  const { data: buckets } = await admin.storage.listBuckets()
  if (buckets?.some((b) => b.id === name)) return true
  const { error } = await admin.storage.createBucket(name, { public: isPublic })
  return !error || error.message.toLowerCase().includes('already exists')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (GLOBAL && !(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })

  const formData = await request.formData()
  const recipeId = String(formData.get('recipeId') || '').trim()
  const file = formData.get('file')
  if (!ID_RE.test(recipeId) || !(file instanceof File) || !EXT[file.type]) {
    return NextResponse.json({ error: 'Use a JPG, PNG or WebP image' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 8MB or smaller' }, { status: 413 })
  const { data: recipe } = await supabase.from('recipes').select('id').eq('id', recipeId).maybeSingle()
  if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const admin = adminClient()
  const bucket = GLOBAL ? GLOBAL_BUCKET : USER_BUCKET
  if (!(await ensureBucket(admin, bucket, GLOBAL))) return NextResponse.json({ error: 'Storage is not ready' }, { status: 503 })
  const ext = EXT[file.type]

  if (GLOBAL) {
    const path = `${recipeId}/${Date.now()}.${ext}`
    const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, { contentType: file.type })
    if (uploadError) return NextResponse.json({ error: 'Could not save image' }, { status: 500 })
    const url = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
    const { error: dbError } = await admin.from('recipes').update({ image_url: url }).eq('id', recipeId)
    if (dbError) {
      await admin.storage.from(bucket).remove([path])
      return NextResponse.json({ error: 'Could not save to database' }, { status: 500 })
    }
    const { data: old } = await admin.storage.from(bucket).list(recipeId)
    const stale = (old ?? []).map((f) => `${recipeId}/${f.name}`).filter((p) => p !== path)
    if (stale.length) await admin.storage.from(bucket).remove(stale)
    return NextResponse.json({ url, path, scope: 'global' })
  }

  const path = `${user.id}/${recipeId}.${ext}`
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true })
  if (uploadError) return NextResponse.json({ error: 'Could not save image' }, { status: 500 })
  const { data, error: signedError } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)
  if (signedError || !data?.signedUrl) return NextResponse.json({ error: 'Could not prepare image' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl, path, scope: 'user' })
}

// Save a pasted image link (global mode, admin only). Uses no storage.
export async function PATCH(request: Request) {
  if (!GLOBAL) return NextResponse.json({ error: 'Links only work in global mode' }, { status: 400 })
  if (!(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const recipeId = typeof body.recipeId === 'string' ? body.recipeId.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!ID_RE.test(recipeId) || !/^https:\/\/\S+$/i.test(url) || url.length > 2000) {
    return NextResponse.json({ error: 'Paste a valid https:// image link' }, { status: 400 })
  }
  const { error } = await adminClient().from('recipes').update({ image_url: url }).eq('id', recipeId)
  if (error) return NextResponse.json({ error: 'Could not save to database' }, { status: 500 })
  return NextResponse.json({ url, scope: 'global' })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const recipeId = new URL(request.url).searchParams.get('recipeId')?.trim() ?? ''
  if (!ID_RE.test(recipeId)) return NextResponse.json({ error: 'Invalid recipe id' }, { status: 400 })
  if (GLOBAL && !(await requireAdmin())) return NextResponse.json(NOT_ADMIN, { status: 403 })

  const admin = adminClient()
  if (GLOBAL) {
    const { error: dbError } = await admin.from('recipes').update({ image_url: null }).eq('id', recipeId)
    if (dbError) return NextResponse.json({ error: 'Could not update database' }, { status: 500 })
    const { data: files } = await admin.storage.from(GLOBAL_BUCKET).list(recipeId)
    const paths = (files ?? []).map((f) => `${recipeId}/${f.name}`)
    if (paths.length) await admin.storage.from(GLOBAL_BUCKET).remove(paths)
    return NextResponse.json({ ok: true, scope: 'global' })
  }

  const { data: files } = await admin.storage.from(USER_BUCKET).list(user.id, { search: recipeId })
  const paths = (files ?? []).filter((f) => f.name.startsWith(`${recipeId}.`)).map((f) => `${user.id}/${f.name}`)
  if (paths.length) {
    const { error } = await admin.storage.from(USER_BUCKET).remove(paths)
    if (error) return NextResponse.json({ error: 'Could not remove image' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, scope: 'user' })
}