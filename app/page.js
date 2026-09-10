import Link from 'next/link';

const popularSearches = [
  'Dental implants in Turkey',
  'Hair transplant in Mexico',
  'Knee replacement in Thailand',
  'IVF in Spain',
  'LASIK in India',
];

export default function HomePage() {
  return (
    <div>
      <section className="max-w-content mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="max-w-2xl">
          <p className="font-serif italic text-sage-dark text-lg mb-3">
            A directory, not a booking desk.
          </p>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-ink mb-6">
            Find medical treatment abroad, compared honestly.
          </h1>
          <p className="text-ink/70 text-lg leading-relaxed mb-10 max-w-xl">
            Search a treatment, see published prices from clinics around the
            world, and contact providers directly. We collect the
            information — you make the decision.
          </p>
        </div>

        <form action="/search" method="GET" className="max-w-2xl">
          <label htmlFor="q" className="sr-only">
            What treatment are you looking for?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="q"
              name="q"
              type="text"
              placeholder="What treatment are you looking for? e.g. dental implants"
              className="flex-1 border border-line bg-white px-4 py-3.5 text-ink placeholder:text-ink/40 focus:border-sage focus:outline-none"
            />
            <button
              type="submit"
              className="bg-ink text-paper px-6 py-3.5 font-medium hover:bg-sage-dark transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-ink/60">
            <label className="flex items-center gap-2">
              Country
              <input
                name="country"
                type="text"
                placeholder="Any"
                className="w-28 border-b border-line bg-transparent py-1 focus:border-sage focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              City
              <input
                name="city"
                type="text"
                placeholder="Any"
                className="w-28 border-b border-line bg-transparent py-1 focus:border-sage focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              Max price (USD)
              <input
                name="price_max"
                type="number"
                placeholder="Any"
                className="w-24 border-b border-line bg-transparent py-1 focus:border-sage focus:outline-none"
              />
            </label>
          </div>
        </form>

        <div className="mt-10 flex flex-wrap gap-2">
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="text-sm border border-line px-3 py-1.5 text-ink/70 hover:border-sage hover:text-sage-dark transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="max-w-content mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
          <Step
            n="1"
            title="Search"
            body="Tell us the treatment, and optionally a country, city or budget."
          />
          <Step
            n="2"
            title="Compare"
            body="Review clinics side by side — location, published price range, and where the information came from."
          />
          <Step
            n="3"
            title="Contact"
            body="Reach out to the provider directly through their own website to ask questions and get a quote."
          />
        </div>
      </section>

      <section className="max-w-content mx-auto px-6 py-14">
        <div className="border border-line bg-white px-6 py-5 max-w-2xl">
          <p className="text-sm text-ink/70 leading-relaxed">
            Waypoint Health is for comparison and research only. We are not
            a medical provider, booking agent or insurer, and we do not
            verify clinical outcomes. Prices and details are collected from
            public sources and may change — confirm everything with the
            provider before making a decision.
          </p>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="border-t-2 border-sage pt-4">
      <p className="font-serif text-2xl text-sage-dark mb-2">{n}</p>
      <h3 className="font-medium text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
    </div>
  );
}
