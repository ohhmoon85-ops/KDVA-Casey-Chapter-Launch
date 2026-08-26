import { StaffPinGate } from '@/components/StaffPinGate';
import { StaffRoster } from '@/components/StaffRoster';
import { isStaff } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * The gate is decided on the server. An unsigned visitor is never sent the
 * roster markup at all, so there is nothing on the page to unhide.
 */
export default async function StaffPage() {
  return (await isStaff()) ? <StaffRoster /> : <StaffPinGate />;
}
