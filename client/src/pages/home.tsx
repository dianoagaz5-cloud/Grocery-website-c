import Hero from '../components/home/hero';
import Features from '../components/home/features';
import HomeCategories from '../components/home/homeCategories';
import PopularProducts from '../components/home/popularProducts';
import AppPromoBanner from '../components/home/appPromoBanner';
import Newsletter from '../components/home/newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HomeCategories />
      <PopularProducts />
      <AppPromoBanner />
      <Newsletter />
    </>
  );
}
