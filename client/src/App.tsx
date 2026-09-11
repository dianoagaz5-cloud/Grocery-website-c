import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/oContext';
import { CartProvider } from './context/cartContext';
import { Toaster } from 'react-hot-toast';

// Client Pages
import AppLayout from './pages/appLayout';
import Home from './pages/home';
import Products from './pages/products';
import ProductPage from './pages/productPage';
import FlashDeals from './pages/flashDeals';
import SearchResults from './pages/searchResults';
import MyOrders from './pages/myOrders';
import OrderTracking from './pages/orderTracking';
import Checkout from './pages/checkout';
import Addresses from './pages/addresses';
import Login from './pages/login';

// Admin Pages
import AdminLayout from './pages/admin/adminLayout';
import AdminDashboard from './pages/admin/adminDashboard';
import AdminProducts from './pages/admin/adminProducts';
import AdminProductForm from './pages/admin/adminProductForm';
import AdminOrders from './pages/admin/adminOrders';
import AdminDeliveryPartners from './pages/admin/adminDeliveryPartners';

// Delivery Pages
import DeliveryLayout from './pages/delivery/deliveryLayout';
import DeliveryLogin from './pages/delivery/deliveryLogin';
import DeliveryDashboard from './pages/delivery/deliveryDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
          <Routes>
            {/* Standalone Authentication Pages (No Navbar, No Footer) */}
            <Route path="/login" element={<Login />} />

            {/* Storefront Routes with Navbar, Footer, and CartSidebar */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductPage />} />
              <Route path="deals" element={<FlashDeals />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderTracking />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="addresses" element={<Addresses />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
            </Route>

            {/* Delivery Partner Routes */}
            <Route path="/delivery/login" element={<DeliveryLogin />} />
            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route index element={<Navigate to="/delivery/dashboard" replace />} />
              <Route path="dashboard" element={<DeliveryDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
