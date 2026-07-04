/* Invoice Data Structures */

export type TaxType = 'GST' | 'VAT' | 'Sales Tax' | 'Custom'
export type TaxBasis = 'inclusive' | 'exclusive'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY'
export type PreviewMode = 'desktop' | 'tablet' | 'mobile'

export interface BusinessDetails {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  taxId: string
  businessType: string
}

export interface ClientDetails {
  clientName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  taxId: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  unit: string // e.g., "hours", "items"
}

export interface TaxConfig {
  type: TaxType
  rate: number
  basis: TaxBasis
  customLabel?: string
}

export interface InvoiceData {
  // Metadata
  id: string
  invoiceNumber: string
  issueDate: string // ISO date
  dueDate: string // ISO date
  template: string // template ID
  status: 'draft' | 'sent' | 'paid' | 'overdue'

  // Core sections
  business: BusinessDetails
  client: ClientDetails
  items: InvoiceItem[]
  currency: Currency
  
  // Financial
  subtotal: number
  discount: {
    type: 'percentage' | 'fixed'
    value: number
    applied: boolean
  }
  shipping: {
    cost: number
    applied: boolean
  }
  tax: TaxConfig
  total: number

  // Branding
  brandColor: string
  logoUrl?: string
  brandingSection: {
    showLogo: boolean
    showBrandColor: boolean
    customAccentColor?: string
  }

  // Additional
  notes: string
  terms: string
  paymentInstructions: string
  bankDetails: {
    accountName: string
    accountNumber: string
    routingNumber: string
    bankName: string
  }
  qrCode?: string

  // UI State
  lastModified: string
  createdAt: string
  autoSaveEnabled: boolean
}

export interface InvoiceStep {
  id: number
  title: string
  description: string
  fieldCount: number
  completed: boolean
}
