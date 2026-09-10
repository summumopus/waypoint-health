import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function formatPrice(min, max, currency) {
  if (!min && !max) return 'Price not published';
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

async function getProvider(slug) {
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select(
      'id, name, slug, description, website_url, contact_url, cities(name, countries(name))'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (providerError || !provider) return { provider: null, treatments: [] };

  const { data: treatments } = await supabase
    .from('provider_treatments')
    .select(
      'id, price_min, price_max, currency, source_url, source_name, date_collected, treatments(name, slug)'
    )
    .eq('provider_id', provider.id)
    .eq('verified', true);

  return { provider, treatments: treatments || [] };
}

export default async function ProviderPage({ params }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-content mx-auto px-6 py-16">
        <p className="text-ink/60">
          Supabase is not configured yet. Add your project URL and anon key
          to <code>.env.local</code> to see this page populated.
        </p>
      </div>
    );
  }

  const { provider, treatments } = await getProvider(params.slug);

  if (!provider) notFound();

  const city = provider.cities?.name;
  const country = provider.cities?.countries?.name;

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <div className="max-w-2xl mb-10">
        <p className="text-sm text-ink/50 mb-2">
          {city}
          {city && country ? ', ' : ''}
          {country}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-4">
          {provider.name}
        </h1>
        {provider.description && (
          <p className="text-ink/70 leading-relaxed">{provider.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {provider.website_url && (
          <a
            href={provider.website_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-sage-dark transition-colors"
          >
            Visit provider website
          </a>
        )}
        {provider.contact_url && (
          <a
            href={provider.contact_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="border border-line px-5 py-3 text-sm font-medium text-ink hover:border-sage transition-colors"
          >
            Contact provider
          </a>
        )}
      </div>

      <h2 className="font-serif text-xl text-ink mb-4">
        Treatments &amp; published prices
      </h2>
      <ul className="divide-y divide-line border-t border-b border-line mb-12">
        {treatments.map((t) => (
          <li key={t.id} className="py-5">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-2">
              <h3 className="text-ink font-medium">{t.treatments?.name}</h3>
              <span className="text-sm text-gold font-medium">
                {formatPrice(t.price_min, t.price_max, t.currency)}
              </span>
            </div>
            <p className="text-xs text-ink/50">
              Source: {t.source_name || 'Not specified'}
              {t.date_collected
                ? ` · Collected ${new Date(t.date_collected).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}`
                : ''}
              {t.source_url && (
                <>
                  {' · '}
                  <a
                    href={t.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-sage-dark"
                  >
                    view source
                  </a>
                </>
              )}
            </p>
          </li>
        ))}
        {treatments.length === 0 && (
          <li className="py-5 text-sm text-ink/50">
            No verified pricing is published for this provider yet.
          </li>
        )}
      </ul>

      <div className="border border-line bg-white px-6 py-5 max-w-2xl">
        <p className="text-sm text-ink/70 leading-relaxed">
          This page is for information and comparison only. Waypoint Health
          does not verify clinical outcomes, qualifications or accreditation,
          and is not involved in booking, payment or treatment. Prices are
          collected from the source noted above and may have changed —
          confirm all details directly with the provider before deciding.
        </p>
      </div>
    </div>
  );
}
