import Link from 'next/link';

/**
 * There is no ticket, no code and no QR — by design. Everyone who replies
 * counts as one person, so there is no number to carry over here either.
 */
export default function ThanksPage() {
  return (
    <section className="fade pt-[30px]">
      <div className="rule-thin" />
      <div className="kicker kicker-red">YOU&rsquo;RE ON THE LIST</div>

      <p className="lede">Just give your name at the door. Nothing to show, nothing to print.</p>

      <a className="btn btn-ghost" href="/kdva-casey-year-end.ics" download>
        ADD TO CALENDAR
      </a>

      <Link className="btn btn-ghost" href="/">
        RSVP FOR SOMEONE ELSE
      </Link>

      <p className="fine">
        Thursday 3 December 2026, 1800—2000 · Warrior Club, Camp Casey. A year-end night of food,
        live music, and good company — no long speeches.
      </p>
    </section>
  );
}
