import { useEffect, useState } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import OtpModal from "../../components/delivery/otpModal";
import CancelModal from "../../components/delivery/cancelModal";
import DeliveryOrderCard from "../../components/delivery/deliveryOrderCard";
import Loading from "../../components/loading";
import type { Order } from "../../types";
import { dummyDashboardOrdersData } from "../../assets/assets";

import api from "../../config/api";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/delivery/deliveries');
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders(dummyDashboardOrdersData as any);
            }
        } catch {
            setOrders(dummyDashboardOrdersData as any);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [tab]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/api/delivery/deliveries/${orderId}/status`, { status });
            toast.success(`Order status updated to ${status}`);
            setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to update status';
            toast.error(msg);
            // Optimistic update fallback in case running offline
            setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await api.post(`/api/delivery/deliveries/${otpModal}/complete`, { otp });
            toast.success("Delivery confirmed with OTP!");
            setOrders((prev) => prev.map((o) => o._id === otpModal ? { ...o, status: 'Delivered', isPaid: true } : o));
            setOtpModal(null);
            setOtp("");
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Incorrect OTP code';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await api.put(`/api/delivery/deliveries/${cancelModal}/status`, {
                status: 'Cancelled',
                note: cancelReason || 'Cancelled by delivery partner',
            });
            toast.success("Order marked as cancelled");
            setOrders((prev) => prev.map((o) => o._id === cancelModal ? { ...o, status: 'Cancelled' } : o));
            setCancelModal(null);
            setCancelReason("");
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to cancel order';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={() => setTracking((prev) => !prev)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}>
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => <DeliveryOrderCard key={order._id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} />)}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
