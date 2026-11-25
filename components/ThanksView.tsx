'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JoinFields, joinFieldsError } from '@/components/JoinFields';
import {
  findCheckIn,
  getKioskLast,
  isMember,
  setKioskLast,
  updateMember,
  type CheckIn,
  type MemberState,
} from '@/lib/checkins';
import { pitchFor, statusFromAffiliation, type ServiceStatus } from '@/lib/membership';

/** How long the door tablet shows a result before it is ready for the next person. */
const KIOSK_RESET_MS = 6000;

/**
 * There is no ticket, no code and no QR — by design. What this screen adds
 * is the result of joining, and for anyone who checked in only, a second,
 * plain offer to join. The record it needs (id and join token) comes from
 * this phone's storage, or on the door tablet from memory; without it the
 * screen still says the check-in worked, it just cannot offer the join.
 */
export function ThanksView({
  id,
  kiosk,
  eventDay,
}: {
  id: number | null;
  kiosk: boolean;
  eventDay: boolean;
}) {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<CheckIn | null>(null);
  const [member, setMember] = useState<MemberState>(null);
  const [status, setStatus] = useState<ServiceStatus | ''>('');
  const [rank, setRank] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  // The tablet waits for nobody, unless that person is busy joining.
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const found = kiosk ? getKioskLast() : id ? findCheckIn(id) : null;
    setRecord(found);
    setMember(found?.member ?? null);
    setStatus(statusFromAffiliation(found?.affiliation));
    setLoaded(true);
  }, [id, kiosk]);

  useEffect(() => {
    if (!kiosk || held) return;
    const timer = window.setTimeout(() => router.replace('/?kiosk=1'), KIOSK_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [kiosk, held, member, router]);

  async function onJoin() {
    if (!record || joining) return;

    const problem = joinFieldsError(status, rank);
    if (problem) {
      setError(problem);
      return;
    }

    setJoining(true);
    setError('');

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: record.id, token: record.token, status, rank }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { member?: 'joined' | 'already'; error?: string }
        | null;

      if (!res.ok || !payload?.member) {
        setError(payload?.error ?? 'That did not save. Check your connection and try once more.');
        setJoining(false);
        return;
      }

      setMember(payload.member);
      if (kiosk) setKioskLast({ ...record, member: payload.member });
      else updateMember(record.id, payload.member);
      // Joined: the tablet can count down to the next person again.
      setHeld(false);
    } catch {
      setError('That did not save. Check your connection and try once more.');
    }
    setJoining(false);
  }

  const joined = isMember(member);
  const offerJoin = loaded && record !== null && !joined;

  let lede: string;
  if (member === 'joined') {
    lede = "Welcome to the KDVA Casey Chapter. We'll be in touch by email.";
  } else if (member === 'already') {
    lede = "You're already a KDVA member — thank you!";
  } else if (member === 'failed') {
    lede = "You're checked in. Your KDVA sign-up did not go through — tap JOIN KDVA NOW to try again.";
  } else if (eventDay) {
    lede = "You're checked in. Enjoy the night.";
  } else {
    lede = 'Just give your name at the door. Nothing to show, nothing to print.';
  }

  const home = kiosk ? '/?kiosk=1' : '/';
  const colleague = kiosk ? '/?kiosk=1&same=1' : '/?same=1';

  return (
    <section className="fade pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker kicker-red">{joined ? 'WELCOME TO KDVA' : 'YOU’RE ON THE LIST'}</div>

      {/* Held back until storage is read, so nobody sees the wrong line flash. */}
      <p className="lede">{loaded ? lede : ' '}</p>

      {offerJoin ? (
        <div
          className="panel"
          onFocusCapture={() => setHeld(true)}
          onPointerDownCapture={() => setHeld(true)}
        >
          {member !== 'failed' ? (
            <>
              <p className="panel-title">One more thing — KDVA membership is free.</p>
              <p className="pitch">{pitchFor(record?.affiliation)}</p>
              <p className="panel-body">
                Join the Korea Defense Veterans Association: alliance events like tonight, no dues,
                no obligations.
              </p>
            </>
          ) : null}

          <JoinFields
            idPrefix="t-join"
            status={status}
            rank={rank}
            onStatus={setStatus}
            onRank={setRank}
          />

          <p className="err" role="alert" aria-live="polite">
            {error}
          </p>

          <button className="btn" type="button" onClick={() => void onJoin()} disabled={joining}>
            {joining ? 'SAVING…' : 'JOIN KDVA NOW'}
          </button>
          <p className="hint">Email only — no birth date, no phone, no dues.</p>
        </div>
      ) : null}

      {kiosk ? (
        <Link className="btn" href={home} replace>
          NEXT
        </Link>
      ) : (
        <a className="btn btn-ghost" href="/kdva-casey-year-end.ics" download>
          ADD TO CALENDAR
        </a>
      )}

      <Link className="btn btn-ghost" href={colleague}>
        REGISTER A COLLEAGUE (SAME UNIT)
      </Link>

      {kiosk ? null : (
        <Link className="btn btn-ghost" href={home}>
          REGISTER SOMEONE ELSE
        </Link>
      )}

      <p className="fine">
        Thursday 3 December 2026, 1800—2000 · Warrior Club, Camp Casey. A year-end night of food,
        live music, and good company — no long speeches.
      </p>
    </section>
  );
}
