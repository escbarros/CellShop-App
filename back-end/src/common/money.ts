export type Cents = number;

const CENTS_IN_ONE_REAL = 100;

const NON_BREAKING_SPACE = /\u00a0/g;

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Money must be a safe integer amount of cents, received ${value}`);
  }
}

export function multiply(cents: Cents, quantity: number): Cents {
  assertCents(cents);
  assertCents(quantity);

  const total = cents * quantity;
  assertCents(total);

  return total;
}

export function sum(...values: Cents[]): Cents {
  return values.reduce((total, value) => {
    assertCents(value);

    const next = total + value;
    assertCents(next);

    return next;
  }, 0);
}

export function formatBRL(cents: Cents): string {
  assertCents(cents);

  return BRL_FORMATTER.format(cents / CENTS_IN_ONE_REAL).replace(NON_BREAKING_SPACE, ' ');
}

export function toCents(amount: number): Cents {
  if (!Number.isFinite(amount)) {
    throw new Error(`Amount must be a finite number of reais, received ${amount}`);
  }

  const cents = Math.round(amount * CENTS_IN_ONE_REAL);
  assertCents(cents);

  return cents;
}
