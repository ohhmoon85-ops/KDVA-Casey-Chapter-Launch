/**
 * Service status and rank, shared by the forms and the API routes. Nothing
 * secret here, so it is safe to import from a client component.
 *
 * Copied from the membership app (katusa-membership, lib/membership.ts).
 * Both apps write to the same `members` table, and the HQ weekly report
 * groups people by the exact `rank` string, so every `value` below and the
 * way composeRank() joins them must stay identical to that app's. Only the
 * on-screen English labels are this app's own.
 */

export type ServiceStatus = '현역' | '예비역' | '민간인';

export const SERVICE_STATUSES: { value: ServiceStatus; en: string }[] = [
  { value: '현역', en: 'Active Duty' },
  { value: '예비역', en: 'Veteran / Retired' },
  { value: '민간인', en: 'Civilian — never served' },
];

export const isServiceStatus = (v: unknown): v is ServiceStatus =>
  SERVICE_STATUSES.some((s) => s.value === v);

/** What a civilian who never served is stored as. They pick no rank. */
export const CIVILIAN_NO_SERVICE = '민간인 (Civilian)';

export type RankOption = { value: string; en: string };
export type RankGroup = { en: string; ranks: RankOption[] };

export const MILITARY_RANK_GROUPS: RankGroup[] = [
  {
    en: 'Enlisted',
    ranks: [
      { value: '이병 (Private)', en: 'Private (PVT)' },
      { value: '일병 (PFC)', en: 'Private First Class (PFC)' },
      { value: '상병 (Corporal)', en: 'Corporal (CPL)' },
      { value: '병장 (Sergeant)', en: 'Sergeant (SGT)' },
    ],
  },
  {
    en: 'NCO',
    ranks: [
      { value: '하사 (Staff Sergeant)', en: 'Staff Sergeant (SSG)' },
      { value: '중사 (Sergeant First Class)', en: 'Sergeant First Class (SFC)' },
      { value: '상사 (Master Sergeant)', en: 'Master Sergeant (MSG)' },
      { value: '원사 (Sergeant Major)', en: 'Sergeant Major (SGM)' },
    ],
  },
  {
    en: 'Warrant Officer',
    ranks: [{ value: '준위 (Warrant Officer)', en: 'Warrant Officer (WO)' }],
  },
  {
    en: 'Officer',
    ranks: [
      { value: '소위 (2nd Lieutenant)', en: '2nd Lieutenant (2LT)' },
      { value: '중위 (1st Lieutenant)', en: '1st Lieutenant (1LT)' },
      { value: '대위 (Captain)', en: 'Captain (CPT)' },
      { value: '소령 (Major)', en: 'Major (MAJ)' },
      { value: '중령 (Lieutenant Colonel)', en: 'Lieutenant Colonel (LTC)' },
      { value: '대령 (Colonel)', en: 'Colonel (COL)' },
      { value: '준장 (Brigadier General)', en: 'Brigadier General (BG)' },
      { value: '소장 (Major General)', en: 'Major General (MG)' },
      { value: '중장 (Lieutenant General)', en: 'Lieutenant General (LTG)' },
      { value: '대장 (General)', en: 'General (GEN)' },
    ],
  },
];

/** A veteran who would rather be listed as a civilian than by rank. */
export const VETERAN_CIV: RankOption = { value: '민간인 (Civ)', en: 'Civilian (Civ)' };

/** The non-military option under Active Duty. */
export const ACTIVE_CIVILIAN: RankOption = {
  value: '군무원 (Army Civilian Employee)',
  en: 'Army Civilian Employee',
};

/** The ranks each status may pick from. A civilian who never served has none. */
export function rankGroupsFor(status: ServiceStatus): RankGroup[] {
  if (status === '민간인') return [];
  const nonMilitary = status === '예비역' ? VETERAN_CIV : ACTIVE_CIVILIAN;
  return [...MILITARY_RANK_GROUPS, { en: 'Non-Military', ranks: [nonMilitary] }];
}

const MILITARY_RANK_VALUES = new Set(
  MILITARY_RANK_GROUPS.flatMap((g) => g.ranks.map((r) => r.value)),
);

/**
 * Status plus rank, joined the way the `members` table stores them. Null
 * for any combination the membership app would not accept.
 *
 *   현역 + military rank  → "현역 병장 (Sergeant)"
 *   예비역 + military rank → "예비역 병장 (Sergeant, Ret.)"
 *   예비역 + Civ          → "예비역 민간인 (Civ)"
 *   현역 + 군무원          → "군무원 (Army Civilian Employee)"
 *   민간인                → "민간인 (Civilian)"  (rank ignored)
 */
export function composeRank(status: unknown, rank: unknown): string | null {
  if (!isServiceStatus(status)) return null;
  if (status === '민간인') return CIVILIAN_NO_SERVICE;
  if (typeof rank !== 'string') return null;

  if (MILITARY_RANK_VALUES.has(rank)) {
    const rankText = status === '예비역' ? rank.replace(/\)$/, ', Ret.)') : rank;
    return `${status} ${rankText}`;
  }
  if (status === '예비역' && rank === VETERAN_CIV.value) return `예비역 ${VETERAN_CIV.value}`;
  if (status === '현역' && rank === ACTIVE_CIVILIAN.value) return ACTIVE_CIVILIAN.value;
  return null;
}

/**
 * A first guess at service status from the "I am" answer, so most people
 * only have to pick a rank. It is a default the person can change, never
 * a decision. Family members and guests get no guess.
 */
export function statusFromAffiliation(affiliation: string | null | undefined): ServiceStatus | '' {
  switch (affiliation) {
    case 'U.S. Soldier':
    case 'KATUSA':
    case 'ROK military':
    case 'DoD civilian':
      return '현역';
    case 'Veteran':
      return '예비역';
    default:
      return '';
  }
}

/**
 * The one line that asks someone to join, chosen by "I am". Approved
 * wording — change it only with the user's say-so. Anything unknown gets
 * the Guest line.
 */
const PITCHES: Record<string, string> = {
  'U.S. Soldier': 'Keep your Korea connection after you PCS.',
  KATUSA: 'Stay connected with your U.S. battle buddies after you ETS.',
  'ROK military': 'Stay connected with your U.S. counterparts — tonight and long after.',
  'DoD civilian': 'Keep your Korea connection after your tour ends.',
  Veteran: 'Welcome back to the Korea family.',
  'Family member': 'Be part of the ROK-US alliance community.',
  Guest: 'Be part of the ROK-US alliance community.',
};

export function pitchFor(affiliation: string | null | undefined): string {
  return PITCHES[affiliation ?? ''] ?? PITCHES.Guest;
}
