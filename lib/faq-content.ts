/**
 * FAQ content for the public /faq page and its FAQPage JSON-LD (SEO Phase 1). Plain-text
 * answers so the visible copy and the structured data stay identical (a Google rich-results
 * requirement). Keep answers self-contained and factual.
 */
export interface FaqItem {
  question: string
  answer: string
}

export const invoiceFaqs: FaqItem[] = [
  {
    question: 'Is the Bill Maker invoice generator really free?',
    answer:
      'Yes. You can create, preview, and download professional invoices as PDF for free, with no watermark on the invoice itself. You only need an account if you want to save invoices, track payments, and reuse client details across documents.',
  },
  {
    question: 'Do I need to sign up to create an invoice?',
    answer:
      'No. You can generate and download an invoice without an account. Signing up is optional and unlocks saving, payment tracking, receipts, and reusable clients and products.',
  },
  {
    question: 'What is an invoice?',
    answer:
      'An invoice is a commercial document a seller issues to a buyer that itemises goods or services provided, their prices, taxes, the total amount due, and the payment terms. It is a formal request for payment and a legal record of the transaction.',
  },
  {
    question: 'How do I create an invoice with Bill Maker?',
    answer:
      'Open the free invoice generator, add your business and client details, list your line items with quantities and rates, set any taxes and discounts, then download the invoice as a PDF or save it to your workspace. The total, tax, and balance are calculated automatically.',
  },
  {
    question: 'What is a GST invoice?',
    answer:
      'A GST invoice is a tax invoice that complies with Goods and Services Tax rules. It must show the supplier and recipient GSTIN, a unique invoice number, the HSN or SAC code, the taxable value, and the CGST, SGST, or IGST charged. Bill Maker lets you add GST fields and calculates the tax automatically.',
  },
  {
    question: 'Can I create a VAT invoice for the UK or EU?',
    answer:
      'Yes. Add your VAT registration number, set the VAT rate per line item, and the generator computes the net, VAT, and gross totals. You can choose tax-inclusive or tax-exclusive pricing to match your market.',
  },
  {
    question: 'How does invoice numbering work?',
    answer:
      'Every invoice should carry a unique, sequential number so it can be tracked and audited. A common format is a prefix plus a running number, for example INV-2024-001. Bill Maker suggests the next number automatically and lets you customise the prefix and starting value.',
  },
  {
    question: 'What are payment terms and which should I use?',
    answer:
      'Payment terms state when and how you expect to be paid, such as Due on receipt, Net 15, or Net 30. Shorter terms improve cash flow; longer terms can help larger clients. State the due date, accepted payment methods, and any late-payment fee clearly on the invoice.',
  },
  {
    question: 'Can I invoice international clients in another currency?',
    answer:
      'Yes. Bill Maker supports multiple currencies including USD, EUR, GBP, INR, AED, SGD, and more. Choose the currency for the invoice and it is shown consistently across the line items, totals, and PDF.',
  },
  {
    question: 'What is the difference between an invoice and a receipt?',
    answer:
      'An invoice is a request for payment issued before the customer pays. A receipt is proof of payment issued after the customer pays. Bill Maker can generate both: send an invoice, then issue a receipt once the payment is recorded.',
  },
  {
    question: 'Can I download my invoice as a PDF?',
    answer:
      'Yes. Every invoice can be downloaded as a print-ready PDF that preserves your layout, branding, taxes, and totals. The PDF is generated on the server so it looks identical wherever it is opened.',
  },
  {
    question: 'Can I add my company logo and branding?',
    answer:
      'Yes. You can add your logo, business name, address, and accent colour so invoices look on-brand. Saved businesses reuse the same branding across every document.',
  },
  {
    question: 'How do I add tax, discounts, or shipping to an invoice?',
    answer:
      'The builder has dedicated steps for taxes, discounts, and additional charges. Add a percentage or fixed amount and the subtotal, tax, and grand total update instantly, including inclusive or exclusive tax handling.',
  },
  {
    question: 'What information must a legally valid invoice include?',
    answer:
      'A valid invoice generally includes the word Invoice, a unique invoice number, the issue date, the seller and buyer names and addresses, a description of goods or services, quantities and unit prices, applicable taxes, the total amount due, and the payment terms. Tax-registered businesses must also show their tax registration number.',
  },
  {
    question: 'What is a proforma invoice?',
    answer:
      'A proforma invoice is a preliminary bill sent before goods or services are delivered, often used to confirm price and scope or for customs. It is not a demand for payment and is not recorded in your accounts the way a final tax invoice is.',
  },
  {
    question: 'What is a credit note?',
    answer:
      'A credit note is a document that reduces the amount a customer owes, issued when goods are returned, an invoice was overcharged, or a discount is applied after the fact. It references the original invoice and records the adjustment.',
  },
  {
    question: 'Can customers pay an invoice online?',
    answer:
      'Yes. Bill Maker integrates with Razorpay so a customer can pay a sent invoice online. Once the payment is captured and verified, the invoice is marked paid, a receipt is generated, and the payment appears in your history and dashboard.',
  },
  {
    question: 'How is my invoice data kept secure?',
    answer:
      'Your data is stored in an isolated, tenant-scoped workspace with authenticated access. Invoices are private to your account, and payments are verified server-side using signature checks so amounts and statuses cannot be tampered with from the browser.',
  },
  {
    question: 'What are the most common invoicing mistakes to avoid?',
    answer:
      'The most common mistakes are missing or duplicate invoice numbers, forgetting the due date or payment terms, incorrect tax calculations, vague line-item descriptions, wrong client details, and not keeping a copy for your records. Bill Maker helps prevent these with automatic numbering, tax calculation, and saved records.',
  },
  {
    question: 'Can I edit or duplicate an invoice later?',
    answer:
      'Yes. Saved invoices can be edited while in draft and duplicated to create a similar invoice quickly, so recurring bills to the same client take seconds to prepare.',
  },
]
