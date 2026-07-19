import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service — Bill Maker',
  description: 'The terms and conditions that govern your use of Bill Maker.',
  alternates: { canonical: '/terms' },
}

const sections: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By creating an account or using Bill Maker, you agree to these Terms of Service. If you are using Bill Maker on behalf of an organization, you agree to these terms on its behalf.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: [
      'You are responsible for keeping your account credentials secure and for all activity that occurs under your account. You must provide accurate information and promptly update it if it changes.',
      'You must be at least 18 years old, or the age of majority in your jurisdiction, to use Bill Maker.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'You agree not to misuse the service — including by attempting to disrupt it, reverse-engineer it, or use it to create fraudulent, unlawful, or misleading documents. We may suspend accounts that violate these terms.',
    ],
  },
  {
    heading: 'Subscriptions and billing',
    paragraphs: [
      'Paid plans are billed in advance on a recurring basis. You can upgrade, downgrade, or cancel at any time; changes take effect at the start of the next billing period. Fees are non-refundable except where required by law.',
    ],
  },
  {
    heading: 'Your content',
    paragraphs: [
      'You retain all rights to the documents and content you create with Bill Maker. You grant us a limited license to store and process that content solely to provide the service to you.',
    ],
  },
  {
    heading: 'Disclaimers',
    paragraphs: [
      'Bill Maker provides document tools and templates for convenience. We are not a law firm or accounting firm, and our tools do not constitute legal, tax, or financial advice. You are responsible for ensuring your documents meet your legal and regulatory obligations.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, Bill Maker is not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the twelve months before the claim.',
    ],
  },
  {
    heading: 'Changes and termination',
    paragraphs: [
      'We may update these terms or the service over time. We will provide notice of material changes. You may stop using the service at any time, and we may suspend or terminate access for violations of these terms.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="October 1, 2024"
      intro="These terms govern your use of Bill Maker. We have kept them as clear and fair as we can — please read them carefully."
      sections={sections}
    />
  )
}
