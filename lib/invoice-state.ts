import { InvoiceData, type BusinessDetails, type ClientDetails } from './invoice-types'

/**
 * A brand-new invoice's business step starts empty, not pre-filled with `MOCK_INVOICE`'s
 * sample company. Each field already carries example text via its `placeholder` prop
 * (Step1Business) — a real value here defeated that: it rendered as normal dark text
 * indistinguishable from something the user actually typed, so they had to delete it before
 * entering their own details instead of just typing over a greyed-out example.
 */
export const EMPTY_BUSINESS: BusinessDetails = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  taxId: '',
  gstin: '',
  pan: '',
  website: '',
  businessType: '',
}

/** Same fix as {@link EMPTY_BUSINESS}, for the client step. */
export const EMPTY_CLIENT: ClientDetails = {
  clientName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  taxId: '',
  gstin: '',
}

/** A single blank line item — matches the shape `addItem()` creates. */
export const EMPTY_ITEM: InvoiceData['items'][0] = {
  id: 'item-1',
  description: '',
  quantity: 1,
  rate: 0,
  unit: 'hours',
}

/** Same fix as {@link EMPTY_BUSINESS}, for the bank-details fields on the Terms step. */
export const EMPTY_BANK_DETAILS: InvoiceData['bankDetails'] = {
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  bankName: '',
  ifsc: '',
  swift: '',
  iban: '',
  branch: '',
}

export const MOCK_INVOICE: InvoiceData = {
  id: 'inv-001',
  invoiceNumber: 'INV-2024-001',
  issueDate: '2024-07-01',
  dueDate: '2024-08-01',
  template: 'modern',
  status: 'draft',

  business: {
    businessName: 'Bill Maker Inc.',
    ownerName: 'Sarah Chen',
    email: 'sarah@bill-maker.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    taxId: '12-3456789',
    // Checksum-valid placeholder: the old '…1Z5' was structurally correct but failed the GSTIN
    // mod-36 check digit, which blocked the wizard on Step 1 out of the box.
    gstin: '29ABCDE1234F1ZW',
    pan: 'ABCDE1234F',
    website: 'https://bill-maker.com',
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
    // Checksum-valid placeholder (see the note on the business GSTIN above).
    gstin: '27FGHIJ5678K1Z1',
  },

  items: [
    {
      id: '1',
      description: 'Web Development Services - UI/UX Design & Frontend',
      hsn: '998314',
      quantity: 40,
      rate: 150,
      unit: 'hours',
    },
    {
      id: '2',
      description: 'API Integration & Backend Setup',
      hsn: '998314',
      quantity: 20,
      rate: 200,
      unit: 'hours',
    },
    {
      id: '3',
      description: 'Testing & Quality Assurance',
      hsn: '998313',
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
    supplyType: 'intra',
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
    accountName: 'Bill Maker Inc.',
    accountNumber: '9876543210',
    routingNumber: '123456789',
    bankName: 'Tech Bank USA',
    ifsc: 'HDFC0001234',
    swift: 'HDFCINBB',
    iban: '',
    branch: 'MG Road',
  },
  qrCode: 'https://pay.bill-maker.com/INV-2024-001',

  upiId: 'billmaker@okhdfcbank',
  upiPayeeName: 'Bill Maker Inc.',
  upiIncludeAmount: true,

  signatureLabel: 'Authorized Signatory',

  invoicePrefix: 'INV',
  poNumber: '',
  referenceNumber: '',
  paymentMethod: 'bank',
  paymentStatus: 'unpaid',
  additionalCharges: { label: 'Additional charge', amount: 0, applied: false },
  roundOff: false,
  watermark: '',

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

  const additional = invoice.additionalCharges?.applied ? invoice.additionalCharges.amount : 0
  let total = (invoice.tax.basis === 'exclusive' ? subtotalBeforeTax + tax : subtotalBeforeTax) + additional
  if (invoice.roundOff) total = Math.round(total)

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
