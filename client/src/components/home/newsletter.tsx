import { useState } from 'react';
import { MailIcon, ArrowRightIcon, CheckCircleIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("You're subscribed! 🎉");
  };

  return (
    <section className="py-16 bg-app-cream-dark">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="size-14 rounded-2xl bg-app-green flex-center mx-auto mb-5">
          <MailIcon className="size-7 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-app-green mb-2">
          Stay Fresh with Our Newsletter
        </h2>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Get weekly deals, new arrivals, and seasonal recipes delivered straight to your inbox. No spam, ever.
        </p>

        {subscribed ? (
          <div className="flex-center gap-2 text-app-success font-semibold">
            <CheckCircleIcon className="size-5" />
            Thanks for subscribing! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-app-border bg-white focus:border-app-green text-sm outline-none transition-colors"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors text-sm shrink-0"
            >
              Subscribe <ArrowRightIcon className="size-4" />
            </button>
          </form>
        )}

        <p className="text-xs text-zinc-400 mt-4">
          By subscribing you agree to our privacy policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
