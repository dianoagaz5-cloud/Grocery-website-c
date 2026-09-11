import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, StarIcon, LeafIcon } from 'lucide-react';
import { useCart } from '../context/cartContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product._id === product._id);
  const quantity = cartItem?.quantity ?? 0;
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';
  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-app-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Clickable Image to Product Detail Page */}
        <Link
          to={`/products/${product._id}`}
          className="block relative overflow-hidden bg-app-cream aspect-square cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isOrganic && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                <LeafIcon className="size-2.5" /> Organic
              </span>
            )}
            {discountPct > 0 && (
              <span className="px-2 py-0.5 bg-app-orange text-white text-[10px] font-bold rounded-full">
                -{discountPct}%
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="p-3.5 pb-2">
          {/* Title as Link to Product Detail Page */}
          <Link
            to={`/products/${product._id}`}
            className="block text-sm font-semibold text-app-green hover:text-app-orange line-clamp-2 mb-1.5 leading-snug cursor-pointer transition-colors"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <StarIcon className="size-3 text-app-warning fill-app-warning" />
            <span className="text-xs text-zinc-500 font-medium">{product.rating}</span>
            <span className="text-[11px] text-zinc-400">({product.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Price and Add / Quantity */}
      <div className="p-3.5 pt-0 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col min-w-0 shrink">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-base font-bold text-app-green leading-none">
              {currency}{product.price.toFixed(2)}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">/{product.unit}</span>
          </div>
          {product.originalPrice > product.price && (
            <span className="text-xs text-zinc-400 line-through mt-0.5">
              {currency}{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add button / Quantity controls */}
        <div className="shrink-0">
          {product.stock === 0 ? (
            <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg">
              Sold out
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="size-8.5 rounded-full bg-app-orange hover:bg-app-orange-dark text-white flex-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={`Add ${product.name} to cart`}
            >
              <PlusIcon className="size-4.5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#1b3022] text-white rounded-full px-2 py-1 shadow-xs">
              <button
                onClick={() => updateQuantity(product._id, quantity - 1)}
                className="size-5 flex-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="size-3" />
              </button>
              <span className="text-xs font-bold px-1 min-w-3.5 text-center">{quantity}</span>
              <button
                onClick={() => updateQuantity(product._id, quantity + 1)}
                className="size-5 flex-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <PlusIcon className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
