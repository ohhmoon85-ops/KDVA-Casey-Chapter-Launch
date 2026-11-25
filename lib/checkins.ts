/**
 * What this phone remembers about the check-ins it made, so that coming
 * back through the same QR shows "Checked in as …" and a one-tap join.
 * Browser only, and only ever a convenience: private browsing, a full disk
 * or a blocked storage API must leave the form working exactly as before,
 * so every access is wrapped and fails quietly.
 *
 * The door tablet (/?kiosk=1) never writes here — the next person to pick
 * it up must not see the last person's name. It hands its result to the
 * thanks screen in memory instead, which survives the client-side
 * navigation and nothing else.
 */
import { EVENT } from '@/lib/event';

const KEY = 'kdva_casey_checkins';
const KEEP = 6;

export type MemberState = 'joined' | 'already' | 'failed' | null;

export type CheckIn = {
  event: string;
  id: number;
  token: string;
  /** "Last, First", as stored. */
  name: string;
  member: MemberState;
  affiliation: string;
  unit: string | null;
  at: number;
};

export const isMember = (m: MemberState) => m === 'joined' || m === 'already';

function readAll(): CheckIn[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? (list as CheckIn[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: CheckIn[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, KEEP)));
  } catch {
    // Storage refused. The check-in is saved on the server regardless.
  }
}

/** This event's check-ins from this phone, newest first. */
export function checkInsForEvent(): CheckIn[] {
  return readAll()
    .filter((c) => c && c.event === EVENT && typeof c.id === 'number')
    .sort((a, b) => b.at - a.at);
}

export function findCheckIn(id: number): CheckIn | null {
  return checkInsForEvent().find((c) => c.id === id) ?? null;
}

export function saveCheckIn(entry: Omit<CheckIn, 'event' | 'at'>) {
  const rest = readAll().filter((c) => !(c.event === EVENT && c.id === entry.id));
  writeAll([{ ...entry, event: EVENT, at: Date.now() }, ...rest]);
}

export function updateMember(id: number, member: MemberState) {
  writeAll(readAll().map((c) => (c.event === EVENT && c.id === id ? { ...c, member } : c)));
}

let kioskLast: CheckIn | null = null;

/** The door tablet's last result, held in memory only. */
export function setKioskLast(entry: Omit<CheckIn, 'event' | 'at'> | null) {
  kioskLast = entry ? { ...entry, event: EVENT, at: Date.now() } : null;
}

export function getKioskLast(): CheckIn | null {
  return kioskLast;
}
