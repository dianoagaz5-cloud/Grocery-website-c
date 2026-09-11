import { useState } from 'react';
import { XIcon } from 'lucide-react';

export default function Banner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-[#1b3022] text-white text-xs py-2.5 px-4 flex items-center justify-center gap-6 relative font-medium">
      <div className="flex items-center gap-2">
        <span className="text-sm">🚚</span>
        <span>Free delivery on orders above $20</span>
      </div>
      <span className="text-white/30 hidden sm:inline">|</span>
      <div className="hidden sm:flex items-center gap-2 text-[#fbbf24]">
        <span>⚡</span>
        <span className="text-white">Farm-fresh produce delivered daily</span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 transition-colors"
        aria-label="Close banner"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
