import { assets, appPromoBannerData } from '../../assets/assets';
import { SmartphoneIcon, ArrowRightIcon } from 'lucide-react';

export default function AppPromoBanner() {
  return (
    <section className="my-14 mx-4 sm:mx-6 lg:mx-8 max-w-7xl xl:mx-auto rounded-3xl overflow-hidden">
      <div className="bg-app-green relative flex flex-col md:flex-row items-center gap-8 px-8 md:px-12 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 size-64 rounded-full bg-app-orange blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-white blur-3xl" />
        </div>

        {/* Text side */}
        <div className="relative flex-1 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-app-orange/20 text-app-orange text-xs font-semibold rounded-full mb-4">
            📱 Available Now
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight mb-3">
            {appPromoBannerData.title}
          </h2>
          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">
            {appPromoBannerData.description}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a href="#" className="flex items-center gap-2 px-5 py-2.5 bg-white text-app-green font-semibold rounded-xl text-sm hover:bg-app-cream transition-colors">
              <SmartphoneIcon className="size-4" /> App Store
            </a>
            <a href="#" className="flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">
              Google Play <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Truck image */}
        <div className="relative shrink-0">
          <img
            src={assets.delivery_truck}
            alt="Delivery truck"
            className="w-48 md:w-64 drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
