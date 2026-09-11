import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ShieldCheckIcon, TruckIcon, ArrowLeftIcon, PlusIcon, MinusIcon } from 'lucide-react';
import { dummyProducts } from '../assets/assets';
import { useCart } from '../context/cartContext';
import DummyReviewsSection from '../components/DummyReviewsSection';
import ProductCard from '../components/productCard';
import type { Product } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { items, addItem, updateQuantity } = useCart();
  const [qty, setQty] = useState<number>(1);

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

  const product = dummyProducts.find((p) => p._id === id || p.id === id) as Product | undefined;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-app-green mb-4">Product Not Found</h2>
        <p className="text-sm text-app-text-light mb-6">The product you are looking for does not exist.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors text-sm"
        >
          <ArrowLeftIcon className="size-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const cartItem = items.find((item) => item.product._id === product._id);
  const similarProducts = dummyProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4) as Product[];

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-app-text-light mb-6">
        <Link to="/" className="hover:text-app-green">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-app-green capitalize">
          {product.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-app-green font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-app-border mb-16 shadow-xs">
        {/* Product Image */}
        <div className="flex flex-col items-center justify-center p-6 bg-app-cream/50 rounded-2xl border border-app-border/40 relative">
          {product.isOrganic && (
            <span className="absolute top-4 left-4 bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Organic
            </span>
          )}
          {product.discount > 0 && (
            <span className="absolute top-4 right-4 bg-app-orange text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-sm h-auto max-h-[380px] object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-app-green-lighter">
                {product.category.replace('-', ' ')}
              </span>
              <span className="text-app-border">•</span>
              <span className="text-xs text-app-text-light">{product.unit}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-app-green mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                <StarIcon className="size-4 text-app-warning fill-app-warning" />
                <span className="text-xs font-bold text-amber-800">{product.rating}</span>
              </div>
              <span className="text-xs text-app-text-light">
                ({product.reviewCount} customer reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-app-green">
                {currency}{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-app-text-light/70 line-through">
                  {currency}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-sm text-app-text-light leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6 text-xs font-semibold">
              <span className={`inline-block size-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-app-border">
            {cartItem ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-app-border rounded-xl bg-app-cream p-1">
                  <button
                    onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
                    className="size-9 flex-center rounded-lg hover:bg-white text-app-green transition-colors"
                  >
                    <MinusIcon className="size-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-app-green">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                    className="size-9 flex-center rounded-lg hover:bg-white text-app-green transition-colors"
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>
                <span className="text-xs font-medium text-app-green">Item in cart</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-app-border rounded-xl bg-app-cream p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-9 flex-center rounded-lg hover:bg-white text-app-green transition-colors"
                  >
                    <MinusIcon className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-app-green">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="size-9 flex-center rounded-lg hover:bg-white text-app-green transition-colors"
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3 px-6 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  Add to Cart • {currency}{(product.price * qty).toFixed(2)}
                </button>
              </div>
            )}

            {/* Badges / Guarantees */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-app-border text-xs text-app-text-light">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-app-green" />
                <span>Fast Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-app-green" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <DummyReviewsSection product={product} />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold text-app-green mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
