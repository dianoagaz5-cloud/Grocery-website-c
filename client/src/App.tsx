import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/oContext';
import { CartProvider } from './context/cartContext';
import { Toaster } from 'react-hot-toast';
import Loading from './components/loading';

// Client Pages (Core bundle for instant customer access)
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

// Code Splitting (React.lazy) for Admin Module
const AdminLayout = lazy(() => import('./pages/admin/adminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/adminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/adminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/adminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/adminOrders'));
const AdminDeliveryPartners = lazy(() => import('./pages/admin/adminDeliveryPartners'));

// Code Splitting (React.lazy) for Delivery Module
const DeliveryLayout = lazy(() => import('./pages/delivery/deliveryLayout'));
const DeliveryLogin = lazy(() => import('./pages/delivery/deliveryLogin'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/deliveryDashboard'));

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

            {/* Code-Split Admin Routes */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<Loading />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<Suspense fallback={<Loading />}><AdminDashboard /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<Loading />}><AdminProducts /></Suspense>} />
              <Route path="products/new" element={<Suspense fallback={<Loading />}><AdminProductForm /></Suspense>} />
              <Route path="products/:id/edit" element={<Suspense fallback={<Loading />}><AdminProductForm /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<Loading />}><AdminOrders /></Suspense>} />
              <Route path="delivery-partners" element={<Suspense fallback={<Loading />}><AdminDeliveryPartners /></Suspense>} />
            </Route>

            {/* Code-Split Delivery Partner Routes */}
            <Route
              path="/delivery/login"
              element={
                <Suspense fallback={<Loading />}>
                  <DeliveryLogin />
                </Suspense>
              }
            />
            <Route
              path="/delivery"
              element={
                <Suspense fallback={<Loading />}>
                  <DeliveryLayout />
                </Suspense>
              }
            >
              <Route index element={<Navigate to="/delivery/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<Loading />}><DeliveryDashboard /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
