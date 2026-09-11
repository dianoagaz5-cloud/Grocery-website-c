import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneIcon, UserIcon, MapPinIcon, PackageIcon } from 'lucide-react';
import { dummyDashboardOrdersData, statusColors } from '../assets/assets';
import LiveMap from '../components/orderTracking/liveMap';
import OrderTimeLine from '../components/orderTracking/orderTimeline';
import OrderOTP from '../components/orderTracking/orderOTP';
import type { Order } from '../types';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    // 1. Check local storage orders
    const localOrdersJson = localStorage.getItem('instamart_orders');
    const localOrders: Order[] = localOrdersJson ? JSON.parse(localOrdersJson) : [];

    const found =
      localOrders.find((o) => o._id === id) ||
      ((dummyDashboardOrdersData as unknown as Order[]).find((o) => o._id === id) ?? null);

    if (found) {
      setOrder(found);
      if ((found as any).liveLocation) {
        setLiveLocation((found as any).liveLocation);
      } else if (found.shippingAddress?.lat) {
        setLiveLocation({
          lat: found.shippingAddress.lat + 0.003,
          lng: found.shippingAddress.lng + 0.003,
        });
      }
    }
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-app-green mb-4">Order Not Found</h2>
        <p className="text-xs text-app-text-light mb-6">Could not find tracking details for this order.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-green text-white font-semibold rounded-xl text-xs"
        >
          <ArrowLeftIcon className="size-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const statusClass = statusColors[order.status] || 'bg-zinc-100 text-zinc-700';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-app-green hover:underline mb-2"
          >
            <ArrowLeftIcon className="size-3.5" /> Back to All Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-app-green">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-app-text-light mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tracking Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Map */}
          <LiveMap order={order} liveLocation={liveLocation} />

          {/* Delivery OTP card */}
          <OrderOTP order={order} />

          {/* Delivery partner info card if assigned */}
          {order.deliveryPartner && (
            <div className="bg-white rounded-2xl p-5 border border-app-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-app-cream flex-center text-app-green">
                  <UserIcon className="size-6" />
                </div>
                <div>
                  <p className="text-xs text-app-text-light uppercase tracking-wider">Your Delivery Partner</p>
                  <p className="text-sm font-bold text-app-green">{order.deliveryPartner.name}</p>
                </div>
              </div>
              {order.deliveryPartner.phone && (
                <a
                  href={`tel:${order.deliveryPartner.phone}`}
                  className="size-10 rounded-xl bg-app-green/10 text-app-green flex-center hover:bg-app-green hover:text-white transition-colors"
                >
                  <PhoneIcon className="size-4" />
                </a>
              )}
            </div>
          )}

          {/* Ordered items list */}
          <div className="bg-white rounded-2xl p-6 border border-app-border">
            <h2 className="text-base font-semibold text-app-green mb-4 flex items-center gap-2">
              <PackageIcon className="size-4" /> Ordered Items ({order.items.length})
            </h2>
            <div className="divide-y divide-app-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-12 rounded-xl object-cover border border-app-border"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-app-green">{item.name}</p>
                    <p className="text-[11px] text-app-text-light">
                      Qty: {item.quantity} • {item.unit}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-app-green">
                    {currency}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          {/* Order Progress Timeline */}
          <OrderTimeLine order={order} />

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-6 border border-app-border">
            <h3 className="text-sm font-semibold text-app-green mb-3 flex items-center gap-2">
              <MapPinIcon className="size-4" /> Delivery Address
            </h3>
            <p className="text-xs font-bold text-app-green">{order.shippingAddress?.label}</p>
            <p className="text-xs text-app-text-light mt-1">
              {order.shippingAddress?.address}
            </p>
            <p className="text-xs text-app-text-light">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
            </p>
          </div>

          {/* Order Summary breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-app-border">
            <h3 className="text-sm font-semibold text-app-green mb-4">Payment Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-app-text-light">
                <span>Subtotal</span>
                <span>{currency}{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-app-text-light">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `${currency}${order.deliveryFee?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-app-text-light">
                <span>Estimated Tax</span>
                <span>{currency}{order.tax?.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-app-border flex justify-between font-bold text-sm text-app-green">
                <span>Total</span>
                <span>{currency}{order.total?.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between text-xs text-app-text-light">
              <span>Payment Method</span>
              <span className="font-semibold capitalize text-app-green">
                {order.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
