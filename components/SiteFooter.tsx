/**
 * Section 8 of the spec. The disclaimer answers a 2nd Infantry Division
 * SJA requirement about private organisations advertising on post.
 * It may not be deleted or shortened.
 *
 * One approved departure from the spec's wording: Dr. Maza's title. The
 * spec reads "Dr. John P. Maza, KDVA Casey Chapter"; he is the chapter
 * President and the footer now says so.
 *
 * There is deliberately no link to /staff here. One used to sit after his
 * name and read as though "Staff" were his title. Staff reach the roster
 * by typing /staff, or from a bookmark made before the night.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="rule-thin mb-4" />
      Hosted by KDVA, a private veterans association — not an official U.S. Army function or
      endorsement. Attendance is voluntary and off duty. RSVP is not required to attend.
      <br />
      Contact: Dr. John P. Maza, President, KDVA Casey Chapter
    </footer>
  );
}
