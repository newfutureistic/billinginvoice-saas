import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal-page'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Disclaimer',
  description: 'Important information about how to use Bill Maker and the limits of what the service provides.',
  path: '/disclaimer',
})

const sections: LegalSection[] = [
  {
    heading: 'Not legal, tax, or financial advice',
    paragraphs: [
      'Bill Maker is invoicing software. The invoices, templates, tax fields, and guidance it provides are for general informational purposes only and do not constitute legal, tax, accounting, or financial advice. Tax rules differ by country, state, and situation.',
      'Before relying on an invoice for a legal or tax matter, consult a qualified professional such as an accountant or tax advisor.',
    ],
  },
  {
    heading: 'Your responsibility for accuracy',
    paragraphs: [
      'You are responsible for the information you enter — including tax rates, GST/VAT numbers, amounts, and client details — and for ensuring your invoices comply with the laws that apply to you. Bill Maker calculates totals and taxes from the values you provide; it does not verify that those values are correct for your jurisdiction.',
    ],
  },
  {
    heading: 'Templates are general',
    paragraphs: [
      'Our templates are designed to be clear and professional, but they are general-purpose. They may need to be adapted to meet the specific invoicing or record-keeping requirements of your region or industry.',
    ],
  },
  {
    heading: 'Availability',
    paragraphs: [
      'We work hard to keep Bill Maker available and accurate, but we do not guarantee that the service will be uninterrupted or error-free. Features described on this website reflect the product’s current capabilities and may change as we improve it.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by law, Bill Maker is not liable for losses arising from your use of the service or reliance on documents created with it. Your use of Bill Maker is also governed by our Terms of Service.',
    ],
  },
]

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      updated="July 1, 2026"
      intro="Please read this disclaimer to understand what Bill Maker does — and does not — provide."
      sections={sections}
    />
  )
}
