import Link from 'next/link';

/**
 * Section 8 of the spec. The disclaimer answers a 2nd Infantry Division
 * SJA requirement about private organisations advertising on post.
 * It may not be deleted or shortened.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="rule-thin mb-4" />
      Hosted by KDVA, a private veterans association — not an official U.S. Army function or
      endorsement. Attendance is voluntary and off duty. RSVP is not required to attend.
      <br />
      Contact: Dr. John P. Maza, KDVA Casey Chapter ·{' '}
      <Link href="/staff">Staff</Link>
    </footer>
  );
}
