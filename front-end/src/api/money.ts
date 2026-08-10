const CENTS_IN_ONE_REAL = 100;

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCents(cents: number): string {
  return brlFormatter.format(cents / CENTS_IN_ONE_REAL);
}
