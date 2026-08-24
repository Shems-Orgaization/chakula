'use client'

import { useEffect, useState } from 'react'
import { ChefHat, Loader2, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'

type Recipe = { id: string; name: string; slug: string; category: string; meal_type: string; description: string; is_published: boolean; total_time_minutes: number }
type User = { id: string; email?: string; confirmed: boolean; createdAt: string; role: string }

const emptyRecipe = { name: '', slug: '', category: 'Dinner', meal_type: 'Dinner', description: '', total_time_minutes: 30, is_published: true }

export default function AdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState(emptyRecipe)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const [recipeResponse, userResponse] = await Promise.all([fetch('/api/admin/recipes'), fetch('/api/admin/users')])
    if (recipeResponse.ok) setRecipes((await recipeResponse.json()).recipes)
    if (userResponse.ok) setUsers((await userResponse.json()).users)
    if (!recipeResponse.ok) setMessage('Admin access is required. Sign out and sign back in after promotion.')
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    const response = await fetch('/api/admin/recipes', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editing }) })
    if (!response.ok) setMessage((await response.json()).error ?? 'Could not save recipe')
    else { setForm(emptyRecipe); setEditing(null); setMessage('Recipe saved to Supabase.'); await load() }
    setSaving(false)
  }
  async function remove(id: string) {
    if (!window.confirm('Delete this recipe from the catalogue?')) return
    const response = await fetch('/api/admin/recipes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (response.ok) await load(); else setMessage('Could not delete recipe.')
  }

  return <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Chakula control room</p><h1 className="section-title mt-3">Admin workspace</h1><p className="mt-3 max-w-xl leading-6 text-muted-foreground">Keep the recipe catalogue useful, current, and trustworthy for every home cook.</p></div>
        <div className="flex items-center gap-2 rounded-full border border-accent/40 bg-secondary px-4 py-3 text-sm font-semibold"><ShieldCheck className="size-4 text-accent" /> Admin access</div>
      </header>
      {message && <p role="status" className="rounded-2xl border border-accent/40 bg-secondary p-4 text-sm">{message}</p>}
      {loading ? <div className="panel flex items-center gap-3"><Loader2 className="size-5 animate-spin" /> Loading live Supabase data...</div> : <>
        <section className="grid gap-4 sm:grid-cols-3"><div className="panel"><ChefHat className="mb-5 size-5 text-accent" /><p className="text-3xl font-semibold">{recipes.length}</p><p className="text-sm text-muted-foreground">Recipes</p></div><div className="panel"><Users className="mb-5 size-5 text-accent" /><p className="text-3xl font-semibold">{users.length}</p><p className="text-sm text-muted-foreground">Registered users</p></div><div className="panel"><ShieldCheck className="mb-5 size-5 text-accent" /><p className="text-3xl font-semibold">{recipes.filter((r) => r.is_published).length}</p><p className="text-sm text-muted-foreground">Published recipes</p></div></section>
        <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <form onSubmit={save} className="panel flex flex-col gap-4"><div><p className="eyebrow">Catalogue editor</p><h2 className="mt-2 font-serif text-3xl">{editing ? 'Edit recipe' : 'Add recipe'}</h2></div>
            <label className="field-label">Name<input className="text-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} /></label>
            <label className="field-label">Slug<input className="text-input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Category<input className="text-input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label><label className="field-label">Meal type<select className="text-input" value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label></div>
            <label className="field-label">Description<textarea className="text-input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="field-label">Minutes<input className="text-input" type="number" min="1" value={form.total_time_minutes} onChange={(e) => setForm({ ...form, total_time_minutes: Number(e.target.value) })} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
            <div className="flex gap-3"><button className="primary-button" disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}{editing ? 'Save changes' : 'Create recipe'}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(emptyRecipe) }}>Cancel</button>}</div>
          </form>
          <div className="panel"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Live catalogue</p><h2 className="mt-2 font-serif text-3xl">Recipes</h2></div></div><div className="flex flex-col divide-y divide-border">{recipes.map((recipe) => <div key={recipe.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate font-semibold">{recipe.name}</p><p className="text-sm text-muted-foreground">{recipe.category} · {recipe.total_time_minutes} min · {recipe.is_published ? 'Published' : 'Draft'}</p></div><div className="flex shrink-0 gap-2"><button className="text-button" onClick={() => { setEditing(recipe.id); setForm({ ...emptyRecipe, ...recipe }) }}>Edit</button><button aria-label={`Delete ${recipe.name}`} className="icon-button" onClick={() => remove(recipe.id)}><Trash2 className="size-4" /></button></div></div>)}</div></div>
        </section>
        <section className="panel"><p className="eyebrow">Account visibility</p><h2 className="mt-2 font-serif text-3xl">Registered users</h2><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr><th className="px-2 py-3">Email</th><th className="px-2 py-3">Status</th><th className="px-2 py-3">Role</th><th className="px-2 py-3">Joined</th></tr></thead><tbody className="divide-y divide-border">{users.map((user) => <tr key={user.id}><td className="px-2 py-3 font-medium">{user.email ?? '—'}</td><td className="px-2 py-3">{user.confirmed ? 'Confirmed' : 'Pending'}</td><td className="px-2 py-3">{user.role}</td><td className="px-2 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
      </>}
    </div>
  </main>
}
