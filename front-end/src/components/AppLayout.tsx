import { Outlet } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 lg:pt-28">
        <Outlet />
      </main>

      <CartDrawer />
    </div>
  );
}
