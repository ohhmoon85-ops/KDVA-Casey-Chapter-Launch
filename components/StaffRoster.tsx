'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Rsvp } from '@/lib/types';

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
  const [rows, setRows] = useState<Rsvp[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      const payload = (await res.json()) as { rows: Rsvp[] };
      setRows(payload.rows);
      setError('');
    } catch {
      setError('Could not reach the server. Check your connection, then try REFRESH.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  // Two counts, not three. Every reply is one person, so a separate
  // "expected" total would repeat the RSVP count in the next box along,
  // and two boxes showing the same number teach staff to distrust both.
  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      rsvps: list.length,
      membership: list.filter((r) => r.wants_membership).length,
    };
  }, [rows]);

  const shown = useMemo(() => {
    const list = rows ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(needle) ||
        (r.unit || '').toLowerCase().includes(needle),
    );
  }, [rows, query]);

  function exportCsv() {
    const head = ['Name', 'Affiliation', 'Unit', 'Email', 'Membership interest', 'RSVP time'];

    const body = (rows ?? []).map((r) => [
      r.name,
      r.affiliation ?? '',
      r.unit ?? '',
      r.email ?? '',
      r.wants_membership ? 'yes' : '',
      csvStamp(r.created_at),
    ]);

    // The leading U+FEFF is what stops Excel reading Korean names as
    // mojibake. Written as an escape on purpose: as a literal it is an
    // invisible character that an editor or a formatter can quietly drop,
    // and the damage would only show up on someone's laptop in September.
    const csv =
      '\uFEFF' + [head, ...body].map((line) => line.map(csvCell).join(',')).join('\r\n');

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
          <b>{rows === null ? '—' : stats.membership}</b>
          <span>MEMBERSHIP</span>
        </div>
      </div>

      <div className="tools">
        <button className="pill" type="button" onClick={exportCsv} disabled={!rows?.length}>
          EXPORT CSV
        </button>
        <button className="pill" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? 'LOADING…' : 'REFRESH'}
        </button>
      </div>

      {error ? (
        <p className="banner banner-bad" role="alert">
          {error}
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
            <div className="item" key={r.id}>
              <div className="item-n">
                <b>{r.name}</b>
                <span>
                  {r.affiliation ?? ''}
                  {r.unit ? ` · ${r.unit}` : ''}
                  {r.wants_membership ? <em className="tag-kdva">KDVA</em> : null}
                </span>
              </div>
              <div className="item-t">{shortStamp(r.created_at)}</div>
            </div>
          ))
        )}
      </div>

      <p className="fine">
        {rows === null
          ? ''
          : query.trim() && shown.length !== rows.length
            ? `Showing ${shown.length} of ${rows.length}. Both counts above always cover everyone.`
            : 'RSVPS is the number for catering — one reply, one person. KDVA marks the people who asked for membership information.'}
      </p>
    </section>
  );
}
