import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfileButton() {
  return (
    <Link
      to="/orders"
      aria-label="Meus pedidos"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:border-ink hover:bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <User aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
    </Link>
  );
}
