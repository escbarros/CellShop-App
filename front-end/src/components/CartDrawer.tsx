import { ShoppingCart, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCartLines } from '../hooks/useCartLines';
import {
  CART_DRAWER_CLOSE_MS,
  useCartDrawerStatus,
  useCartDrawerStore,
} from '../store/cart-drawer-store';
import { useCartUnitCount } from '../store/cart-store';
import { CartLine } from './CartLine';

export function CartDrawer() {
  const status = useCartDrawerStatus();
  const close = useCartDrawerStore((state) => state.close);
  const { lines, formattedSubtotal, isCatalogPending } = useCartLines();
  const unitCount = useCartUnitCount();
  const closeButton = useRef<HTMLButtonElement>(null);

  const isVisible = status !== 'closed';
  const isClosing = status === 'closing';

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isVisible, close]);

  if (!isVisible) {
    return null;
  }

  const exitDuration = isClosing ? { animationDuration: `${CART_DRAWER_CLOSE_MS}ms` } : undefined;

  return (
    <div className="fixed inset-0 z-60">
      <div
        aria-hidden="true"
        onClick={close}
        style={exitDuration}
        className={`absolute inset-0 bg-ink/40 ${isClosing ? 'fade-out pointer-events-none' : 'fade-in'}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        style={exitDuration}
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl ${
          isClosing ? 'slide-out-right' : 'slide-in-right'
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-drawer-title" className="text-base font-semibold text-ink">
            Seu carrinho
          </h2>

          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label="Fechar carrinho"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-tile hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tile text-ink-soft">
              <ShoppingCart aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <p className="text-base font-semibold text-ink">Seu carrinho está vazio</p>
            <p className="text-sm text-ink-soft">
              Escolha uma estampa na vitrine para começar seu pedido.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {lines.map((line) => (
              <CartLine key={line.sku} line={line} />
            ))}
          </ul>
        )}

        <footer className="border-t border-line px-5 py-4">
          {lines.length > 0 && (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-ink-soft">
                  Subtotal · {unitCount === 1 ? '1 unidade' : `${unitCount} unidades`}
                </span>
                <span className="text-lg font-semibold text-ink">
                  {isCatalogPending ? '—' : formattedSubtotal}
                </span>
              </div>

              <p className="mt-1 text-xs text-ink-faint">
                Frete e descontos entram no resumo do checkout.
              </p>

              <Link
                to="/checkout"
                onClick={close}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-ink text-sm font-semibold text-surface transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Finalizar compra
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={close}
            className="mt-3 h-11 w-full rounded-xl border border-line bg-surface text-sm font-semibold text-ink transition hover:border-ink hover:bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Continuar comprando
          </button>
        </footer>
      </aside>
    </div>
  );
}
