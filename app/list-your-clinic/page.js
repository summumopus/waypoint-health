'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const initialState = {
    provider_name: '',
    website_url: '',
    contact_email: '',
    country: '',
    city: '',
    description: '',
    treatments_raw: '',
    company_website: '', // honeypot
};

export default function ListYourClinicPage() {
    const [form, setForm] = useState(initialState);
    const [status, setStatus] = useState('idle');

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (form.company_website) {
            setStatus('success');
            return;
        }

        if (!isSupabaseConfigured) {
            setStatus('error');
            return;
        }

        setStatus('submitting');

        const { error } = await supabase.from('submissions').insert({
            provider_name: form.provider_name,
            website_url: form.website_url,
            contact_email: form.contact_email || null,
            country: form.country,
            city: form.city,
            description: form.description || null,
            treatments_raw: form.treatments_raw,
        });

        if (error) {
            setStatus('error');
        } else {
            setStatus('success');
            setForm(initialState);
        }
    }

    if (status === 'success') {
        return (
            <div className="max-w-content mx-auto px-6 py-16">
                <div className="max-w-xl">
                    <h1 className="font-serif text-3xl text-ink mb-4">Thanks — received.</h1>
                    <p className="text-ink/70 leading-relaxed">
                        We'll review your submission against your clinic's own website
                        and publish it once it's verified. If anything needs
                        clarifying, we may reach out to the contact email you provided.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-content mx-auto px-6 py-12">
            <div className="max-w-xl mb-10">
                <h1 className="font-serif text-3xl text-ink mb-3">List your clinic</h1>
                <p className="text-ink/70 leading-relaxed">
                    Free to list. Tell us about your clinic and published prices —
                    we'll verify the details against your own website before
                    anything goes live, so please make sure the information below
                    matches what's publicly published there.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                <div className="hidden" aria-hidden="true">
                    <label htmlFor="company_website">Leave this field empty</label>
                    <input
                        id="company_website"
                        name="company_website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.company_website}
                        onChange={(e) => update('company_website', e.target.value)}
                    />
                </div>

                <Field label="Clinic / provider name" required>
                    <input
                        required
                        type="text"
                        value={form.provider_name}
                        onChange={(e) => update('provider_name', e.target.value)}
                        className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                    />
                </Field>

                <Field label="Clinic website" required hint="Must be your own clinic's site — this is what we verify against.">
                    <input
                        required
                        type="url"
                        placeholder="https://"
                        value={form.website_url}
                        onChange={(e) => update('website_url', e.target.value)}
                        className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Country" required>
                        <input
                            required
                            type="text"
                            value={form.country}
                            onChange={(e) => update('country', e.target.value)}
                            className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                        />
                    </Field>
                    <Field label="City" required>
                        <input
                            required
                            type="text"
                            value={form.city}
                            onChange={(e) => update('city', e.target.value)}
                            className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                        />
                    </Field>
                </div>

                <Field label="Contact email" hint="For us to reach you about this listing — not shown publicly.">
                    <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => update('contact_email', e.target.value)}
                        className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                    />
                </Field>

                <Field label="Short description">
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                    />
                </Field>

                <Field
                    label="Treatments and published prices"
                    required
                    hint="One per line, e.g. 'Dental implants — $600–900 USD'. Only include prices that are actually published on your website."
                >
                    <textarea
                        required
                        rows={5}
                        value={form.treatments_raw}
                        onChange={(e) => update('treatments_raw', e.target.value)}
                        className="w-full border border-line bg-white px-3 py-2.5 focus:border-sage focus:outline-none"
                    />
                </Field>

                {status === 'error' && (
                    <p className="text-rust text-sm">
                        Something went wrong submitting this. Please try again in a
                        moment.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="bg-ink text-paper px-6 py-3 font-medium hover:bg-sage-dark transition-colors disabled:opacity-60"
                >
                    {status === 'submitting' ? 'Submitting…' : 'Submit for review'}
                </button>

                <p className="text-xs text-ink/50 leading-relaxed">
                    Submitting doesn't publish anything automatically. Every listing
                    is checked against your own public website before it appears on
                    Waypoint Health.
                </p>
            </form>
        </div>
    );
}

function Field({ label, hint, required, children }) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-ink mb-1.5">
                {label}
                {required && <span className="text-rust"> *</span>}
            </span>
            {children}
            {hint && <span className="block text-xs text-ink/50 mt-1.5">{hint}</span>}
        </label>
    );
}