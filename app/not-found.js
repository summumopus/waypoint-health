import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto px-6 py-20 text-center">
      <h1 className="font-serif text-3xl text-ink mb-3">Page not found</h1>
      <p className="text-ink/60 mb-6">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link href="/" className="text-sage-dark font-medium hover:underline">
        Back to homepage
      </Link>
    </div>
  );
}
