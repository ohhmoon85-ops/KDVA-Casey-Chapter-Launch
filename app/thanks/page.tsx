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
