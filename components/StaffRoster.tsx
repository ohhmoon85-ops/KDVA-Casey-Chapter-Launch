'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { JoinFields, joinFieldsError } from '@/components/JoinFields';
import { statusFromAffiliation, type ServiceStatus } from '@/lib/membership';
import type { RosterRow } from '@/lib/types';

/** Often enough to watch the count climb at the door, rare enough not to matter. */
const AUTO_REFRESH_MS = 30_000;

const seoul = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function parts(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return Object.fromEntries(seoul.formatToParts(date).map((p) => [p.type, p.value]));
}

/** For the CSV: 2026-09-02 14:33, Korea time, sorts correctly in a spreadsheet. */
function csvStamp(iso: string): string {
  const p = parts(iso);
  return p ? `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}` : '';
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** For the screen: 02 SEP 1433. */
function shortStamp(iso: string): string {
  const p = parts(iso);
  if (!p) return '';
  return `${p.day} ${MONTHS[Number(p.month) - 1]} ${p.hour}${p.minute}`;
}

/**
 * A cell that opens with one of these is treated as a formula by Excel and
 * Numbers. Names will not normally start that way, but the roster is typed
 * in by strangers and the file gets opened on someone's work laptop.
 */
function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function StaffRoster() {
  const router = useRouter();
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [membersUnavailable, setMembersUnavailable] = useState(false);
  const [query, setQuery] = useState('');
  const [onlyNonMembers, setOnlyNonMembers] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MAKE MEMBER: one row open at a time.
  const [openId, setOpenId] = useState<number | null>(null);
  const [status, setStatus] = useState<ServiceStatus | ''>('');
  const [rank, setRank] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/roster', { cache: 'no-store' });

      if (res.status === 401) {
        // The twelve hours ran out. Send them back to the PIN screen.
        router.refresh();
        return;
      }

      if (!res.ok) {
        setError('Could not load the roster. Try REFRESH.');
        return;
      }

      const payload = (await res.json()) as { rows: RosterRow[]; membersUnavailable?: boolean };
      setRows(payload.rows);
      setMembersUnavailable(Boolean(payload.membersUnavailable));
      setError('');
    } catch {
      setError('Could not reach the server. Check your connection, then try REFRESH.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      // A phone left in a pocket need not keep asking.
      if (document.visibilityState === 'visible') void load();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  function openMakeMember(row: RosterRow) {
    setOpenId(row.id);
    setStatus(statusFromAffiliation(row.affiliation));
    setRank('');
    setJoinError('');
  }

  async function confirmMember(row: RosterRow) {
    if (joining) return;
    const problem = joinFieldsError(status, rank);
    if (problem) {
      setJoinError(problem);
      return;
    }

    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/staff/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: row.id, status, rank }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setJoinError(payload?.error ?? 'That did not save. Try once more.');
        return;
      }
      setRows((list) =>
        (list ?? []).map((r) =>
          r.id === row.id ? { ...r, is_member: true, wants_membership: true } : r,
        ),
      );
      setOpenId(null);
    } catch {
      setJoinError('Could not reach the server. Try once more.');
    } finally {
      setJoining(false);
    }
  }

  // Two counts, not three. Every reply is one person, so a separate
  // "expected" total would repeat the RSVP count in the next box along,
  // and two boxes showing the same number teach staff to distrust both.
  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      rsvps: list.length,
      members: list.filter((r) => r.is_member).length,
      pending: list.filter((r) => r.wants_membership && !r.is_member).length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const all = rows ?? [];
    const list = onlyNonMembers ? all.filter((r) => !r.is_member) : all;
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(needle) ||
        (r.unit || '').toLowerCase().includes(needle),
    );
  }, [rows, query, onlyNonMembers]);

  function exportCsv() {
    const head = [
      'Name',
      'Affiliation',
      'Unit',
      'Email',
      'Membership interest',
      'KDVA member',
      'RSVP time',
    ];

    const body = (rows ?? []).map((r) => [
      r.name,
      r.affiliation ?? '',
      r.unit ?? '',
      r.email ?? '',
      r.wants_membership ? 'yes' : '',
      r.is_member ? 'yes' : '',
      csvStamp(r.created_at),
    ]);

    // The leading U+FEFF is what stops Excel reading Korean names as
    // mojibake. Written as an escape on purpose: as a literal it is an
    // invisible character that an editor or a formatter can quietly drop,
    // and the damage would only show up on someone's laptop in December.
    const csv =
      '﻿' + [head, ...body].map((line) => line.map(csvCell).join(',')).join('\r\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kdva-casey-rsvps.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker">ROSTER</div>

      <div className="stats stats-2">
        <div className="stat">
          <b>{rows === null ? '—' : stats.rsvps}</b>
          <span>RSVPS</span>
        </div>
        <div className="stat">
          <b>{rows === null || membersUnavailable ? '—' : stats.members}</b>
          <span>KDVA MEMBERS</span>
        </div>
      </div>

      {rows !== null && !membersUnavailable && stats.pending > 0 ? (
        <p className="fine stats-note">
          {stats.pending === 1
            ? '1 asked to join but is not a member yet'
            : `${stats.pending} asked to join but are not members yet`}
        </p>
      ) : null}

      <div className="tools">
        <button className="pill" type="button" onClick={exportCsv} disabled={!rows?.length}>
          EXPORT CSV
        </button>
        <button className="pill" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? 'LOADING…' : 'REFRESH'}
        </button>
        <a className="pill" href="/?kiosk=1" target="_blank" rel="noopener">
          OPEN DOOR TABLET
        </a>
      </div>

      {error ? (
        <p className="banner banner-bad" role="alert">
          {error}
        </p>
      ) : null}

      {membersUnavailable ? (
        <p className="banner banner-bad" role="alert">
          Could not check KDVA membership. Member counts and tags are off until a refresh works.
        </p>
      ) : null}

      <label className="lbl" htmlFor="q">
        FIND SOMEONE
      </label>
      <input
        className="field"
        id="q"
        type="search"
        placeholder="Name or unit"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="tools">
        <button
          className="pill"
          type="button"
          aria-pressed={!onlyNonMembers}
          onClick={() => setOnlyNonMembers(false)}
        >
          ALL
        </button>
        <button
          className="pill"
          type="button"
          aria-pressed={onlyNonMembers}
          onClick={() => setOnlyNonMembers(true)}
        >
          NOT MEMBERS YET
        </button>
      </div>

      <div className="list">
        {rows === null ? (
          <div className="empty">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="empty">
            {rows.length === 0
              ? 'No RSVPs yet. The QR on the poster points at the form.'
              : 'No one matches that.'}
          </div>
        ) : (
          shown.map((r) => (
            <div key={r.id}>
              <div className="item">
                <div className="item-n">
                  <b>{r.name}</b>
                  <span>
                    {r.affiliation ?? ''}
                    {r.unit ? ` · ${r.unit}` : ''}
                    {r.is_member ? (
                      <em className="tag-kdva">KDVA ✓</em>
                    ) : r.wants_membership ? (
                      <em className="tag-wants">WANTS KDVA</em>
                    ) : null}
                  </span>
                </div>
                <div className="item-t">
                  {shortStamp(r.created_at)}
                  {!r.is_member && !membersUnavailable && openId !== r.id ? (
                    <button
                      className="pill item-act"
                      type="button"
                      onClick={() => openMakeMember(r)}
                    >
                      MAKE MEMBER
                    </button>
                  ) : null}
                </div>
              </div>

              {openId === r.id ? (
                <div className="panel">
                  <JoinFields
                    idPrefix={`m-${r.id}`}
                    status={status}
                    rank={rank}
                    onStatus={setStatus}
                    onRank={setRank}
                  />
                  <p className="err" role="alert" aria-live="polite">
                    {joinError}
                  </p>
                  <div className="tools">
                    <button
                      className="pill"
                      type="button"
                      onClick={() => void confirmMember(r)}
                      disabled={joining}
                    >
                      {joining ? 'SAVING…' : 'CONFIRM'}
                    </button>
                    <button className="pill" type="button" onClick={() => setOpenId(null)}>
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <p className="fine">
        {rows === null
          ? ''
          : shown.length !== rows.length
            ? `Showing ${shown.length} of ${rows.length}. Both counts above always cover everyone.`
            : 'RSVPS is the number for catering — one reply, one person. KDVA ✓ is already a member; WANTS KDVA asked to join and still needs MAKE MEMBER. Refreshes every 30 seconds.'}
      </p>
    </section>
  );
}
