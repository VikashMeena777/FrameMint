import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--fm-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <Image
                src="/logo.jpg"
                alt="FrameMint"
                width={32}
                height={32}
                className="rounded-lg transition-transform group-hover:scale-105"
              />
              <span className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                FrameMint
              </span>
            </Link>
            <p className="text-sm text-[var(--fm-text-secondary)] max-w-xs">
              AI-powered thumbnail generator. Create scroll-stopping thumbnails in seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--fm-text)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Product
            </h3>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Gallery', 'API Docs'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--fm-text)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Company
            </h3>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--fm-text)] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Legal
            </h3>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-[var(--fm-text-secondary)]">
            © {new Date().getFullYear()} FrameMint. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'GitHub', 'Discord'].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-[var(--fm-text-secondary)] hover:text-[var(--fm-text)] transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
