import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBagIcon, CheckIcon, MapPinIcon, CreditCardIcon } from 'lucide-react';
import { useCart } from '../context/cartContext';
import { useAuth } from '../context/oContext';
import { dummyAddressData } from '../assets/assets';
import CheckoutAddress from '../components/checkout/checkoutAddress';
import CheckoutPayment from '../components/checkout/checkoutPayment';
import CheckoutReview from '../components/checkout/checkoutReview';
import type { Address, Order } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getTotal } = useCart();
  const { user } = useAuth();

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

  // Load addresses from localStorage so they stay in sync with the Addresses page
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('instamart_user_addresses');
    if (raw) {
      try {
        setSavedAddresses(JSON.parse(raw));
      } catch {
        setSavedAddresses(dummyAddressData);
      }
    } else {
      setSavedAddresses(user?.addresses || dummyAddressData);
    }
  }, [user]);

  // Pick the default address (isDefault flag), falling back to first
  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || dummyAddressData[0];

  const [step, setStep] = useState<string>('address');
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync selected address when savedAddresses resolve
  useEffect(() => {
    if (savedAddresses.length > 0 && !address) {
      setAddress(savedAddresses.find((a) => a.isDefault) || savedAddresses[0]);
    }
  }, [savedAddresses]);

  const resolvedAddress: Address = address || defaultAddress;

  const subtotal = useMemo(() => getTotal(), [items, getTotal]);
  const deliveryFee = subtotal > 20 || subtotal === 0 ? 0 : 3.99;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="size-16 rounded-full bg-app-cream flex-center mx-auto mb-4 text-app-green">
          <ShoppingBagIcon className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-app-green mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-app-text-light mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-app-green text-white text-xs font-semibold rounded-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setLoading(true);

    setTimeout(() => {
      const newOrderId = 'ord_' + Math.random().toString(36).substring(2, 9);
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const newOrder: Order = {
        _id: newOrderId,
        user: user ? user._id : 'guest_user',
        items: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit,
        })),
        shippingAddress: {
          label: resolvedAddress.label,
          address: resolvedAddress.address,
          city: resolvedAddress.city,
          state: resolvedAddress.state,
          zip: resolvedAddress.zip,
          lat: resolvedAddress.lat || 40.7128,
          lng: resolvedAddress.lng || -74.006,
        },
        paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: 'Assigned',
        statusHistory: [
          { status: 'Placed', timestamp: new Date().toISOString(), note: 'Order placed successfully' },
          { status: 'Assigned', timestamp: new Date().toISOString(), note: 'Delivery partner assigned' },
        ],
        deliveryPartner: {
          _id: 'part_rahul',
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+1 555 0192',
          avatar: '',
          vehicleType: 'bike',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        deliveryOtp: randomOtp,
        isPaid: paymentMethod === 'card',
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingJson = localStorage.getItem('instamart_orders');
      const existing: Order[] = existingJson ? JSON.parse(existingJson) : [];
      localStorage.setItem('instamart_orders', JSON.stringify([newOrder, ...existing]));

      clearCart();
      setLoading(false);
      toast.success('Order placed successfully!');
      navigate(`/orders/${newOrderId}`);
    }, 1200);
  };

  const steps = [
    { key: 'address', label: 'Address', icon: MapPinIcon },
    { key: 'payment', label: 'Payment', icon: CreditCardIcon },
    { key: 'review', label: 'Review', icon: CheckIcon },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Checkout Stepper */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-app-border -z-1" />
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={s.key} className="flex flex-col items-center bg-app-cream px-3">
                <button
                  onClick={() => idx < currentStepIdx && setStep(s.key)}
                  disabled={idx > currentStepIdx}
                  className={`size-10 rounded-full flex-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-app-green text-white cursor-pointer'
                      : isCurrent
                      ? 'bg-app-green text-white ring-4 ring-app-green/20'
                      : 'bg-white border border-app-border text-app-text-light'
                  }`}
                >
                  <Icon className="size-4" />
                </button>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isCurrent || isDone ? 'text-app-green font-semibold' : 'text-app-text-light'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step Component */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <CheckoutAddress
              user={{ addresses: savedAddresses.length > 0 ? savedAddresses : (user?.addresses || dummyAddressData) }}
              address={resolvedAddress}
              setAddress={setAddress}
              setStep={setStep}
            />
          )}

          {step === 'payment' && (
            <CheckoutPayment
              setStep={setStep}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          )}

          {step === 'review' && (
            <CheckoutReview
              address={resolvedAddress}
              items={items}
              handlePlaceOrder={handlePlaceOrder}
              loading={loading}
              total={total}
              setStep={setStep}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-app-border shadow-xs">
          <h2 className="text-base font-semibold text-app-green mb-4">Order Summary</h2>

          <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="size-11 rounded-lg object-cover border border-app-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-app-green truncate">{item.product.name}</p>
                  <p className="text-[11px] text-app-text-light">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-app-green">
                  {currency}{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-app-border text-xs">
            <div className="flex justify-between text-app-text-light">
              <span>Subtotal</span>
              <span>{currency}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-app-text-light">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : `${currency}${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-app-text-light">
              <span>Estimated Tax (8%)</span>
              <span>{currency}{tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-app-border flex justify-between text-sm font-bold text-app-green">
              <span>Total Amount</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
