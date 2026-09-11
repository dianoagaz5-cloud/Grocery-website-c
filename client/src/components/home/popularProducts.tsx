import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { dummyProducts } from '../../assets/assets';
import ProductCard from '../productCard';

export default function PopularProducts() {
  const products = dummyProducts.slice(0, 10);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-app-green">Popular Products</h2>
          <p className="text-sm text-zinc-500 mt-1">Our customers' most loved items</p>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1.5 text-sm font-semibold text-app-orange hover:text-app-orange-dark transition-colors"
        >
          View All <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
