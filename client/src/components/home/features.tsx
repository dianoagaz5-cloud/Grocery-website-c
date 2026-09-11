import { TruckIcon, LeafIcon, ClockIcon, ShieldCheckIcon } from 'lucide-react';

const features = [
  {
    icon: TruckIcon,
    title: 'Free Delivery',
    desc: 'Orders over $20',
  },
  {
    icon: LeafIcon,
    title: '100% Organic',
    desc: 'Certified products',
  },
  {
    icon: ClockIcon,
    title: 'Same Day',
    desc: 'Express delivery',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Pay',
    desc: 'Safe checkout',
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 mb-8 relative z-10">
      {/* Unified white rounded card containing all 4 items without separate card borders */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-app-border/80 shadow-sm px-6 py-6 sm:py-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 sm:gap-4">
              <div className="size-11 sm:size-12 rounded-2xl bg-app-cream flex-center shrink-0 border border-app-border/40">
                <f.icon className="size-5 sm:size-5.5 text-app-green" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-app-green tracking-tight leading-snug">
                  {f.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-app-text-light truncate mt-0.5">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
