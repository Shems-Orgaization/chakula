import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminServiceClient } from '@/lib/auth/admin-service'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await createAdminServiceClient().auth.admin.listUsers({ page: 1, perPage: 100 })
  if (error) return NextResponse.json({ error: 'Could not load users' }, { status: 500 })
  return NextResponse.json({ users: data.users.map((user) => ({ id: user.id, email: user.email, confirmed: Boolean(user.email_confirmed_at), createdAt: user.created_at, role: user.app_metadata?.role ?? 'user' })) })
}
