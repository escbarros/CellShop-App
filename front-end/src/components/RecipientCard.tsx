import { MapPin } from 'lucide-react';
import type { RecipientLike } from '../api/recipient';
import {
  displayTaxId,
  formatCityLine,
  formatPhone,
  formatStreetLine,
  formatZipCode,
} from '../api/recipient';

type RecipientCardProps = {
  recipient: RecipientLike;
};

export function RecipientCard({ recipient }: RecipientCardProps) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <MapPin aria-hidden="true" className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
        Entrega
      </h2>

      <p className="mt-3 text-sm font-medium text-ink">{recipient.name}</p>
      <p className="mt-0.5 text-xs text-ink-faint">CPF {displayTaxId(recipient.taxId)}</p>

      <address className="mt-3 space-y-0.5 text-sm text-ink-soft not-italic">
        <p>{formatStreetLine(recipient)}</p>
        <p>{formatCityLine(recipient)}</p>
        <p>CEP {formatZipCode(recipient.zipCode)}</p>
      </address>

      <p className="mt-3 text-xs text-ink-faint">{recipient.email}</p>
      {recipient.phone && (
        <p className="mt-0.5 text-xs text-ink-faint">{formatPhone(recipient.phone)}</p>
      )}
    </section>
  );
}
