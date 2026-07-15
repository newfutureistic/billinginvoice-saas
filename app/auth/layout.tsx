import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col">
        <div className="flex h-16 items-center border-b border-border px-4 lg:px-8">
          <Link href="/" className="flex items-center" aria-label="Bill Maker — home">
            <Image
              src="/logo.png"
              alt="Bill Maker"
              width={2109}
              height={746}
              sizes="150px"
              className="h-8 w-auto mix-blend-multiply"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12 lg:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Right side - Gradient + Benefits (desktop only) */}
      <div className="hidden lg:flex lg:flex-col lg:justify-center lg:bg-gradient-to-br lg:from-brand/10 lg:to-brand/5 lg:px-12 lg:py-24">
        <div className="space-y-10">
          <Image
            src="/login.png"
            alt=""
            aria-hidden
            width={2000}
            height={2000}
            sizes="(min-width: 1024px) 260px, 0px"
            className="h-56 w-56 object-contain drop-shadow-sm"
          />
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Professional invoicing made simple
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create, send, and track invoices in seconds. Get paid faster with Bill Maker.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: '✓', title: 'Fast invoicing', desc: 'Generate invoices in seconds' },
              { icon: '✓', title: 'Professional templates', desc: '8 customizable designs' },
              { icon: '✓', title: 'Payment tracking', desc: 'Know when clients pay' },
              { icon: '✓', title: 'Team collaboration', desc: 'Invite and manage your team' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="text-2xl font-bold text-brand">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
