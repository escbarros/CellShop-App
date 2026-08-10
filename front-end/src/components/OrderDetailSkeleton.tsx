export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-label="Carregando o pedido">
      <div aria-hidden="true" className="animate-pulse">
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-line pb-6">
          <div className="flex flex-col gap-3">
            <div className="h-8 w-64 rounded-full bg-tile" />
            <div className="h-3.5 w-40 rounded-full bg-tile" />
          </div>
          <div className="h-8 w-32 rounded-full bg-tile" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div className="flex flex-col gap-4">
            <div className="h-4 w-32 rounded-full bg-tile" />
            <div className="h-16 w-full rounded-xl bg-tile" />
            <div className="h-16 w-full rounded-xl bg-tile" />
          </div>

          <div className="h-72 rounded-2xl bg-tile" />
        </div>
      </div>
    </div>
  );
}
