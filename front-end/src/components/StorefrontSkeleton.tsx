const PLACEHOLDER_COUNT = 8;

export function StorefrontSkeleton() {
  return (
    <div role="status" aria-label="Carregando capinhas">
      <ul
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6"
      >
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <li key={index} className="flex animate-pulse flex-col gap-3">
            <div className="aspect-[3/4] rounded-2xl bg-tile" />
            <div className="h-3.5 w-4/5 rounded-full bg-tile" />
            <div className="h-3.5 w-2/5 rounded-full bg-tile" />
            <div className="h-11 rounded-xl bg-tile" />
          </li>
        ))}
      </ul>
    </div>
  );
}
