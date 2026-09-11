import { useState, useEffect, useMemo } from 'react';
import { ZapIcon, ClockIcon } from 'lucide-react';
import { dummyProducts, categoriesData } from '../assets/assets';
import ProductCard from '../components/productCard';
import type { Product } from '../types';

export default function FlashDeals() {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = useMemo(() => {
    let deals = (dummyProducts as Product[]).filter(
      (p) => p.discount > 0 || p.originalPrice > p.price
    );
    if (selectedCat !== 'all') {
      deals = deals.filter((p) => p.category === selectedCat);
    }
    return deals;
  }, [selectedCat]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Figma Flash Deals Banner: matching image copy 4.png */}
      <div className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl p-8 sm:p-12 text-white shadow-lg mb-10 text-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mb-3 flex items-center gap-3 justify-center">
            <span>⚡</span> Flash Deals <span>⚡</span>
          </h1>
          <p className="text-white/95 text-sm sm:text-base font-medium mb-6 max-w-lg">
            Limited-time discounts on fresh produce, daily essentials, and pantry favorites!
          </p>

          {/* Countdown Clock */}
          <div className="inline-flex items-center gap-2.5 bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
            <ClockIcon className="size-4.5 text-white/90" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Ends in:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm sm:text-base">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCat === 'all'
              ? 'bg-[#1b3022] text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
          }`}
        >
          All Deals ({dummyProducts.filter((p) => p.discount > 0 || p.originalPrice > p.price).length})
        </button>
        {categoriesData.map((cat) => {
          const count = dummyProducts.filter(
            (p) => p.category === cat.slug && (p.discount > 0 || p.originalPrice > p.price)
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCat(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat.slug
                  ? 'bg-[#1b3022] text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-app-border hover:bg-app-cream'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Deals Grid */}
      {dealProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-app-border">
          <ZapIcon className="size-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-base font-bold text-app-green mb-1">No flash deals in this category right now.</p>
          <p className="text-xs text-app-text-light mb-4">Check back soon or explore all our active promotions.</p>
          <button
            onClick={() => setSelectedCat('all')}
            className="px-5 py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors cursor-pointer"
          >
            Show All Deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {dealProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
