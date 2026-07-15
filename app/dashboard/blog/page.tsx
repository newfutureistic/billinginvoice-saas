'use client'

import { useState } from 'react'
import { Plus, X, Star, Trash2, RotateCcw, Pencil, Eye, EyeOff } from 'lucide-react'
import { useAdminBlogPosts, useCreateBlog, useUpdateBlog, useDeleteBlog, useRestoreBlog } from '@/lib/api/hooks/use-blog'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import { ApiError } from '@/lib/api/errors'
import type { BlogPostDTO } from '@/lib/dto/blog.dto'

type FormState = {
  id?: string
  title: string
  slug: string
  category: string
  tags: string
  excerpt: string
  coverImage: string
  coverAlt: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  featured: boolean
  pinned: boolean
  metaTitle: string
  metaDescription: string
}

const EMPTY: FormState = {
  title: '', slug: '', category: 'General', tags: '', excerpt: '', coverImage: '', coverAlt: '',
  content: '', status: 'DRAFT', featured: false, pinned: false, metaTitle: '', metaDescription: '',
}

export default function AdminBlogPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const { data, isPending, isError } = useAdminBlogPosts({ page, status: status || undefined, q: q || undefined })
  const create = useCreateBlog()
  const update = useUpdateBlog()
  const del = useDeleteBlog()
  const restore = useRestoreBlog()
  const workspaceId = useActiveWorkspace()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const posts = data?.items ?? []
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  function newPost() {
    setForm(EMPTY)
    setShowForm(true)
    setNotice(null)
  }

  async function editPost(id: string) {
    setNotice(null)
    try {
      const p = await http.get<BlogPostDTO>(`/blog/${id}`, { workspaceId })
      setForm({
        id: p.id, title: p.title, slug: p.slug, category: p.category, tags: p.tags.join(', '),
        excerpt: p.excerpt ?? '', coverImage: p.coverImage ?? '', coverAlt: p.coverAlt ?? '',
        content: p.content, status: p.status, featured: p.featured, pinned: p.pinned,
        metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
      })
      setShowForm(true)
    } catch {
      setNotice({ ok: false, text: 'Could not load that post' })
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setNotice(null)
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category.trim() || 'General',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      excerpt: form.excerpt.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      coverAlt: form.coverAlt.trim() || undefined,
      content: form.content,
      status: form.status,
      featured: form.featured,
      pinned: form.pinned,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
    }
    try {
      if (form.id) await update.mutateAsync({ id: form.id, data: payload })
      else await create.mutateAsync(payload)
      setNotice({ ok: true, text: form.id ? 'Post updated.' : 'Post created.' })
      setShowForm(false)
      setForm(EMPTY)
    } catch (err) {
      setNotice({ ok: false, text: err instanceof ApiError ? err.message : 'Could not save the post' })
    }
  }

  async function toggleStatus(p: { id: string; status: string }) {
    await update.mutateAsync({ id: p.id, data: { status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } })
  }
  async function toggleFeatured(p: { id: string; featured: boolean }) {
    await update.mutateAsync({ id: p.id, data: { featured: !p.featured } })
  }

  const inputCls = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm'

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <p className="mt-2 text-muted-foreground">Create, publish, and manage blog articles.</p>
        </div>
        <button onClick={showForm ? () => setShowForm(false) : newPost} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
          {showForm ? <X className="size-5" /> : <Plus className="size-5" />}
          {showForm ? 'Close' : 'New Post'}
        </button>
      </div>

      {notice && (
        <p className={`rounded-lg border px-4 py-2 text-sm ${notice.ok ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/5 text-destructive'}`} role="status">
          {notice.text}
        </p>
      )}

      {showForm && (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="text-lg font-semibold text-foreground">{form.id ? 'Edit post' : 'New post'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-medium">Title</label><input required value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium">Slug (optional)</label><input value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="auto from title" className={inputCls} /></div>
            <div><label className="text-sm font-medium">Category</label><input value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium">Tags (comma-separated)</label><input value={form.tags} onChange={(e) => set({ tags: e.target.value })} className={inputCls} /></div>
          </div>
          <div><label className="text-sm font-medium">Excerpt</label><textarea value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={2} className={inputCls} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-medium">Cover image URL</label><input value={form.coverImage} onChange={(e) => set({ coverImage: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium">Cover alt text</label><input value={form.coverAlt} onChange={(e) => set({ coverAlt: e.target.value })} className={inputCls} /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Content (Markdown)</label>
            <textarea required value={form.content} onChange={(e) => set({ content: e.target.value })} rows={12} className={`${inputCls} font-mono`} placeholder="# Heading&#10;&#10;Write your article in Markdown…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-medium">Meta title (SEO)</label><input value={form.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium">Meta description (SEO)</label><input value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="text-sm font-medium">Status
              <select value={form.status} onChange={(e) => set({ status: e.target.value as FormState['status'] })} className="ml-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} className="size-4" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.pinned} onChange={(e) => set({ pinned: e.target.checked })} className="size-4" /> Pinned
            </label>
          </div>
          <button type="submit" disabled={create.isPending || update.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
            {create.isPending || update.isPending ? 'Saving…' : form.id ? 'Save changes' : 'Create post'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search posts…" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading posts…</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Could not load posts.</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No posts yet. Create your first article.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className={p.deletedAt ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{p.title}</span>
                    {p.featured && <Star className="ml-1 inline size-3.5 text-warning" fill="currentColor" />}
                    <span className="block text-xs text-muted-foreground">/{p.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {p.deletedAt ? 'Deleted' : p.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.deletedAt ? (
                        <button onClick={() => restore.mutate(p.id)} title="Restore" className="rounded-lg border border-border p-1.5 hover:bg-muted"><RotateCcw className="size-4" /></button>
                      ) : (
                        <>
                          <button onClick={() => toggleStatus(p)} title={p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'} className="rounded-lg border border-border p-1.5 hover:bg-muted">
                            {p.status === 'PUBLISHED' ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                          <button onClick={() => toggleFeatured(p)} title="Toggle featured" className="rounded-lg border border-border p-1.5 hover:bg-muted"><Star className={`size-4 ${p.featured ? 'text-warning' : ''}`} /></button>
                          <button onClick={() => editPost(p.id)} title="Edit" className="rounded-lg border border-border p-1.5 hover:bg-muted"><Pencil className="size-4" /></button>
                          <button onClick={() => del.mutate(p.id)} title="Delete" className="rounded-lg border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span className="text-muted-foreground">Page {data.page} of {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
