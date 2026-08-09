import { Smartphone } from 'lucide-react';

export function StorefrontEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tile text-ink-soft">
        <Smartphone aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
      </span>

      <h2 className="text-base font-semibold text-ink">Vitrine vazia por enquanto</h2>
      <p className="text-sm text-ink-soft">
        Nenhuma capinha disponível no momento. Volte daqui a pouco.
      </p>
    </div>
  );
}
