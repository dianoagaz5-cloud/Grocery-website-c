import { Outlet } from 'react-router-dom';
import Banner from '../components/banner';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import CartSidebar from '../components/cartSidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
