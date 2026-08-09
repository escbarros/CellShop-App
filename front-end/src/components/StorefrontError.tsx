import { CircleAlert } from 'lucide-react';

type StorefrontErrorProps = {
  message: string;
  onRetry: () => void;
};

export function StorefrontError({ message, onRetry }: StorefrontErrorProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral-soft text-coral">
        <CircleAlert aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
      </span>

      <h2 className="text-base font-semibold text-ink">Não foi possível carregar a vitrine</h2>
      <p className="text-sm text-ink-soft">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-2 h-11 rounded-xl bg-ink px-6 text-sm font-semibold text-surface transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Tentar de novo
      </button>
    </div>
  );
}
