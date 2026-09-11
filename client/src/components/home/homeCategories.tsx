import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { categoriesData } from '../../assets/assets';

export default function HomeCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-app-green">Shop by Category</h2>
          <p className="text-sm text-zinc-500 mt-1">Browse our wide selection of fresh products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="size-9 rounded-xl border border-app-border flex-center hover:bg-app-cream transition-colors cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronLeftIcon className="size-5 text-zinc-500" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="size-9 rounded-xl border border-app-border flex-center hover:bg-app-cream transition-colors cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronRightIcon className="size-5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Carousel with padding so circles and border strokes are never cut off */}
      <div
        ref={scrollRef}
        className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-3 px-2 scroll-smooth"
      >
        {categoriesData.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 shrink-0"
          >
            <div className="size-20 sm:size-24 md:size-28 rounded-full overflow-hidden bg-app-cream border border-app-border group-hover:border-app-green group-hover:shadow-md transition-all duration-300 aspect-square flex-center p-1">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-700 text-center leading-tight group-hover:text-app-green transition-colors max-w-[100px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
