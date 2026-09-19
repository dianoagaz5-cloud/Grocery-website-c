import { useState, useMemo, useEffect } from "react";
import type { Product } from "../types";
import { StarIcon, ThumbsUpIcon, MessageSquarePlusIcon, CheckCircle2Icon } from "lucide-react";
import { useAuth } from "../context/oContext";
import toast from "react-hot-toast";

interface ReviewItem {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
    userLiked?: boolean;
}

const INITIAL_REVIEWERS = [
    { name: "Sneha T.", avatar: "ST" },
    { name: "Rahul M.", avatar: "RM" },
    { name: "Karan P.", avatar: "KP" },
    { name: "Sneha T.", avatar: "ST" },
    { name: "Ananya S.", avatar: "AS" },
    { name: "Sneha T.", avatar: "ST" },
];

const INITIAL_COMMENTS = [
    "Quality is decent but I expected it to be a bit fresher. Still a solid buy overall.",
    "Exceeded my expectations. The taste and freshness were top-notch. Five stars!",
    "Good value for the price. Packaging was neat and delivery was on time.",
    "Good value for the price. Packaging was neat and delivery was on time.",
    "Absolutely love this product! Fresh and great quality. Will definitely order again.",
    "Exceeded my expectations. The taste and freshness were top-notch. Five stars!",
];

export interface ReviewsSectionProps {
    product: Product;
    onRatingUpdate?: (newAvgRating: number, newTotalReviews: number) => void;
}

export default function ReviewsSection({ product, onRatingUpdate }: ReviewsSectionProps) {
    const { user } = useAuth();

    // Storage key unique per product
    const storageKey = `reviews_prod_${product._id}`;

    // Load persisted reviews or seed initial list
    const [reviews, setReviews] = useState<ReviewItem[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }

        // Generate baseline reviews matching mockup
        const dates = ["16 Sept 2026", "12 Sept 2026", "5 Sept 2026", "29 Aug 2026", "15 Aug 2026", "2 Aug 2026"];
        const ratings = [4, 5, 5, 4, 5, 4];
        const helpfulCounts = [11, 15, 17, 11, 6, 15];

        return INITIAL_REVIEWERS.map((r, i) => ({
            id: `seed_${i}`,
            name: r.name,
            avatar: r.avatar,
            rating: ratings[i] ?? 5,
            date: dates[i] ?? "Recently",
            comment: INITIAL_COMMENTS[i] ?? "Great product quality!",
            helpful: helpfulCounts[i] ?? 10,
            userLiked: false,
        }));
    });

    // Form states
    const [formOpen, setFormOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewerName, setReviewerName] = useState(user?.name || "");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Save to localStorage when reviews change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(reviews));
        } catch { /* ignore */ }
    }, [reviews, storageKey]);

    // Recalculate stats dynamically
    const { averageRating, totalReviews, breakdown } = useMemo(() => {
        const total = reviews.length;
        if (total === 0) {
            return { averageRating: 0, totalReviews: 0, breakdown: [0, 0, 0, 0, 0] };
        }

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = Number((sum / total).toFixed(1));

        // Counts for [5★, 4★, 3★, 2★, 1★]
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => {
            const star = Math.max(1, Math.min(5, Math.round(r.rating)));
            counts[5 - star]++;
        });

        return { averageRating: avg, totalReviews: total, breakdown: counts };
    }, [reviews]);

    // Notify parent component about updated rating and count
    useEffect(() => {
        if (onRatingUpdate && totalReviews > 0) {
            onRatingUpdate(averageRating, totalReviews);
        }
    }, [averageRating, totalReviews, onRatingUpdate]);

    const maxCount = Math.max(...breakdown, 1);

    // Toggle Helpful reaction
    const handleToggleHelpful = (reviewId: string) => {
        setReviews((prev) =>
            prev.map((r) => {
                if (r.id === reviewId) {
                    const liked = !r.userLiked;
                    return {
                        ...r,
                        helpful: liked ? r.helpful + 1 : Math.max(0, r.helpful - 1),
                        userLiked: liked,
                    };
                }
                return r;
            })
        );
    };

    // Submit new customer review
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedComment = comment.trim();
        const trimmedName = reviewerName.trim() || user?.name || "Verified Customer";

        if (!trimmedComment) {
            toast.error("Please enter a short comment for your review.");
            return;
        }

        setSubmitting(true);

        const initials = trimmedName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "VC";

        const today = new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const newReview: ReviewItem = {
            id: `rev_${Date.now()}`,
            name: trimmedName,
            avatar: initials,
            rating,
            date: today,
            comment: trimmedComment,
            helpful: 0,
            userLiked: false,
        };

        setReviews((prev) => [newReview, ...prev]);
        setComment("");
        setFormOpen(false);
        setSubmitting(false);
        toast.success("Thank you! Your review has been added.");
    };

    return (
        <section className="mt-14 animate-fade-in" id="reviews-section">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-serif font-bold text-app-green">Customer Reviews</h2>
                <button
                    onClick={() => setFormOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-2 bg-app-green hover:bg-emerald-900 text-white rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                    <MessageSquarePlusIcon className="size-4" />
                    {formOpen ? "Close Form" : "Write a Review"}
                </button>
            </div>

            {/* Write Review Form Card */}
            {formOpen && (
                <form
                    onSubmit={handleSubmitReview}
                    className="mb-8 p-6 bg-white rounded-2xl border-2 border-app-green/30 shadow-md animate-fade-in space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-app-border pb-3">
                        <h3 className="font-semibold text-zinc-900 text-base">Share Your Feedback</h3>
                        <span className="text-xs text-zinc-500">Reviews are published immediately</span>
                    </div>

                    {/* Star selection */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                            Your Rating
                        </label>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRating(s)}
                                    onMouseEnter={() => setHoverRating(s)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <StarIcon
                                        className={`size-6 transition-colors ${
                                            s <= (hoverRating || rating)
                                                ? "text-amber-500 fill-amber-500"
                                                : "text-zinc-300"
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="text-sm font-semibold text-zinc-700 ml-2">
                                {hoverRating || rating} out of 5 stars
                            </span>
                        </div>
                    </div>

                    {/* Reviewer name */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                            Your Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Alex Dupont"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            className="w-full max-w-md px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:border-app-green outline-none"
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                            Your Review
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="How was the taste, freshness, packaging and delivery?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:border-app-green outline-none resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setFormOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-app-orange hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            )}

            {/* Dynamic Customer Reviews Display */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-app-border shadow-xs">
                {/* Summary row with dynamic statistics */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-app-border">
                    {/* Average dynamic note */}
                    <div className="flex flex-col items-center justify-center md:min-w-[180px] lg:w-1/3">
                        <span className="text-6xl font-bold font-serif text-app-green tracking-tight">
                            {averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1 mt-3 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon
                                    key={s}
                                    className={`size-4 ${
                                        s <= Math.round(averageRating)
                                            ? "text-amber-500 fill-amber-500"
                                            : "text-zinc-200"
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-zinc-500">
                            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                        </span>
                    </div>

                    {/* Dynamic Breakdown bars */}
                    <div className="flex-1 space-y-2.5 justify-center flex flex-col">
                        {breakdown.map((count, i) => {
                            const starLevel = 5 - i;
                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                            return (
                                <div key={starLevel} className="flex items-center gap-3 text-xs">
                                    <span className="font-semibold text-zinc-600 w-7 text-right">
                                        {starLevel} ★
                                    </span>
                                    <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${(count / maxCount) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-zinc-400 w-12 text-right font-medium">
                                        {count} ({pct}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Individual reviews list */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-center py-8 text-sm text-zinc-400">
                            No reviews yet. Be the first to review this product!
                        </p>
                    ) : (
                        reviews.map((rev) => (
                            <div key={rev.id} className="flex gap-4 pb-6 border-b border-app-border/40 last:border-0 last:pb-0">
                                <div className="size-11 rounded-full bg-emerald-100 text-app-green flex-center shrink-0 text-xs font-bold uppercase tracking-wider">
                                    {rev.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <span className="text-sm font-semibold text-zinc-900">{rev.name}</span>
                                        <span className="text-xs text-zinc-300">•</span>
                                        <span className="text-xs text-zinc-400">{rev.date}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon
                                                key={s}
                                                className={`size-3.5 ${
                                                    s <= rev.rating
                                                        ? "text-amber-500 fill-amber-500"
                                                        : "text-zinc-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-zinc-700 leading-relaxed mb-2.5">
                                        {rev.comment}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleHelpful(rev.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                            rev.userLiked
                                                ? "bg-emerald-50 text-app-green border border-emerald-200"
                                                : "text-zinc-500 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
                                        }`}
                                    >
                                        <ThumbsUpIcon
                                            className={`size-3.5 transition-transform ${
                                                rev.userLiked ? "fill-app-green scale-110" : ""
                                            }`}
                                        />
                                        <span>Helpful ({rev.helpful})</span>
                                        {rev.userLiked && (
                                            <CheckCircle2Icon className="size-3 text-app-green ml-0.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
