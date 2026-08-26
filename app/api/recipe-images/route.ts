import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const bucket = 'recipe-images'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const recipeId = String(formData.get('recipeId') || '').trim()
  const file = formData.get('file')
  if (!recipeId || !(file instanceof File) || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid image upload' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 8MB or smaller' }, { status: 413 })
  const { data: recipe } = await supabase.from('recipes').select('id').eq('id', recipeId).maybeSingle()
  if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.some((item) => item.id === bucket)) {
    const { error } = await admin.storage.createBucket(bucket, { public: false })
    if (error && !error.message.toLowerCase().includes('already exists')) {
      return NextResponse.json({ error: 'Storage is not ready' }, { status: 503 })
    }
  }

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${user.id}/${recipeId}.${extension}`
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true })
  if (uploadError) return NextResponse.json({ error: 'Could not save image' }, { status: 500 })

  const { data, error: signedError } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)
  if (signedError || !data?.signedUrl) return NextResponse.json({ error: 'Could not prepare image' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl, path })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { path } = await request.json()
  if (typeof path !== 'string' || !path.startsWith(`${user.id}/`)) return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const { error } = await admin.storage.from(bucket).remove([path])
  if (error) return NextResponse.json({ error: 'Could not remove image' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
