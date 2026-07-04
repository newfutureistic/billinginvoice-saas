import { InvoiceData } from './invoice-types'

export const MOCK_INVOICE: InvoiceData = {
  id: 'inv-001',
  invoiceNumber: 'INV-2024-001',
  issueDate: '2024-07-01',
  dueDate: '2024-08-01',
  template: 'modern',
  status: 'draft',

  business: {
    businessName: 'ToolForge Inc.',
    ownerName: 'Sarah Chen',
    email: 'sarah@toolforge.app',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    taxId: '12-3456789',
    businessType: 'Technology',
  },

  client: {
    clientName: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acme.com',
    phone: '+1 (555) 987-6543',
    address: '456 Business Blvd',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    taxId: '98-7654321',
  },

  items: [
    {
      id: '1',
      description: 'Web Development Services - UI/UX Design & Frontend',
      quantity: 40,
      rate: 150,
      unit: 'hours',
    },
    {
      id: '2',
      description: 'API Integration & Backend Setup',
      quantity: 20,
      rate: 200,
      unit: 'hours',
    },
    {
      id: '3',
      description: 'Testing & Quality Assurance',
      quantity: 10,
      rate: 125,
      unit: 'hours',
    },
  ],

  currency: 'USD',

  subtotal: 9500,
  discount: {
    type: 'percentage',
    value: 10,
    applied: true,
  },
  shipping: {
    cost: 0,
    applied: false,
  },
  tax: {
    type: 'GST',
    rate: 10,
    basis: 'exclusive',
  },
  total: 8550,

  brandColor: '#3b82f6',
  logoUrl: undefined,
  brandingSection: {
    showLogo: true,
    showBrandColor: true,
    customAccentColor: '#3b82f6',
  },

  notes: 'Thank you for your business. We look forward to working together.',
  terms:
    'Payment is due within 30 days of the invoice date. Late payments may incur a 1.5% monthly interest charge.',
  paymentInstructions: 'Please transfer funds to the bank account details provided below.',
  bankDetails: {
    accountName: 'ToolForge Inc.',
    accountNumber: '9876543210',
    routingNumber: '123456789',
    bankName: 'Tech Bank USA',
  },

  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  autoSaveEnabled: true,
}

// Calculate invoice totals
export function calculateInvoiceTotals(invoice: InvoiceData): Omit<InvoiceData, 'subtotal' | 'total'> & { subtotal: number; total: number } {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  
  let discountAmount = 0
  if (invoice.discount.applied) {
    if (invoice.discount.type === 'percentage') {
      discountAmount = (subtotal * invoice.discount.value) / 100
    } else {
      discountAmount = invoice.discount.value
    }
  }

  const afterDiscount = subtotal - discountAmount
  const shippingCost = invoice.shipping.applied ? invoice.shipping.cost : 0
  const subtotalBeforeTax = afterDiscount + shippingCost

  let tax = 0
  if (invoice.tax.type !== 'Custom' || invoice.tax.type === 'Custom') {
    if (invoice.tax.basis === 'exclusive') {
      tax = (subtotalBeforeTax * invoice.tax.rate) / 100
    } else {
      // Tax inclusive: reverse calculate
      tax = (subtotalBeforeTax * invoice.tax.rate) / (100 + invoice.tax.rate)
    }
  }

  const total = invoice.tax.basis === 'exclusive' ? subtotalBeforeTax + tax : subtotalBeforeTax

  return {
    ...invoice,
    subtotal,
    total: Math.round(total * 100) / 100,
  }
}

export const INVOICE_STEPS = [
  { id: 1, title: 'Business Details', description: 'Your company information' },
  { id: 2, title: 'Client Details', description: 'Who are you invoicing?' },
  { id: 3, title: 'Invoice Items', description: 'Products and services' },
  { id: 4, title: 'Taxes', description: 'GST, VAT, or Sales Tax' },
  { id: 5, title: 'Discount', description: 'Apply discounts if needed' },
  { id: 6, title: 'Shipping', description: 'Shipping costs' },
  { id: 7, title: 'Notes', description: 'Additional notes' },
  { id: 8, title: 'Terms & Conditions', description: 'Payment terms' },
  { id: 9, title: 'Branding', description: 'Logo and colors' },
  { id: 10, title: 'Preview & Export', description: 'Review and download' },
]
