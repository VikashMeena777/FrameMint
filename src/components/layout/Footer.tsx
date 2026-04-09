import Link from 'next/link';
import Image from 'next/image';

const links = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Create', href: '/create' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                <Image src="/logo.jpg" alt="FrameMint" width={32} height={32} className="h-8 w-8 object-cover" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-[var(--fm-text)]">FrameMint</span>
            </Link>
            <p className="text-sm text-[var(--fm-text-secondary)] max-w-[220px] leading-relaxed">
              AI-powered thumbnail generation for modern creators.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: 'Twitter', href: 'https://twitter.com/framemint' },
                { label: 'GitHub', href: 'https://github.com/framemint' },
                { label: 'Discord', href: 'https://discord.gg/framemint' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors py-1"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--fm-text-secondary)] mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-[var(--fm-text-muted)]">
            © {new Date().getFullYear()} FrameMint, Inc. All rights reserved.
          </p>
          <p className="text-xs text-[var(--fm-text-muted)]">
            Built for creators, by creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
