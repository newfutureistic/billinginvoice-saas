export interface InvoiceTemplate {
  id: string
  name: string
  description: string
  category: 'classic' | 'modern' | 'minimal' | 'corporate' | 'luxury' | 'dark' | 'creative' | 'elegant'
  preview: string
  colors: {
    primary: string
    accent: string
    text: string
    background: string
  }
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and professional',
    category: 'classic',
    preview: 'Classic invoice template',
    colors: {
      primary: '#0f172a',
      accent: '#1e40af',
      text: '#1e293b',
      background: '#ffffff',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary',
    category: 'modern',
    preview: 'Modern invoice template',
    colors: {
      primary: '#1f2937',
      accent: '#3b82f6',
      text: '#111827',
      background: '#f9fafb',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simplicity and focus',
    category: 'minimal',
    preview: 'Minimal invoice template',
    colors: {
      primary: '#6b7280',
      accent: '#9ca3af',
      text: '#4b5563',
      background: '#fafafa',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Enterprise and formal',
    category: 'corporate',
    preview: 'Corporate invoice template',
    colors: {
      primary: '#1e3a8a',
      accent: '#2563eb',
      text: '#0c1117',
      background: '#ffffff',
    },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium and elegant',
    category: 'luxury',
    preview: 'Luxury invoice template',
    colors: {
      primary: '#d4af37',
      accent: '#2d2d2d',
      text: '#2d2d2d',
      background: '#f5f5f5',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Modern dark mode',
    category: 'dark',
    preview: 'Dark invoice template',
    colors: {
      primary: '#1f2937',
      accent: '#60a5fa',
      text: '#e5e7eb',
      background: '#111827',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and artistic',
    category: 'creative',
    preview: 'Creative invoice template',
    colors: {
      primary: '#dc2626',
      accent: '#f97316',
      text: '#7c2d12',
      background: '#fef3c7',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined and sophisticated',
    category: 'elegant',
    preview: 'Elegant invoice template',
    colors: {
      primary: '#5b21b6',
      accent: '#a78bfa',
      text: '#3f0f5c',
      background: '#faf5ff',
    },
  },
]

export function getTemplate(templateId: string): InvoiceTemplate | undefined {
  return INVOICE_TEMPLATES.find((t) => t.id === templateId)
}
