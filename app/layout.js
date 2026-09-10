import { Fraunces, Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Waypoint Health — Find medical treatment abroad',
  description:
    'Compare clinics, cities and published prices for medical treatment abroad. Search treatments, review options and contact providers directly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="max-w-content mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl text-ink">Waypoint</span>
          <span className="font-serif text-xl italic text-sage-dark">Health</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            Browse all listings
          </Link>
          <Link
            href="/list-your-clinic"
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            List your clinic
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-content mx-auto px-6 py-8 text-sm text-ink/60 space-y-2">
        <p>
          Waypoint Health is an independent information and comparison
          resource. We do not provide medical advice, treatment, diagnosis,
          booking or payment services, and we are not affiliated with the
          providers listed here.
        </p>
        <p>
          Always verify prices, credentials and availability directly with a
          provider, and consult a qualified medical professional before
          making treatment decisions.
        </p>
      </div>
    </footer>
  );
}