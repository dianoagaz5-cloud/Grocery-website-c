import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dummyProducts } from '../assets/assets';
import ProductCard from '../components/productCard';
import FilterPanel from '../components/filterPanel';
import type { Product } from '../types';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    if (sort && sort !== 'featured') {
      searchParams.set('sort', sort);
    } else {
      searchParams.delete('sort');
    }
    setSearchParams(searchParams);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSortBy('featured');
    setPriceRange([0, 1000]);
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let result = [...dummyProducts] as Product[];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, sortBy, priceRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-app-text-light mb-6">
        <Link to="/" className="hover:text-app-green">Home</Link>
        <span>/</span>
        <span className="text-app-green font-medium">Products</span>
      </nav>

      {/* Top Banner / Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-app-green font-bold">
            {selectedCategory ? selectedCategory.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'All Products'}
          </h1>
          <p className="text-xs text-app-text-light mt-1">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs text-zinc-500 font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-app-border bg-white text-zinc-800 focus:outline-none focus:border-app-green cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterPanel
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onReset={handleReset}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-app-border">
              <p className="text-base text-app-green font-bold mb-2">No products found</p>
              <p className="text-xs text-app-text-light mb-6">Try adjusting your filters or price range.</p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
