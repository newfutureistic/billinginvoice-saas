import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bill Maker',
  description: 'How Bill Maker collects, uses, and protects your personal and business data.',
  alternates: { canonical: '/privacy' },
}

const sections: LegalSection[] = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'We collect information you provide directly — such as your name, email address, and the content of the documents you create. We also collect limited technical data (like device and usage information) to keep the service secure and reliable.',
      'We do not sell your personal information, and we never use the contents of your documents for advertising.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'We use your information to provide and improve the service, process payments, communicate with you, and meet our legal obligations. Document content is used solely to render, store, and deliver the documents you create.',
    ],
  },
  {
    heading: 'Data storage and security',
    paragraphs: [
      'Your data is encrypted in transit and at rest. We host on SOC 2-compliant infrastructure and follow industry best practices for access control, monitoring, and incident response.',
      'We retain your data for as long as your account is active, and delete it on request in accordance with applicable law.',
    ],
  },
  {
    heading: 'Sharing and disclosure',
    paragraphs: [
      'We share data only with trusted processors who help us operate the service (such as payment and hosting providers), and only to the extent necessary. We may disclose information if required by law or to protect the rights and safety of our users.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Depending on your region, you may have the right to access, correct, export, or delete your personal data, and to object to certain processing. You can exercise these rights at any time from your account settings or by contacting us.',
    ],
  },
  {
    heading: 'Cookies',
    paragraphs: [
      'We use essential cookies to keep you signed in and a limited set of analytics cookies to understand how the product is used. You can control non-essential cookies through your browser or our cookie settings.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. If we make material changes, we will notify you by email or through the product before they take effect.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 1, 2024"
      intro="Your trust matters to us. This policy explains what data Bill Maker collects, how we use it, and the choices you have — in plain language."
      sections={sections}
    />
  )
}
