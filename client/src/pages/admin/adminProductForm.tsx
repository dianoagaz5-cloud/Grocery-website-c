import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon, UploadCloudIcon, ImageIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";
import { categoriesData, dummyProducts } from "../../assets/assets";
import Loading from "../../components/loading";
import toast from "react-hot-toast";
import api from "../../config/api";
import { useImageUpload } from "../../hooks/useImageUpload";

export default function AdminProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>("");

    const { uploadImage, isUploading, progress, error: uploadError } = useImageUpload();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",          // Stores the final Cloudinary URL
        category: "",
        unit: "",
        stock: "",
        isOrganic: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (isEdit && id) {
                try {
                    const { data } = await api.get(`/api/products/${id}`);
                    if (data.success && data.product) {
                        const p = data.product;
                        setFormData({
                            name: p.name || "",
                            description: p.description || "",
                            price: String(p.price || ""),
                            originalPrice: String(p.originalPrice || ""),
                            image: p.image || "",
                            category: p.category || "",
                            unit: p.unit || "piece",
                            stock: String(p.stock || "0"),
                            isOrganic: Boolean(p.isOrganic),
                        });
                        setImagePreview(p.image || "");
                    } else {
                        setFormData(() => (dummyProducts.find((p) => p._id === id) as any) || {});
                    }
                } catch {
                    setFormData(() => (dummyProducts.find((p) => p._id === id) as any) || {});
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [id, isEdit]);

    // ── Image file selected → optimise + upload immediately ──────────────────
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview instantly while uploading
        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);

        try {
            const result = await uploadImage(file);
            // Replace local preview with the real Cloudinary URL
            setImagePreview(result.url);
            setFormData((prev) => ({ ...prev, image: result.url }));
            toast.success("Image uploaded successfully ✔");
        } catch (err: any) {
            toast.error(err?.message || "Image upload failed");
            setImagePreview(formData.image); // revert to previous
        } finally {
            // Reset input so same file can be re-selected if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
            URL.revokeObjectURL(localPreview);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) {
            toast.error("Please upload a product image first");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                originalPrice: parseFloat(formData.originalPrice) || 0,
                stock: parseInt(formData.stock, 10) || 0,
            };

            if (isEdit && id) {
                await api.put(`/api/products/${id}`, payload);
                toast.success("Product updated successfully");
            } else {
                await api.post("/api/products", payload);
                toast.success("Product created successfully");
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to save product";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center gap-4">
                    <Link to="/admin/products" className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors">
                        <ArrowLeftIcon className="size-5" />
                    </Link>
                    <h2 className="text-xl font-semibold text-zinc-900">{isEdit ? "Edit Product" : "New Product"}</h2>
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                                <input required type="text" value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                                <select required value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all bg-white">
                                    <option value="">Select a category</option>
                                    {categoriesData.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Price ($)</label>
                                <input required type="number" step="0.01" min="0" value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>

                            {/* Original Price */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Original Price ($) — Optional</label>
                                <input type="number" step="0.01" min="0" value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Unit</label>
                                <input required type="text" placeholder="e.g., kg, piece, liter" value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Stock</label>
                                <input required type="number" min="0" value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all" />
                            </div>

                            {/* ── Image Upload ─────────────────────────────────────────────────── */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Product Image</label>
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`
                                        relative flex items-center gap-5 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer
                                        ${isUploading ? "border-app-green bg-green-50 cursor-not-allowed" : "border-zinc-200 hover:border-app-green hover:bg-zinc-50"}
                                    `}
                                >
                                    {/* Preview thumbnail */}
                                    <div className="size-20 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-app-cream flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        ) : (
                                            <ImageIcon className="size-8 text-zinc-300" />
                                        )}
                                    </div>

                                    {/* Status text + progress bar */}
                                    <div className="flex-1 min-w-0">
                                        {isUploading ? (
                                            <>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Loader2Icon className="size-4 text-app-green animate-spin" />
                                                    <span className="text-sm font-medium text-app-green">Optimising & uploading… {progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-app-green rounded-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </>
                                        ) : formData.image ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircleIcon className="size-4 text-app-green" />
                                                <span className="text-sm font-medium text-app-green">Image uploaded</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UploadCloudIcon className="size-4 text-zinc-400" />
                                                    <span className="text-sm font-medium text-zinc-700">Click to upload image</span>
                                                </div>
                                                <p className="text-xs text-zinc-400">PNG, JPG, WebP — auto-optimised before upload (max 2000 px, ≥85% quality)</p>
                                            </>
                                        )}
                                        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                                    </div>
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                                <textarea required rows={4} value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all resize-none" />
                            </div>

                            {/* Organic */}
                            <div className="flex items-center gap-3">
                                <label htmlFor="isOrganic" className="text-sm font-medium text-zinc-700 cursor-pointer">Organic</label>
                                <input type="checkbox" id="isOrganic" checked={formData.isOrganic}
                                    onChange={e => setFormData({ ...formData, isOrganic: e.target.checked })}
                                    className="size-5 text-app-green rounded border-zinc-300 focus:ring-app-green cursor-pointer" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-app-border flex justify-end">
                            <button
                                disabled={saving || isUploading}
                                type="submit"
                                className="px-6 py-2.5 bg-app-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving…" : "Save Product"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
