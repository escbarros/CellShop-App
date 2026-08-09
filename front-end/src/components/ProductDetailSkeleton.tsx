export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Carregando a capinha">
      <div aria-hidden="true" className="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-square rounded-3xl bg-tile lg:aspect-[4/5]" />

        <div className="flex flex-col gap-4">
          <div className="h-7 w-3/4 rounded-full bg-tile" />
          <div className="h-9 w-1/3 rounded-full bg-tile" />
          <div className="mt-2 h-3.5 w-full rounded-full bg-tile" />
          <div className="h-3.5 w-5/6 rounded-full bg-tile" />
          <div className="mt-6 h-10 w-32 rounded-xl bg-tile" />
          <div className="h-12 w-full rounded-xl bg-tile" />
        </div>
      </div>
    </div>
  );
}
