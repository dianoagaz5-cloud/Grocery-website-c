import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { heroSectionData } from '../../assets/assets';

export default function Hero() {
  return (
    <section className="relative min-h-[540px] md:min-h-[480px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroSectionData.hero_image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-app-green via-app-green/65 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-app-orange/20 border border-app-orange/30 rounded-full text-app-orange text-xs font-semibold mb-4 animate-fade-in">
            🌿 Farm to Doorstep
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Fresh Groceries<br />
            <span className="font-serif italic text-app-orange">Delivered Fast</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {heroSectionData.description}
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-all active:scale-95 shadow-lg"
            >
              Shop Now <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              to="/deals"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Flash Deals ⚡
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
