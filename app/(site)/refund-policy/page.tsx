import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal-page'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Refund Policy',
  description: 'How refunds work for Bill Maker paid plans — eligibility, timeframes, and how to request one.',
  path: '/refund-policy',
})

const sections: LegalSection[] = [
  {
    heading: 'Free plan',
    paragraphs: [
      'Bill Maker is free to start. You can create and download professional invoices on the Free plan at no cost, so there is nothing to refund unless you choose to upgrade to a paid plan.',
    ],
  },
  {
    heading: '14-day money-back guarantee',
    paragraphs: [
      'If you upgrade to a paid plan and are not satisfied, you can request a full refund within 14 days of your first payment. We will refund the amount to your original payment method — no questions asked.',
    ],
  },
  {
    heading: 'Renewals',
    paragraphs: [
      'Subscription renewals are billed automatically at the start of each period. You can cancel anytime before a renewal to avoid the next charge. Refunds are not provided for a renewal period that has already begun, but you keep access until the end of the period you paid for.',
    ],
  },
  {
    heading: 'How to request a refund',
    paragraphs: [
      'Email billmaker.business@gmail.com from the address associated with your account, or reach us through the contact page. Include your account email and the payment you would like refunded. We typically respond within two business days.',
    ],
  },
  {
    heading: 'Processing time',
    paragraphs: [
      'Once approved, refunds are issued to your original payment method. Depending on your bank or card provider, it may take 5–10 business days for the amount to appear on your statement.',
    ],
  },
  {
    heading: 'Exceptions',
    paragraphs: [
      'We may decline a refund in cases of clear abuse of this policy or violation of our Terms of Service. Where required by local consumer-protection law, your statutory rights are unaffected by this policy.',
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="July 1, 2026"
      intro="We want you to be happy with Bill Maker. This policy explains when and how you can get a refund on a paid plan — in plain language."
      sections={sections}
    />
  )
}
