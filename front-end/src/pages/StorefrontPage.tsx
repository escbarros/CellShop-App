import { Storefront } from '../components/Storefront';

export function StorefrontPage() {
  return (
    <>
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Capinhas de celular
        </h1>
        <p className="mt-2 text-sm text-ink-soft sm:text-base">
          Estampas exclusivas em capinhas antichoque, com envio para todo o Brasil.
        </p>
      </div>

      <Storefront />
    </>
  );
}
