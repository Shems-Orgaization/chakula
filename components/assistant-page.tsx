// app/assistant/page.tsx
'use client'

import { FormEvent, useState } from 'react'
import { Loader2, Send, Sparkles, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function AssistantPage() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() || loading) return

    setLoading(true)
    setAnswer('')
    
    const res = await apiClient('/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ message: message.trim() })
    })

    if (res.ok) {
      const nextAnswer = res.data.answer || ''
      setAnswer(nextAnswer)
      setHistory((items) => [{ question: message.trim(), answer: nextAnswer }, ...items].slice(0, 5))
      setMessage('')
    } else {
      toast.error(res.error)
    }
    
    setLoading(false)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 py-12 lg:py-20">
      <div>
        <p className="eyebrow text-accent flex items-center gap-2">
          <Sparkles className="size-4" /> Chakula Assistant
        </p>
        <h1 className="section-title mt-3">Make something good from what you have.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Ask for a Kenyan meal, a pantry-friendly idea, substitutions, or help planning your next plate.
        </p>
      </div>

      <div className="panel min-h-64 flex flex-col justify-center p-6 rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-accent mb-3" />
            <p>Thinking of the perfect meal...</p>
          </div>
        ) : answer ? (
          <div>
            <p className="eyebrow text-accent">Your meal guide</p>
            <p className="mt-4 whitespace-pre-wrap leading-8">{answer}</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Utensils className="size-10 mx-auto mb-4 opacity-20" />
            <p>Try: “I have rice, tomatoes and eggs. What can I cook in 20 minutes?”</p>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="panel flex flex-col gap-3 sm:flex-row p-4 rounded-2xl border border-border bg-card">
        <label className="sr-only" htmlFor="assistant-message">Ask Chakula Assistant</label>
        <textarea 
          id="assistant-message" 
          className="min-h-24 flex-1 resize-none bg-transparent px-2 py-2 outline-none text-sm placeholder:text-muted-foreground" 
          value={message} 
          onChange={(event) => setMessage(event.target.value)} 
          placeholder="What would you like to cook?" 
          maxLength={1000} 
        />
        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60 sm:self-stretch" 
          disabled={loading || !message.trim()}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Ask assistant
        </button>
      </form>

      {/* History */}
      {history.length > 1 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Questions</p>
          <div className="flex flex-col gap-2">
            {history.slice(1).map((h, i) => (
              <button 
                key={i}
                onClick={() => setAnswer(h.answer)}
                className="text-left text-sm p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition"
              >
                <span className="font-semibold">{h.question}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}