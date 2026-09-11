import { useState } from 'react';
import { MapPinIcon, EditIcon, TrashIcon, CheckIcon } from 'lucide-react';
import type { Address } from '../types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(address._id);
    setDeleting(false);
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${address.isDefault ? 'border-app-green bg-app-green/5' : 'border-app-border bg-white hover:border-app-green/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-app-green/10 flex-center shrink-0 mt-0.5">
            <MapPinIcon className="size-4 text-app-green" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm text-zinc-900">{address.label}</span>
              {address.isDefault && (
                <span className="text-[10px] font-semibold text-app-orange bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-600">{address.address}</p>
            <p className="text-xs text-zinc-500">{address.city}, {address.state} {address.zip}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              title="Set as default"
              className="p-2 text-zinc-400 hover:text-app-green hover:bg-app-cream rounded-lg transition-colors"
            >
              <CheckIcon className="size-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(address)}
            className="p-2 text-zinc-400 hover:text-app-orange hover:bg-orange-50 rounded-lg transition-colors"
          >
            <EditIcon className="size-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
