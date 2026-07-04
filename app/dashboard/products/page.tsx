'use client'

import { mockProducts } from '@/lib/dashboard-data'
import { DataTable } from '@/components/dashboard/dashboard-cards'
import { Plus, Search } from 'lucide-react'

export default function ProductsPage() {
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
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'description', label: 'Description' },
            {
              key: 'price',
              label: 'Price',
              render: (value) => `$${value}`,
            },
            {
              key: 'quantity',
              label: 'Quantity',
            },
            { key: 'sku', label: 'SKU' },
            { key: 'category', label: 'Category' },
          ]}
          data={mockProducts}
        />
      </div>
    </div>
  )
}
