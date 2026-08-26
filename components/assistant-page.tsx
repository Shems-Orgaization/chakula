'use client'

import { FormEvent, useState } from 'react'

export function AssistantPage() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() || loading) return
    setLoading(true)
    setError('')
    setAnswer('')
    const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) setError(payload.error || 'The assistant could not respond.')
    else { const nextAnswer = payload.answer || ''; setAnswer(nextAnswer); setHistory((items) => [{ question: message.trim(), answer: nextAnswer }, ...items].slice(0, 5)) }
    setLoading(false)
  }

  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 py-12 lg:py-20">
    <div><p className="eyebrow">Chakula assistant</p><h1 className="section-title mt-3">Make something good from what you have.</h1><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Ask for a Kenyan meal, a pantry-friendly idea, substitutions, or help planning your next plate.</p></div>
    <div className="panel min-h-64">{answer ? <div><p className="eyebrow text-accent">Your meal guide</p><p className="mt-4 whitespace-pre-wrap leading-8">{answer}</p></div> : <p className="text-muted-foreground">Try: “I have rice, tomatoes and eggs. What can I cook in 20 minutes?”</p>}{error && <p className="mt-4 text-destructive">{error}</p>}</div>
    <form onSubmit={submit} className="panel flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="assistant-message">Ask Chakula Assistant</label><textarea id="assistant-message" className="text-input min-h-24 flex-1 resize-none" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to cook?" maxLength={1000} /><button className="primary-button self-end sm:self-stretch" disabled={loading}>{loading ? 'Thinking…' : 'Ask assistant'}</button></form>
  </main>
}
