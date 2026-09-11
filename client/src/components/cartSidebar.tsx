import { XIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/cartContext';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, getSubtotal, getDeliveryFee, getTax, getTotal } = useCart();
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5 text-app-green" />
            <h2 className="text-lg font-semibold text-app-green">Your Cart</h2>
            {items.length > 0 && (
              <span className="px-2 py-0.5 bg-app-green text-white text-xs font-bold rounded-full">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-app-cream rounded-xl transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex-center flex-col py-20 gap-4">
              <ShoppingBagIcon className="size-16 text-app-border" />
              <p className="text-zinc-500 font-medium">Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-app-green text-white rounded-xl font-semibold text-sm hover:bg-app-green-light transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product._id} className="flex gap-3 p-3 rounded-xl bg-app-cream/50 border border-app-border/60">
                <img src={item.product.image} alt={item.product.name} className="size-16 rounded-lg object-contain bg-white p-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-app-green line-clamp-2 leading-snug">{item.product.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.product.unit}</p>
                  <p className="text-sm font-bold text-app-green mt-1">{currency}{item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.product._id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="size-4" />
                  </button>
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-app-border">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 hover:bg-app-cream transition-colors rounded-l-lg">
                      <MinusIcon className="size-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 hover:bg-app-cream transition-colors rounded-r-lg">
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-app-border p-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{currency}{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span>{getDeliveryFee() === 0 ? <span className="text-app-success font-medium">Free</span> : `${currency}${getDeliveryFee().toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax (8%)</span>
                <span>{currency}{getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-app-green text-base border-t border-app-border pt-2 mt-1">
                <span>Total</span>
                <span>{currency}{getTotal().toFixed(2)}</span>
              </div>
            </div>
            {getSubtotal() < 20 && (
              <p className="text-xs text-zinc-500 text-center">
                Add {currency}{(20 - getSubtotal()).toFixed(2)} more for free delivery
              </p>
            )}
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-3 bg-app-orange text-white font-bold text-center rounded-xl hover:bg-app-orange-dark transition-colors active:scale-[0.98]"
            >
              Checkout — {currency}{getTotal().toFixed(2)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
