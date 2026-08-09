import { Smartphone } from 'lucide-react';
import { CartButton } from './CartButton';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-18 lg:px-8">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
            <Smartphone aria-hidden="true" className="h-5 w-5 text-surface" strokeWidth={1.8} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">CellShop</span>
        </span>

        <CartButton />
      </div>
    </header>
  );
}
