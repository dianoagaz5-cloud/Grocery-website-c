import { useState, useEffect } from 'react';
import { MapPinIcon, LocateIcon } from 'lucide-react';
import type { Address } from '../types';

interface AddressFormProps {
  initial?: Partial<Address> | null;
  onSubmit: (data: Omit<Address, '_id' | 'isDefault'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EMPTY: Omit<Address, '_id' | 'isDefault'> = {
  label: '', address: '', city: '', state: '', zip: '', lat: 0, lng: 0,
};

export default function AddressForm({ initial, onSubmit, onCancel, loading }: AddressFormProps) {
  const [form, setForm] = useState({ ...EMPTY });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initial) setForm({ label: initial.label ?? '', address: initial.address ?? '', city: initial.city ?? '', state: initial.state ?? '', zip: initial.zip ?? '', lat: initial.lat ?? 0, lng: initial.lng ?? 0 });
    else setForm({ ...EMPTY });
  }, [initial]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Label</label>
        <input
          required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Home, Work, etc."
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Street Address</label>
        <input
          required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="123 Main St"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">City</label>
          <input
            required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="New York"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">State</label>
          <input
            required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="NY"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">ZIP Code</label>
        <input
          required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })}
          placeholder="10001"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
        />
      </div>

      {/* GPS */}
      <button
        type="button" onClick={handleGPS} disabled={locating}
        className="flex items-center gap-2 text-sm text-app-green hover:text-app-green-light font-medium transition-colors disabled:opacity-60"
      >
        <LocateIcon className={`size-4 ${locating ? 'animate-spin' : ''}`} />
        {locating ? 'Detecting location...' : 'Auto-detect GPS location'}
      </button>
      {form.lat !== 0 && (
        <p className="text-xs text-app-success flex items-center gap-1">
          <MapPinIcon className="size-3" /> GPS detected: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-app-green rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
