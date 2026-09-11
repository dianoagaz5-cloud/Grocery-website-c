import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon } from 'lucide-react';
import { dummyProducts } from '../assets/assets';
import ProductCard from '../components/productCard';
import type { Product } from '../types';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return (dummyProducts as Product[]).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-app-text-light mb-2">
          <Link to="/" className="hover:text-app-green">Home</Link>
          <span>/</span>
          <span>Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-app-green">
          {query ? `Search results for "${query}"` : 'Search Products'}
        </h1>
        <p className="text-xs text-app-text-light mt-1">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-app-border p-12 text-center max-w-xl mx-auto">
          <div className="size-16 rounded-full bg-app-cream flex-center mx-auto mb-4 text-app-green">
            <SearchIcon className="size-7" />
          </div>
          <h2 className="text-lg font-semibold text-app-green mb-2">No matching products found</h2>
          <p className="text-xs text-app-text-light mb-6">
            We couldn't find anything matching &quot;{query}&quot;. Try checking for typos or searching with broader keywords.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors"
          >
            Browse All Products <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
