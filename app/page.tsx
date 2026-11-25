import { RsvpForm } from '@/components/RsvpForm';
import { isEventDay, registrationClosed } from '@/lib/event';

/**
 * Rendered per request rather than at build time. If this page were static,
 * the deadline and the event day would be judged once when the site was
 * built, and the wording would never change on 28 November or 3 December.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <RsvpForm
      closed={registrationClosed()}
      eventDay={isEventDay()}
      kiosk={params.kiosk === '1'}
      same={params.same === '1'}
    />
  );
}
