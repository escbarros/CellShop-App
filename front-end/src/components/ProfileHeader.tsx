import { User } from 'lucide-react';
import type { RecipientLike } from '../api/recipient';
import {
  displayTaxId,
  formatCityLine,
  formatPhone,
  formatStreetLine,
  formatZipCode,
} from '../api/recipient';

type ProfileHeaderProps = {
  recipient: RecipientLike;
};

export function ProfileHeader({ recipient }: ProfileHeaderProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tile text-ink-soft">
            <User aria-hidden="true" className="h-6 w-6" strokeWidth={1.7} />
          </span>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{recipient.name}</h2>
            <p className="mt-1 text-sm text-ink-soft">{recipient.email}</p>
            {recipient.phone && (
              <p className="text-sm text-ink-soft">{formatPhone(recipient.phone)}</p>
            )}
            <p className="mt-1 text-xs text-ink-faint">CPF {displayTaxId(recipient.taxId)}</p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xs tracking-wide text-ink-faint uppercase">Entrega em</p>

          <address className="mt-1.5 space-y-0.5 text-sm text-ink-soft not-italic">
            <p>{formatStreetLine(recipient)}</p>
            <p>{formatCityLine(recipient)}</p>
            <p>CEP {formatZipCode(recipient.zipCode)}</p>
          </address>
        </div>
      </div>
    </section>
  );
}
