/**
 * The poster's header block. It sits above every screen, unchanged. The
 * wording follows the year-end poster (THU 3 DEC), so it is not adjustable
 * here without the poster changing first.
 */
export function PosterHeader() {
  return (
    <header className="pt-[26px]">
      <div className="rule" />

      <div className="eyebrow">
        <span>KOREA DEFENSE VETERANS ASSOCIATION</span>
        <span>USAG CASEY / ROK</span>
      </div>

      <h1 className="headline">
        <span className="text-paper">LIVE</span>
        <span className="text-red">K-POP</span>
      </h1>

      <div className="venue">CASEY CHAPTER · YEAR-END MEET &amp; GREET</div>

      <div className="bar">THU 3 DEC &nbsp;·&nbsp; 1800</div>

      <div className="meta">
        FEATURING BLUEBEATZ / SIX-MEMBER K-POP GIRL GROUP
        <br />
        LIVE ON STAGE AT THE WARRIOR CLUB
        <br />
        FREE FOOD / RSVP BY FRI 27 NOV
      </div>
    </header>
  );
}
