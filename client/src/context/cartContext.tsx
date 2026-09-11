import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveToStorage = (newItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      saveToStorage(updated);
      return updated;
    });

    // Notify once outside of the state updater (prevents StrictMode double firing)
    toast.success('Added to cart', { id: `cart-${product._id}`, duration: 1200 });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product._id !== productId);
      saveToStorage(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getSubtotal = () => items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const getDeliveryFee = () => getSubtotal() >= 20 ? 0 : 2.99;
  const getTax = () => getSubtotal() * 0.08;
  const getTotal = () => getSubtotal() + getDeliveryFee() + getTax();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isCartOpen, setIsCartOpen,
      addItem, removeItem, updateQuantity, clearCart,
      getTotal, getSubtotal, getTax, getDeliveryFee, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
