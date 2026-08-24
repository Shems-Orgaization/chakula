'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('')
    if (name.trim().length < 2) return setError('Please enter your full name.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { data, error } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`, data: { display_name: name.trim() } } })
    setLoading(false)
    if (error) return setError(error.message.toLowerCase().includes('already') ? 'An account may already exist for this email.' : 'Unable to create your account. Please check your details.')
    if (data.session) router.replace('/')
    else setMessage('Account created. Check your email to confirm your account, then sign in.')
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><form onSubmit={submit} className="panel w-full max-w-md"><p className="eyebrow text-accent">chakula</p><h1 className="mt-3 font-serif text-4xl">Make meals yours.</h1><p className="mt-3 leading-6 text-muted-foreground">Create an account to keep your pantry, plans, and favourites synced.</p><label className="field-label mt-8">Full name<input className="text-input mt-2 w-full" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label><label className="field-label mt-4">Email<input className="text-input mt-2 w-full" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label><label className="field-label mt-4">Password<input className="text-input mt-2 w-full" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label><label className="field-label mt-4">Confirm password<input className="text-input mt-2 w-full" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></label>{error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}{message && <p className="mt-4 text-sm text-accent" role="status">{message}</p>}<button className="primary-button mt-6 w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button><p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-semibold text-accent hover:underline" href="/login">Sign in</Link></p></form></main>
}
