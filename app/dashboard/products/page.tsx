'use client'

import { useState } from 'react'
import { useProducts } from '@/lib/api/hooks/use-products'
import { DataTable, EmptyState } from '@/components/dashboard/dashboard-cards'
import { Plus, Search, Package } from 'lucide-react'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const { data, isPending, isError } = useProducts()
  const all = data?.items ?? []
  const q = search.trim().toLowerCase()
  const products = q
    ? all.filter((p) => [p.name, p.sku, p.category, p.description].some((f) => f?.toLowerCase().includes(q)))
    : all

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="mt-2 text-muted-foreground">Manage your product inventory and pricing.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
          <Plus className="size-5" />
          Add Product
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isPending ? (
          <div className="p-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Could not load products.</div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8" />}
            title={q ? 'No matching products' : 'No products yet'}
            description={q ? 'Try a different search.' : 'Your products will appear here once you add them.'}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'description', label: 'Description', render: (v) => (v as string) || '—' },
              { key: 'price', label: 'Price', render: (value) => `$${value}` },
              { key: 'quantity', label: 'Quantity' },
              { key: 'sku', label: 'SKU' },
              { key: 'category', label: 'Category', render: (v) => (v as string) || '—' },
            ]}
            data={products}
          />
        )}
      </div>
    </div>
  )
}
