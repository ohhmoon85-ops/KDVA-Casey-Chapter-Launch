'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AFFILIATIONS } from '@/lib/event';

/** Loose on purpose — it catches typos, it does not police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Uncontrolled on purpose: when a save fails the inputs are never
 * re-rendered, so whatever the person typed is still sitting there.
 */
export function RsvpForm({ closed }: { closed: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const fail = (message: string, field: string) => {
      setError(message);
      form.querySelector<HTMLInputElement>(field)?.focus();
    };

    const name = String(data.get('name') ?? '').trim();
    if (name.length < 2) {
      fail('Enter your name so we can find you on the list.', '#f-name');
      return;
    }

    const email = String(data.get('email') ?? '').trim();
    if (!email) {
      fail('Enter your email so we can send you the reminder.', '#f-email');
      return;
    }
    if (!EMAIL.test(email)) {
      fail('That email address does not look right.', '#f-email');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          affiliation: String(data.get('affiliation') ?? ''),
          unit: String(data.get('unit') ?? '').trim() || null,
          email,
          wants_membership: data.get('wants_membership') === 'on',
        }),
      });

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        setError(payload?.error ?? 'That did not save. Check your connection and try once more.');
        setSaving(false);
        return;
      }

      // Stays disabled through the navigation so a second tap cannot add a
      // second row to the count.
      router.push('/thanks');
    } catch {
      setError('That did not save. Check your connection and try once more.');
      setSaving(false);
    }
  }

  return (
    <section className="fade pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker">RSVP</div>

      {closed ? (
        <p className="lede">Registration has closed, but you are still welcome to walk in.</p>
      ) : (
        <p className="lede">
          <b>Please reply by Friday 4 September.</b> This helps us get the food count right. It is
          not required to attend — you are welcome to walk in either way.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate>
        <label className="lbl" htmlFor="f-name">
          NAME
        </label>
        <input
          className="field"
          id="f-name"
          name="name"
          autoComplete="name"
          placeholder="Rank and name, e.g. SGT Kim"
          required
        />

        <label className="lbl" htmlFor="f-aff">
          I AM
        </label>
        <select className="field" id="f-aff" name="affiliation" defaultValue={AFFILIATIONS[0]}>
          {AFFILIATIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="lbl" htmlFor="f-unit">
          UNIT <span className="opt">(optional)</span>
        </label>
        <input className="field" id="f-unit" name="unit" placeholder="e.g. 1-72 AR" />

        <label className="lbl" htmlFor="f-email">
          EMAIL
        </label>
        <input
          className="field"
          id="f-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
        />

        <label className="check" htmlFor="f-member">
          <input type="checkbox" id="f-member" name="wants_membership" />
          Send me information about joining KDVA.
        </label>

        <p className="err" role="alert" aria-live="polite">
          {error}
        </p>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'SAVING…' : 'COUNT ME IN'}
        </button>
      </form>

      <p className="fine">
        Your details are used only to plan this event and are not shared outside KDVA. Attendance is
        voluntary and off duty.
      </p>
    </section>
  );
}
