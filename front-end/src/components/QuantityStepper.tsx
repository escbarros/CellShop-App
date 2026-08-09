import { Minus, Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type QuantityStepperProps = {
  value: number;
  max: number;
  onIncrease: () => void;
  onDecrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
  decreaseIcon?: ReactNode;
};

export function QuantityStepper({
  value,
  max,
  onIncrease,
  onDecrease,
  decreaseLabel,
  increaseLabel,
  decreaseIcon,
}: QuantityStepperProps) {
  return (
    <div className="flex h-10 w-fit items-center rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={decreaseLabel}
        className="flex h-full w-10 items-center justify-center rounded-l-xl text-ink transition hover:bg-tile focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        {decreaseIcon ?? <Minus aria-hidden="true" className="h-4 w-4" />}
      </button>

      <span className="w-8 text-center text-sm font-semibold text-ink tabular-nums">{value}</span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        aria-label={increaseLabel}
        className="flex h-full w-10 items-center justify-center rounded-r-xl text-ink transition hover:bg-tile focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
