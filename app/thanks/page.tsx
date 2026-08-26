import Link from 'next/link';
import { MAX_GUESTS } from '@/lib/event';

/**
 * There is no ticket, no code and no QR — by design. The only thing this
 * screen needs to know is how many people were counted, which the form
 * passes in the address so a refresh still shows the right number.
 * It is display text only; nothing downstream trusts it.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ guests?: string }>;
}) {
  const { guests } = await searchParams;
  const extra = Math.min(Math.max(Math.trunc(Number(guests)) || 0, 0), MAX_GUESTS);
  const total = 1 + extra;

  return (
    <section className="fade pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker kicker-red">YOU&rsquo;RE ON THE LIST</div>

      <p className="lede">
        Just give your name at the door. Nothing to show, nothing to print.
        {total > 1 ? (
          <>
            {' '}
            We have you down for <b>{total}</b> people.
          </>
        ) : null}
      </p>

      <a className="btn btn-ghost" href="/kdva-casey-launch.ics" download>
        ADD TO CALENDAR
      </a>

      <Link className="btn btn-ghost" href="/">
        RSVP FOR SOMEONE ELSE
      </Link>

      <p className="fine">
        Wednesday 16 September 2026, 1730—1930 · Warrior Club, Camp Casey. Official remarks run 15
        minutes; the rest is food, music, and conversation.
      </p>
    </section>
  );
}
