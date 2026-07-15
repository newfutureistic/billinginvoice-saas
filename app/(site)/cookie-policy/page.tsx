import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/site/legal-page'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description: 'What cookies Bill Maker uses, why we use them, and how you can control them.',
  path: '/cookie-policy',
})

const sections: LegalSection[] = [
  {
    heading: 'What cookies are',
    paragraphs: [
      'Cookies are small text files stored on your device when you visit a website. They let a site remember your actions and preferences — such as staying signed in — so you do not have to re-enter them on every page.',
    ],
  },
  {
    heading: 'Essential cookies',
    paragraphs: [
      'These are required for Bill Maker to work. They keep you signed in, protect against cross-site request forgery, and remember your session. The service cannot function correctly without them, so they cannot be turned off from within the app.',
    ],
  },
  {
    heading: 'Analytics cookies',
    paragraphs: [
      'We use a limited set of analytics cookies to understand how the product is used — which pages are visited and where people run into friction — so we can improve it. This data is aggregated and is never used to advertise to you.',
    ],
  },
  {
    heading: 'Cookies we do not use',
    paragraphs: [
      'We do not use advertising cookies, and we do not sell your data or the contents of your invoices to third parties.',
    ],
  },
  {
    heading: 'Managing cookies',
    paragraphs: [
      'You can control or delete cookies through your browser settings. Blocking essential cookies will prevent you from signing in or using core features. See your browser’s help pages for instructions on managing cookies.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as our use of cookies changes. Material updates will be reflected on this page with a new “last updated” date.',
    ],
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 1, 2026"
      intro="This policy explains the cookies Bill Maker uses, why we use them, and how you can control them."
      sections={sections}
    />
  )
}
