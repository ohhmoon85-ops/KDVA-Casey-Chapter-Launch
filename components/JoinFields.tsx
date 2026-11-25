'use client';

import { rankGroupsFor, SERVICE_STATUSES, type ServiceStatus } from '@/lib/membership';

/**
 * Service status and rank, the two things joining KDVA asks for beyond
 * what the check-in already has. Used by the sign-up form, the thanks
 * screen's second offer and the roster's MAKE MEMBER.
 *
 * Controlled by the parent, which owns the default guessed from "I am".
 */
export function JoinFields({
  idPrefix,
  status,
  rank,
  onStatus,
  onRank,
}: {
  idPrefix: string;
  status: ServiceStatus | '';
  rank: string;
  onStatus: (status: ServiceStatus | '') => void;
  onRank: (rank: string) => void;
}) {
  const groups = status ? rankGroupsFor(status) : [];

  return (
    <>
      <label className="lbl" htmlFor={`${idPrefix}-status`}>
        SERVICE STATUS
      </label>
      <select
        className="field"
        id={`${idPrefix}-status`}
        value={status}
        onChange={(e) => {
          onStatus(e.target.value as ServiceStatus | '');
          // The rank lists differ by status, so an old pick may not exist.
          onRank('');
        }}
      >
        <option value="">Select…</option>
        {SERVICE_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.en}
          </option>
        ))}
      </select>

      {groups.length > 0 ? (
        <>
          <label className="lbl" htmlFor={`${idPrefix}-rank`}>
            RANK
          </label>
          <select
            className="field"
            id={`${idPrefix}-rank`}
            value={rank}
            onChange={(e) => onRank(e.target.value)}
          >
            <option value="">Select…</option>
            {groups.map((g) => (
              <optgroup key={g.en} label={g.en}>
                {g.ranks.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.en}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </>
      ) : null}
    </>
  );
}

/** The same check the server makes, for an error before the round trip. */
export function joinFieldsError(status: ServiceStatus | '', rank: string): string {
  if (!status) return 'Pick your service status to join KDVA.';
  if (status !== '민간인' && !rank) return 'Pick your rank to join KDVA.';
  return '';
}
