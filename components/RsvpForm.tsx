'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { JoinFields, joinFieldsError } from '@/components/JoinFields';
import {
  checkInsForEvent,
  getKioskLast,
  isMember,
  saveCheckIn,
  setKioskLast,
  type CheckIn,
} from '@/lib/checkins';
import { AFFILIATIONS } from '@/lib/event';
import { statusFromAffiliation, type ServiceStatus } from '@/lib/membership';
import type { RsvpResult } from '@/lib/types';

/** Loose on purpose — it catches typos, it does not police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DOMAINS = ['@gmail.com', '@army.mil', '@naver.com'];

/**
 * Uncontrolled on purpose: when a save fails the inputs are never
 * re-rendered, so whatever the person typed is still sitting there. Only
 * the parts that change what else is on screen — "I am", the email for the
 * army.mil tip, and the join choice — are tracked in state.
 *
 * Joining is a choice between two buttons with neither picked, never a
 * box ticked in advance.
 */
export function RsvpForm({
  closed,
  eventDay,
  kiosk,
  same,
}: {
  closed: boolean;
  eventDay: boolean;
  /** The door tablet: remembers nothing, shows nobody's earlier check-in. */
  kiosk: boolean;
  /** Arrived from "Register a colleague (same unit)". */
  same: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [affiliation, setAffiliation] = useState<string>(AFFILIATIONS[0]);
  const [email, setEmail] = useState('');
  const [join, setJoin] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ServiceStatus | ''>(statusFromAffiliation(AFFILIATIONS[0]));
  const [statusTouched, setStatusTouched] = useState(false);
  const [rank, setRank] = useState('');
  const [returning, setReturning] = useState<CheckIn[]>([]);

  // Storage only exists in the browser, so this waits until after the
  // first render; the server-rendered form is the same for everyone.
  useEffect(() => {
    if (!kiosk) setReturning(checkInsForEvent());

    if (same) {
      const prior = kiosk ? getKioskLast() : checkInsForEvent()[0];
      const form = formRef.current;
      if (prior && form) {
        const aff = form.elements.namedItem('affiliation') as HTMLSelectElement | null;
        const unit = form.elements.namedItem('unit') as HTMLInputElement | null;
        if (aff && (AFFILIATIONS as readonly string[]).includes(prior.affiliation)) {
          aff.value = prior.affiliation;
          setAffiliation(prior.affiliation);
        }
        if (unit && prior.unit) unit.value = prior.unit;
      }
    }
  }, [kiosk, same]);

  // "I am" suggests a service status until the person picks one themselves.
  useEffect(() => {
    if (statusTouched) return;
    const guess = statusFromAffiliation(affiliation);
    if (guess !== status) {
      setStatus(guess);
      setRank('');
    }
    // Only a change of "I am" should move the guess.
  }, [affiliation]);

  function addDomain(domain: string) {
    const input = emailRef.current;
    if (!input) return;
    const local = input.value.split('@')[0].trim();
    input.value = local + domain;
    setEmail(input.value);
    input.focus();
    // Leave the cursor where the person still has to type, if anywhere.
    const at = local ? input.value.length : 0;
    input.setSelectionRange(at, at);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const fail = (message: string, field: string) => {
      setError(message);
      form.querySelector<HTMLElement>(field)?.focus();
    };

    const last_name = String(data.get('last_name') ?? '').trim();
    if (!last_name) {
      fail('Enter your last name so we can find you on the list.', '#f-last');
      return;
    }

    const first_name = String(data.get('first_name') ?? '').trim();
    if (!first_name) {
      fail('Enter your first name so we can find you on the list.', '#f-first');
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

    if (join === null) {
      fail('Pick one: join KDVA, or check in only.', '#f-join-yes');
      return;
    }
    if (join) {
      const problem = joinFieldsError(status, rank);
      if (problem) {
        fail(problem, status ? '#f-join-rank' : '#f-join-status');
        return;
      }
    }

    const affiliationValue = String(data.get('affiliation') ?? '');
    const unit = String(data.get('unit') ?? '').trim() || null;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          last_name,
          first_name,
          affiliation: affiliationValue,
          unit,
          email,
          join,
          ...(join ? { status, rank } : {}),
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | (RsvpResult & { error?: undefined })
        | { error?: string }
        | null;

      if (!res.ok || !payload || !('id' in payload)) {
        setError(payload?.error ?? 'That did not save. Check your connection and try once more.');
        setSaving(false);
        return;
      }

      const entry = {
        id: payload.id,
        token: payload.token,
        name: `${last_name}, ${first_name}`,
        member: payload.member,
        affiliation: affiliationValue,
        unit,
      };

      // Stays disabled through the navigation so a second tap cannot add a
      // second row to the count.
      if (kiosk) {
        setKioskLast(entry);
        router.push('/thanks?kiosk=1');
      } else {
        saveCheckIn(entry);
        router.push(`/thanks?r=${payload.id}`);
      }
    } catch {
      setError('That did not save. Check your connection and try once more.');
      setSaving(false);
    }
  }

  return (
    <section className="fade pt-[30px]">
      {returning.length > 0 ? (
        <div className="returning">
          {returning.map((c) => (
            <div className="banner" key={c.id}>
              ✓ Checked in as <b>{c.name}</b>
              {isMember(c.member) ? (
                ' · KDVA member'
              ) : (
                <Link className="btn btn-ghost" href={`/thanks?r=${c.id}`}>
                  JOIN KDVA NOW — FREE
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="rule-thin" />
      <div className="kicker">{eventDay ? 'CHECK IN' : 'RSVP'}</div>

      {eventDay ? (
        <p className="lede">Welcome! Sign in here — it takes 30 seconds. One line per person.</p>
      ) : closed ? (
        <p className="lede">
          The food count is in, but you can still sign up here — and you are welcome to walk in.
        </p>
      ) : (
        <p className="lede">
          <b>Please reply by Friday 27 November.</b> This helps us get the food count right. It is
          not required to attend — you are welcome to walk in either way.
        </p>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <label className="lbl" htmlFor="f-last">
          LAST NAME
        </label>
        <input
          className="field"
          id="f-last"
          name="last_name"
          autoComplete={kiosk ? 'off' : 'family-name'}
          placeholder="e.g. Kim"
          required
        />

        <label className="lbl" htmlFor="f-first">
          FIRST NAME
        </label>
        <input
          className="field"
          id="f-first"
          name="first_name"
          autoComplete={kiosk ? 'off' : 'given-name'}
          placeholder="e.g. Minsu"
          required
        />

        <label className="lbl" htmlFor="f-aff">
          I AM
        </label>
        <select
          className="field"
          id="f-aff"
          name="affiliation"
          defaultValue={AFFILIATIONS[0]}
          onChange={(e) => setAffiliation(e.target.value)}
        >
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
          ref={emailRef}
          className="field"
          id="f-email"
          name="email"
          type="email"
          autoComplete={kiosk ? 'off' : 'email'}
          inputMode="email"
          placeholder="you@example.com"
          onInput={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <div className="chips">
          {DOMAINS.map((d) => (
            <button key={d} className="pill" type="button" onClick={() => addDomain(d)}>
              {d}
            </button>
          ))}
        </div>
        {email.toLowerCase().includes('army.mil') ? (
          <p className="hint">
            Tip: army.mil addresses stop working after you PCS. A personal email keeps you on the
            KDVA list.
          </p>
        ) : null}

        <div className="lbl" id="f-join-label">
          KDVA MEMBERSHIP
        </div>
        <div className="choice" role="group" aria-labelledby="f-join-label">
          <button
            type="button"
            id="f-join-yes"
            aria-pressed={join === true}
            onClick={() => setJoin(true)}
          >
            <b>CHECK IN + JOIN KDVA</b>
            <span>Free · 30 seconds · uses what you typed above</span>
          </button>
          <button
            type="button"
            id="f-join-no"
            aria-pressed={join === false}
            onClick={() => setJoin(false)}
          >
            <b>CHECK IN ONLY</b>
          </button>
        </div>

        {join ? (
          <JoinFields
            idPrefix="f-join"
            status={status}
            rank={rank}
            onStatus={(s) => {
              setStatusTouched(true);
              setStatus(s);
            }}
            onRank={setRank}
          />
        ) : null}

        <p className="err" role="alert" aria-live="polite">
          {error}
        </p>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'SAVING…' : eventDay ? 'CHECK IN' : 'COUNT ME IN'}
        </button>
      </form>

      <p className="fine">
        Your details are used to plan this event and, if you choose to join, to register you as a
        KDVA member. They are not shared outside KDVA. Attendance is voluntary and off duty.
      </p>
    </section>
  );
}
