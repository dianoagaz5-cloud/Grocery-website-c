import { Link } from 'react-router-dom';
import { LeafIcon } from 'lucide-react';
import { footerData } from '../assets/assets';

export default function Footer() {
  return (
    <footer className="bg-app-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <LeafIcon className="size-6 text-app-orange" />
              <span className="text-xl font-semibold">{footerData.brand.name}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              {footerData.brand.description}
            </p>
            <div className="flex items-center gap-3">
              {footerData.brand.socials.map((s, i) => (
                <a
                  key={i}
                  href={s.link}
                  className="size-9 rounded-xl bg-white/10 flex-center hover:bg-app-orange transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {footerData.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link && link.to ? (
                      <Link to={link.to} className="text-sm text-white/60 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={'href' in link ? link.href : '#'} className="text-sm text-white/60 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Contact</h3>
            <ul className="space-y-2.5">
              {footerData.contact.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                  <item.icon className="size-4 shrink-0 mt-0.5 text-app-orange" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/50">{footerData.bottom.copyright}</p>
          <div className="flex items-center gap-4">
            {footerData.bottom.links.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
