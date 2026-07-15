/* Invoice Data Structures */

export type TaxType = 'GST' | 'VAT' | 'Sales Tax' | 'Custom'
export type TaxBasis = 'inclusive' | 'exclusive'
export type Currency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'INR'
  | 'JPY'
  | 'AED'
  | 'SGD'
  | 'CHF'
  | 'NZD'
  | 'SAR'
  | 'QAR'
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
  gstin?: string
  pan?: string
  website?: string
  businessType: string
}

export type PaymentMethod = 'bank' | 'upi' | 'cash' | 'cheque' | 'card' | 'other'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

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
  gstin?: string
}

export interface InvoiceItem {
  id: string
  description: string
  hsn?: string // HSN/SAC code (India GST)
  sku?: string
  quantity: number
  rate: number
  unit: string // e.g., "hours", "items"
}

export interface TaxConfig {
  type: TaxType
  rate: number
  basis: TaxBasis
  customLabel?: string
  /** GST place-of-supply: 'intra' → CGST + SGST split, 'inter' → single IGST line. */
  supplyType?: 'intra' | 'inter'
}

export interface InvoiceData {
  // Metadata
  id: string
  /** Document heading shown on the PDF/preview (e.g. Invoice, Quotation, Proforma Invoice). */
  documentTitle?: string
  invoiceNumber: string
  invoicePrefix?: string
  poNumber?: string
  referenceNumber?: string
  issueDate: string // ISO date
  dueDate: string // ISO date
  template: string // template ID
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus

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
  additionalCharges?: {
    label: string
    amount: number
    applied: boolean
  }
  roundOff?: boolean
  tax: TaxConfig
  total: number

  // Branding
  brandColor: string
  logoUrl?: string
  watermark?: string
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
    ifsc?: string
    swift?: string
    iban?: string
    branch?: string
  }
  qrCode?: string

  // Payment / UPI (India)
  upiId?: string
  upiPayeeName?: string
  upiIncludeAmount?: boolean

  // Signature / authorized signatory
  signatureUrl?: string
  signatureLabel?: string

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
