import { ThanksView } from '@/components/ThanksView';
import { isEventDay } from '@/lib/event';

/** Per request, so the event-day wording turns on by itself on 3 December. */
export const dynamic = 'force-dynamic';

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const r = Number(params.r);

  return (
    <ThanksView
      id={Number.isSafeInteger(r) && r > 0 ? r : null}
      kiosk={params.kiosk === '1'}
      eventDay={isEventDay()}
    />
  );
}
