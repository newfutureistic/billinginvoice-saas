import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, BookOpen, MapPin } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { ContactForm } from '@/components/site/contact-form'

export const metadata: Metadata = {
  title: 'Contact — Bill Maker',
  description:
    'Get in touch with the Bill Maker team. Sales, support, billing, and partnership inquiries welcome.',
  alternates: { canonical: '/contact' },
}

const channels = [
  {
    icon: Mail,
    title: 'Email us',
    description: 'billmaker.business@gmail.com',
    href: 'mailto:billmaker.business@gmail.com',
    cta: 'Send an email',
  },
  {
    icon: BookOpen,
    title: 'Help center',
    description: 'Guides and answers, 24/7',
    href: '/help',
    cta: 'Browse articles',
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the team"
        description="Have a question, a partnership idea, or need a hand? We usually reply within one business day."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <div className="space-y-4">
              {channels.map((c) => {
                const Icon = c.icon
                return (
                  <Link
                    key={c.title}
                    href={c.href}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{c.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                      <span className="mt-2 inline-block text-sm font-medium text-brand">
                        {c.cta}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-card text-foreground shadow-token-xs">
                <MapPin className="size-5" />
              </span>
              <p className="mt-4 font-semibold text-foreground">Headquarters</p>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                Connaught Place
                <br />
                New Delhi, Delhi 110001, India
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Image
                src="/contact.png"
                alt=""
                aria-hidden
                width={2000}
                height={2000}
                sizes="(min-width: 1024px) 400px, 80vw"
                className="h-auto w-full max-w-sm object-contain"
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
