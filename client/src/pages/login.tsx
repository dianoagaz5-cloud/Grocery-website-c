import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BikeIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-react';
import { useAuth } from '../context/oContext';
import { assets } from '../assets/assets';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      import('react-hot-toast').then(({ default: toast }) => toast.error(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Back to Home Button in the top-left corner */}
      <Link
        to="/"
        className="absolute top-5 left-5 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 lg:bg-[#1b3022]/80 backdrop-blur-md text-app-green lg:text-white text-xs font-semibold hover:bg-white lg:hover:bg-[#1b3022] shadow-sm border border-app-border/40 transition-all"
        title="Return to Home"
      >
        <ArrowLeftIcon className="size-4" />
        <span>Back to Home</span>
      </Link>

      {/* Left panel: Dark Forest Green with food background and elegant typography (image copy.png) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b3022] relative items-center justify-center overflow-hidden p-12 min-h-screen">
        <img
          src={assets.hero_bg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10 max-w-md text-left text-white">
          <div className="flex items-center gap-2 mb-8">
            <BikeIcon className="size-7 text-app-orange" />
            <span className="text-2xl font-bold tracking-tight">InstantMart</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Fresh groceries,<br />
            <span className="italic text-app-orange">delivered to your door.</span>
          </h2>
          <p className="text-white/80 text-sm xl:text-base leading-relaxed">
            Order farm-fresh vegetables, organic dairy, pantry essentials and more with ultra-fast 10-minute delivery.
          </p>
        </div>
      </div>

      {/* Right form panel: Clean white container */}
      <div className="flex-1 flex-center px-4 py-16 sm:px-8 bg-app-cream min-h-screen">
        <div className="w-full max-w-md animate-fade-in my-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex-center gap-2 mb-3">
              <BikeIcon className="size-7 text-app-green" />
              <span className="text-2xl font-bold text-app-green">InstantMart</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-app-green">
              {mode === 'login' ? 'Welcome back to InstantMart' : 'Create your account'}
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5">
              {mode === 'login'
                ? 'Sign in to access your orders and saved addresses'
                : 'Sign up in seconds to start shopping fresh groceries'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-zinc-200/70 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-app-green shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-app-green shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-app-border"
          >
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green text-xs outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green text-xs outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-app-border focus:border-app-green text-xs outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPass ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60 text-xs shadow-xs cursor-pointer active:scale-[0.99] mt-2"
            >
              {loading
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500">
              Are you a delivery partner?{' '}
              <Link to="/delivery/login" className="text-app-green font-semibold hover:underline">
                Partner Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
