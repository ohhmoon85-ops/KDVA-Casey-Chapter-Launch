'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { AFFILIATIONS, MAX_GUESTS } from '@/lib/event';

const GUEST_OPTIONS = Array.from({ length: MAX_GUESTS + 1 }, (_, n) => n);

/**
 * Uncontrolled on purpose: when a save fails the inputs are never
 * re-rendered, so whatever the person typed is still sitting there.
 */
export function RsvpForm({ closed }: { closed: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get('name') ?? '').trim();
    if (name.length < 2) {
      setError('Enter your name so we can find you on the list.');
      form.querySelector<HTMLInputElement>('#f-name')?.focus();
      return;
    }

    const guests = Number(data.get('guests') ?? 0);

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
          guests,
          email: String(data.get('email') ?? '').trim() || null,
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
      // second row to the catering count.
      router.push(`/thanks?guests=${guests}`);
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

      <form ref={formRef} onSubmit={onSubmit} noValidate>
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

        <div className="row">
          <div>
            <label className="lbl" htmlFor="f-unit">
              UNIT <span className="opt">(optional)</span>
            </label>
            <input className="field" id="f-unit" name="unit" placeholder="e.g. 1-72 AR" />
          </div>
          <div>
            <label className="lbl" htmlFor="f-guests">
              GUESTS WITH YOU
            </label>
            <select className="field" id="f-guests" name="guests" defaultValue="0">
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="lbl" htmlFor="f-email">
          EMAIL <span className="opt">(optional — for the reminder)</span>
        </label>
        <input
          className="field"
          id="f-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
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
