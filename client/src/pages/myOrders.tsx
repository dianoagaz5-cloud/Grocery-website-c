import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageIcon, ChevronRightIcon, ClockIcon } from 'lucide-react';
import { dummyDashboardOrdersData, statusColors } from '../assets/assets';
import type { Order } from '../types';

import api from '../config/api';

type FilterTab = 'all' | 'placed' | 'out_for_delivery' | 'delivered';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    const fetchUserOrders = async () => {
      let serverOrders: Order[] = [];
      try {
        const { data } = await api.get('/api/orders/my-orders');
        if (data.success && Array.isArray(data.orders)) {
          serverOrders = data.orders;
        }
      } catch {
        // user not authenticated or network error
      }

      const localOrdersJson = localStorage.getItem('instamart_orders');
      const localOrders: Order[] = localOrdersJson ? JSON.parse(localOrdersJson) : [];
      
      const combined = [...serverOrders, ...localOrders, ...(dummyDashboardOrdersData as unknown as Order[])];
      
      const seen = new Set<string>();
      const unique = combined.filter((order) => {
        if (seen.has(order._id)) return false;
        seen.add(order._id);
        return true;
      });

      setOrders(unique);
    };

    fetchUserOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'placed') return order.status === 'Order Placed';
    if (activeTab === 'out_for_delivery') return order.status === 'Out for Delivery';
    if (activeTab === 'delivered') return order.status === 'Delivered';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-app-green">My Orders</h1>
        <p className="text-xs text-app-text-light mt-1">
          Track and manage your recent grocery orders
        </p>
      </div>

      {/* Tabs Filter matching Figma image.png */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#1b3022] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('placed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'placed'
              ? 'bg-[#1b3022] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
          }`}
        >
          Placed ({orders.filter((o) => o.status === 'Order Placed').length})
        </button>
        <button
          onClick={() => setActiveTab('out_for_delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'out_for_delivery'
              ? 'bg-[#1b3022] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
          }`}
        >
          Out for Delivery ({orders.filter((o) => o.status === 'Out for Delivery').length})
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'delivered'
              ? 'bg-[#1b3022] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'Delivered').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-app-border p-12 text-center">
          <div className="size-16 rounded-full bg-app-cream flex-center mx-auto mb-4 text-app-green">
            <PackageIcon className="size-8" />
          </div>
          <h2 className="text-lg font-semibold text-app-green mb-2">No orders found</h2>
          <p className="text-xs text-app-text-light mb-6">
            There are no orders in this status category.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors cursor-pointer"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusClass = statusColors[order.status] || 'bg-zinc-100 text-zinc-700';

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-app-border p-5 sm:p-6 hover:shadow-md transition-all shadow-xs"
              >
                {/* Top bar: Order ID, Date, Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-app-border">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-app-green">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                      <ClockIcon className="size-3 text-zinc-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-app-green">
                      {currency}{order.total?.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </p>
                  </div>
                </div>

                {/* Bottom section: Thumbnail Images + Action link */}
                <div className="pt-4 flex items-center justify-between gap-4">
                  {/* Item Image thumbnails */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="size-12 rounded-xl bg-app-cream p-1 border border-app-border flex-center shrink-0"
                        title={`${item.name} (${item.quantity})`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg shrink-0">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Track order CTA */}
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Track Order</span>
                    <ChevronRightIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
