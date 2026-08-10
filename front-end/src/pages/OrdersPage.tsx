import { CHECKOUT_RECIPIENT } from '../api/recipient';
import { OrderHistory } from '../components/OrderHistory';
import { ProfileHeader } from '../components/ProfileHeader';

export function OrdersPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Perfil</h1>

      <ProfileHeader recipient={CHECKOUT_RECIPIENT} />

      <h2 className="mt-10 mb-4 border-b border-line pb-3 text-base font-semibold text-ink">
        Meus pedidos
      </h2>

      <OrderHistory />
    </>
  );
}
