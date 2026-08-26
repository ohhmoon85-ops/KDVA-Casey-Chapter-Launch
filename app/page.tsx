import { RsvpForm } from '@/components/RsvpForm';
import { registrationClosed } from '@/lib/event';

/**
 * Rendered per request rather than at build time. If this page were static,
 * the deadline would be judged once when the site was built and the notice
 * would never change on 5 September.
 */
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <RsvpForm closed={registrationClosed()} />;
}
