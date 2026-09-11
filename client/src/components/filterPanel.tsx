import { useState } from 'react';
import { SlidersHorizontalIcon, XIcon, CheckIcon } from 'lucide-react';
import { categoriesData } from '../assets/assets';

interface FilterPanelProps {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

export default function FilterPanel({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onReset,
}: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>(String(priceRange[0]));
  const [maxPrice, setMaxPrice] = useState<string>(String(priceRange[1]));

  const applyPrice = (minStr: string, maxStr: string) => {
    const min = Math.max(0, Number(minStr) || 0);
    const max = Math.max(min, Number(maxStr) || 100);
    onPriceRangeChange([min, max]);
  };

  const content = (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-app-border">
        <h2 className="font-serif font-bold text-base text-app-green flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-app-green" /> Filters
        </h2>
        <button
          onClick={() => {
            setMinPrice('0');
            setMaxPrice('100');
            onReset();
          }}
          className="text-xs text-app-orange hover:text-app-orange-dark font-medium transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Categories List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-app-green mb-3.5">
          Categories
        </h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              selectedCategory === ''
                ? 'bg-[#1b3022] text-white shadow-xs'
                : 'text-zinc-600 hover:bg-app-cream hover:text-app-green'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === '' && <CheckIcon className="size-3.5" />}
          </button>

          {categoriesData.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1b3022] text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-app-cream hover:text-app-green'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <CheckIcon className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-2 border-t border-app-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-app-green mb-3.5">
          Price Range ($)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] text-zinc-500 font-medium block mb-1">Min ($)</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                applyPrice(e.target.value, maxPrice);
              }}
              placeholder="0"
              className="w-full px-3 py-2 text-xs rounded-xl border border-app-border bg-white text-zinc-800 focus:outline-none focus:border-app-green transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-medium block mb-1">Max ($)</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                applyPrice(minPrice, e.target.value);
              }}
              placeholder="100"
              className="w-full px-3 py-2 text-xs rounded-xl border border-app-border bg-white text-zinc-800 focus:outline-none focus:border-app-green transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-app-border rounded-xl text-xs font-semibold text-app-green shadow-xs mb-4 cursor-pointer"
      >
        <SlidersHorizontalIcon className="size-4" /> Filter Catalog
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-app-border">
                <span className="font-serif font-bold text-base text-app-green">Filter Products</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              {content}
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Desktop filter */}
      <div className="hidden lg:block bg-white p-5 rounded-2xl border border-app-border shadow-xs">
        {content}
      </div>
    </>
  );
}
