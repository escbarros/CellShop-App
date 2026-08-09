const PLACEHOLDER_COUNT = 2;

export function CheckoutSkeleton() {
  return (
    <div role="status" aria-label="Carregando o resumo do pedido">
      <div aria-hidden="true" className="grid animate-pulse gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-line">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
            <li key={index} className="flex gap-4 py-5">
              <div className="h-20 w-16 shrink-0 rounded-xl bg-tile" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3.5 w-2/3 rounded-full bg-tile" />
                <div className="h-3.5 w-1/3 rounded-full bg-tile" />
              </div>
            </li>
          ))}
        </ul>

        <div className="h-56 rounded-2xl bg-tile" />
      </div>
    </div>
  );
}
