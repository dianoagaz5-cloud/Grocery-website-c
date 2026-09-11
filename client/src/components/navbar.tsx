import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon, SearchIcon, ChevronDownIcon,
  PackageIcon, MapPinIcon, ShieldIcon, LogOutIcon, BikeIcon,
} from 'lucide-react';
import { useAuth } from '../context/oContext';
import { useCart } from '../context/cartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <nav className="bg-white border-b border-app-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BikeIcon className="size-6 text-app-green" />
          <span className="text-xl font-bold text-app-green tracking-tight font-sans">InstantMart</span>
        </Link>

        {/* Center navigation & search */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl mx-auto justify-center">
          {/* Nav links (Home, Products, Deals) */}
          <div className="hidden md:flex items-center gap-6 shrink-0 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-app-green font-semibold' : 'text-zinc-600 hover:text-app-green'}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-app-green font-semibold' : 'text-zinc-600 hover:text-app-green'}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/deals"
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-app-orange font-semibold' : 'text-app-orange hover:text-app-orange-dark'}`
              }
            >
              Deals
            </NavLink>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for groceries..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-orange-100 bg-[#fffaf5] text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-app-green/30 transition-all"
            />
          </form>
        </div>

        {/* Right actions: Cart & User */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Cart Icon with badge */}
          <button
            id="cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-zinc-800 hover:text-app-green transition-colors cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingCartIcon className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4.5 rounded-full bg-app-orange text-white text-[10px] font-bold flex-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* User profile avatar / Login */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 cursor-pointer focus:outline-none"
              >
                <div className="size-8 rounded-full bg-[#1b3022] flex-center text-white text-xs font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDownIcon className={`size-3.5 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-app-border py-2 animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-app-border mb-1">
                    <p className="text-xs font-semibold text-app-green truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/orders" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                    <PackageIcon className="size-4" /> My Orders
                  </Link>
                  <Link to="/addresses" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                    <MapPinIcon className="size-4" /> Addresses
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <ShieldIcon className="size-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-app-border my-1" />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                    className="dropdown-link w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50/80 cursor-pointer"
                  >
                    <LogOutIcon className="size-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
