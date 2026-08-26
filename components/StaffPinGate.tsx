'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * The PIN is checked on the server and never travels with this bundle.
 * All this component knows is whether the server said yes.
 */
export function StaffPinGate() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking) return;

    const pin = String(new FormData(event.currentTarget).get('pin') ?? '');
    setChecking(true);
    setError('');

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? 'That PIN is not right.');
        setChecking(false);
        return;
      }

      // The cookie is set. Re-render the page on the server so it sees it.
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setChecking(false);
    }
  }

  return (
    <section className="fade pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker">STAFF</div>
      <p className="lede">The guest list for tonight.</p>

      <form onSubmit={onSubmit}>
        <label className="lbl" htmlFor="pin">
          PIN
        </label>
        <input
          className="field"
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
        />

        <p className="err" role="alert" aria-live="polite">
          {error}
        </p>

        <button className="btn" type="submit" disabled={checking}>
          {checking ? 'CHECKING…' : 'OPEN THE LIST'}
        </button>
      </form>
    </section>
  );
}
