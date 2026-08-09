import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CheckoutEmpty() {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tile text-ink-soft">
        <ShoppingCart aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
      </span>

      <h2 className="text-base font-semibold text-ink">Não há nada para finalizar</h2>
      <p className="text-sm text-ink-soft">
        Seu carrinho está vazio. Escolha uma estampa na vitrine e ela aparece aqui.
      </p>

      <Link
        to="/"
        className="mt-2 flex h-11 items-center rounded-xl bg-ink px-6 text-sm font-semibold text-surface transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Ver a vitrine
      </Link>
    </div>
  );
}
