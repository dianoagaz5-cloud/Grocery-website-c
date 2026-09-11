import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PlusIcon, MapPinIcon, XIcon, ChevronLeftIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { dummyAddressData } from '../assets/assets';
import AddressCard from '../components/addressCard';
import AddressForm from '../components/addressForm';
import type { Address } from '../types';

export default function Addresses() {
  const location = useLocation();
  const fromCheckout = (location.state as any)?.from === 'checkout';

  const [addresses, setAddresses] = useState<Address[]>([]); 
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('instamart_user_addresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch {
        setAddresses(dummyAddressData);
      }
    } else {
      setAddresses(dummyAddressData);
      localStorage.setItem('instamart_user_addresses', JSON.stringify(dummyAddressData));
    }
  }, []);

  const saveAddresses = (newAddrs: Address[]) => {
    setAddresses(newAddrs);
    localStorage.setItem('instamart_user_addresses', JSON.stringify(newAddrs));
  };

  const handleCreateOrUpdate = async (data: Omit<Address, '_id' | 'isDefault'>) => {
    if (editingAddress) {
      const updated = addresses.map((a) =>
        a._id === editingAddress._id ? { ...a, ...data } : a
      );
      saveAddresses(updated);
      toast.success('Address updated successfully');
    } else {
      const newAddr: Address = {
        _id: 'addr_' + Date.now(),
        ...data,
        isDefault: addresses.length === 0,
      };
      saveAddresses([...addresses, newAddr]);
      toast.success('New address added');
    }
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a._id !== id);
    saveAddresses(updated);
    toast.success('Address removed');
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a._id === id,
    }));
    saveAddresses(updated);
    toast.success('Default delivery address updated');
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Breadcrumb back to Checkout */}
        {fromCheckout && (
          <Link
            to="/checkout"
            className="inline-flex items-center gap-1.5 text-xs text-app-text-light hover:text-app-green transition-colors mb-6"
          >
            <ChevronLeftIcon className="size-4" /> Back to Checkout
          </Link>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-app-green">Saved Addresses</h1>
            <p className="text-xs text-app-text-light mt-1">
              Manage your delivery locations for faster checkout
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddress(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light transition-colors shadow-xs cursor-pointer"
          >
            <PlusIcon className="size-4" /> Add New Address
          </button>
        </div>

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-app-border p-12 text-center">
            <div className="size-16 rounded-full bg-app-cream flex-center mx-auto mb-4 text-app-green">
              <MapPinIcon className="size-8" />
            </div>
            <h2 className="text-lg font-semibold text-app-green mb-2">No addresses saved</h2>
            <p className="text-xs text-app-text-light mb-6">
              Add your delivery address to get fresh groceries delivered straight to your door.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-green text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              <PlusIcon className="size-4" /> Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-screen clean centered modal with uniform backdrop blur & no clipping */}
      {isFormOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Full-screen backdrop: homogeneous dark blur covering 100% of viewport */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => {
              setIsFormOpen(false);
              setEditingAddress(null);
            }}
          />

          {/* Centered Modal Content */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-app-border z-10 my-auto">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-app-border">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-app-green">
                {editingAddress ? 'Edit Address' : 'Add Delivery Address'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingAddress(null);
                }}
                className="size-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex-center text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <AddressForm
              initial={editingAddress}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAddress(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
