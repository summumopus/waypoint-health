import Link from 'next/link';
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

async function getListings(searchParams) {
  const q = (searchParams.q || '').trim();
  const country = (searchParams.country || '').trim();
  const city = (searchParams.city || '').trim();
  const priceMax = searchParams.price_max;

  let query = supabase.from('listings').select('*');

  if (q) {
    const term = `%${q}%`;
    query = query.or(
      [
        `treatment_name.ilike.${term}`,
        `provider_name.ilike.${term}`,
        `city_name.ilike.${term}`,
        `country_name.ilike.${term}`,
        `description.ilike.${term}`,
      ].join(',')
    );
  }
  if (country) query = query.ilike('country_name', `%${country}%`);
  if (city) query = query.ilike('city_name', `%${city}%`);
  if (priceMax) query = query.or(`price_min.lte.${priceMax},price_min.is.null`);

  const { data, error } = await query.order('provider_name').limit(100);
  return { data: data || [], error };
}

export default async function SearchPage({ searchParams }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-content mx-auto px-6 py-16">
        <p className="text-ink/60">
          Supabase is not configured yet. Add your project URL and anon key
          to <code>.env.local</code> to see live results here.
        </p>
      </div>
    );
  }

  const { data: listings, error } = await getListings(searchParams);

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl text-ink mb-2">
          {searchParams.q
            ? `Results for “${searchParams.q}”`
            : 'All listings'}
        </h1>
        <p className="text-sm text-ink/60">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {searchParams.country ? ` in ${searchParams.country}` : ''}
        </p>
      </div>

      <form action="/search" method="GET" className="flex flex-wrap gap-3 mb-10">
        <input
          name="q"
          defaultValue={searchParams.q || ''}
          placeholder="Treatment"
          className="border border-line bg-white px-3 py-2 text-sm flex-1 min-w-[180px] focus:border-sage focus:outline-none"
        />
        <input
          name="country"
          defaultValue={searchParams.country || ''}
          placeholder="Country"
          className="border border-line bg-white px-3 py-2 text-sm w-32 focus:border-sage focus:outline-none"
        />
        <input
          name="city"
          defaultValue={searchParams.city || ''}
          placeholder="City"
          className="border border-line bg-white px-3 py-2 text-sm w-32 focus:border-sage focus:outline-none"
        />
        <input
          name="price_max"
          type="number"
          defaultValue={searchParams.price_max || ''}
          placeholder="Max price"
          className="border border-line bg-white px-3 py-2 text-sm w-28 focus:border-sage focus:outline-none"
        />
        <button
          type="submit"
          className="bg-ink text-paper px-5 py-2 text-sm font-medium hover:bg-sage-dark transition-colors"
        >
          Update
        </button>
      </form>

      {error && (
        <p className="text-rust text-sm mb-6">
          Something went wrong loading results. Please try again.
        </p>
      )}

      {!error && listings.length === 0 && (
        <p className="text-ink/60">
          No listings match that search yet. Try a broader term, or check
          back as we add more providers.
        </p>
      )}

      <ul className="divide-y divide-line border-t border-b border-line">
        {listings.map((listing) => (
          <li key={listing.listing_id} className="py-6">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-2">
              <h2 className="font-serif text-xl text-ink">
                {listing.provider_name}
              </h2>
              <span className="text-sm text-gold font-medium">
                {formatPrice(
                  listing.price_min,
                  listing.price_max,
                  listing.currency
                )}
              </span>
            </div>
            <p className="text-sm text-ink/60 mb-2">
              {listing.treatment_name} · {listing.city_name},{' '}
              {listing.country_name}
            </p>
            {listing.description && (
              <p className="text-sm text-ink/70 leading-relaxed mb-3 max-w-2xl">
                {listing.description}
              </p>
            )}
            <Link
              href={`/provider/${listing.provider_slug}`}
              className="text-sm text-sage-dark font-medium hover:underline"
            >
              View provider →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
