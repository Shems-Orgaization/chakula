import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : ''
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })

  const [{ data: recipes }, { data: preferences }] = await Promise.all([
    supabase.from('recipes').select('id,name,description,category,meal_type,difficulty,total_time_minutes,cost_min_kes,cost_max_kes,ingredients,dietary_tags').eq('is_published', true).limit(100),
    supabase.from('user_preferences').select('pantry,favorites,history').eq('user_id', user.id).maybeSingle(),
  ])

  const context = JSON.stringify({ recipes: recipes ?? [], pantry: preferences?.pantry ?? [], favorites: preferences?.favorites ?? [], history: preferences?.history ?? [] })
  const result = await generateText({
    model: 'openai/gpt-4.1-mini',
    system: 'You are Chakula Assistant, a practical Kenyan meal-planning guide. Recommend only recipes from the supplied catalogue. Be concise, friendly, realistic about ingredients and costs, and never invent a recipe record. Mention when a suggestion is based on the user pantry.',
    prompt: `Catalogue and user context:\n${context}\n\nUser request: ${message}`,
    maxOutputTokens: 500,
  })

  return Response.json({ answer: result.text })
}
