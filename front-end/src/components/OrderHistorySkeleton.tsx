const PLACEHOLDER_LINES = [0, 1, 2];

export function OrderHistorySkeleton() {
  return (
    <div role="status" aria-label="Carregando seus pedidos">
      <ul aria-hidden="true" className="animate-pulse space-y-3">
        {PLACEHOLDER_LINES.map((line) => (
          <li key={line} className="h-20 rounded-2xl bg-tile" />
        ))}
      </ul>
    </div>
  );
}
