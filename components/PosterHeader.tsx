/**
 * The poster's header block, section 7 of the spec. It sits above every
 * screen, unchanged. The wording and the running order are printed on the
 * poster, so they are not adjustable here.
 */
export function PosterHeader() {
  return (
    <header className="pt-[26px]">
      <div className="rule" />

      <div className="eyebrow">
        <span>KOREA DEFENSE VETERANS ASSOCIATION</span>
        <span>USAG CASEY</span>
      </div>

      <h1 className="headline">
        <span className="text-paper">LIVE</span>
        <span className="text-red">K-POP</span>
      </h1>

      <div className="venue">AT THE WARRIOR CLUB</div>

      <div className="bar">WED 16 SEP &nbsp;·&nbsp; 1730 — 1930</div>

      <div className="meta">
        VOICE ON THE STREET / FIRST SET 1820 / SECOND SET 1905
        <br />
        FREE FOOD / TWO LIVE SETS / RSVP BY FRI 4 SEP
      </div>
    </header>
  );
}
