"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  ExternalLink,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import Image from "next/image";

// ── Leaflet Map (dynamically imported — no SSR) ───────────────────────────────
const MapPicker = dynamic(() => import("@/components/mappicker/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[160px] bg-blue-50 flex items-center justify-center text-sm text-gray-400 rounded-xl">
      Loading map…
    </div>
  ),
});

// ── Types ──────────────────────────────────────────────────────────────────────
interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockImages = [
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=80",
];

const mockReviews: Review[] = [];

// ── Star Rating Component ──────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`${sz} transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Info Grid Cell ─────────────────────────────────────────────────────────────
function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-4 px-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function ReviewDetails() {
  const [saved, setSaved] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleSubmitReview = () => {
    if (!rating) return;
    const newReview: Review = {
      id: Date.now(),
      author: "You",
      rating,
      comment,
      date: new Date().toLocaleDateString("en-GB"),
    };
    setReviews((prev) => [newReview, ...prev]);
    setRating(0);
    setComment("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {/* Logo placeholder */}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <div className="flex flex-col items-center leading-none">
            <span className="text-xs font-bold tracking-widest text-gray-800 uppercase">
              AL
            </span>
            <span className="text-[9px] tracking-widest text-gray-400 uppercase">
              ALTHA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${saved ? "fill-red-500 text-red-500" : ""}`}
            />
            Save
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20">
        {/* ── Hero Image ── */}
        <div className="relative w-full h-[360px] rounded-xl overflow-hidden mt-5 bg-gray-100">
          <Image
            width={400}
            height={260}
            src={mockImages[activeIndex]}
            alt="Property"
            className="w-full h-full object-cover transition-all duration-300"
          />
          <button className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors">
            View All {mockImages.length} Photos
          </button>
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {activeIndex + 1}/{mockImages.length}
          </div>
        </div>

        {/* ── Thumbnail Strip ── */}
        <div className="flex gap-2 mt-3">
          {mockImages.map((src, i) => (
            <div
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer transition-all ${
                activeIndex === i
                  ? "ring-2 ring-[#e53935] ring-offset-1 opacity-100"
                  : "opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={src}
                alt=""
                width={64}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* ── Price & Badge ── */}
        <div className="mt-5 flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            JMD 12,345
            <span className="text-base font-normal text-gray-500">/mo</span>
          </h1>
          <span className="bg-[#e53935] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            For Rent
          </span>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mt-1">
          Property for rent
        </h2>

        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          Santorini, DAMAC Lagoons, USA
        </div>

        {/* ── Type / Island ── */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-400">Type</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">House</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Islands</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">Jamaica</p>
          </div>
        </div>

        <Separator className="my-5" />

        {/* ── Rental Details ── */}
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Rental Details
        </h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <InfoCell
              label="Lease Terms"
              value="Month to month , 6 Month 12 Month"
            />
            <InfoCell label="Utilities Included" value="Yes" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <InfoCell label="Furnished" value="Yes" />
            <InfoCell label="Pet Friendly" value="Yes" />
          </div>
        </div>

        <Separator className="my-5" />

        {/* ── Location ── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Location</h3>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Apple Maps
            </a>
          </div>
        </div>

        {/* Map — same MapPicker used in EditListingPage, read-only (no onPinChange) */}
        <div className="w-full rounded-xl overflow-hidden border border-gray-200">
          <MapPicker
            pin={{ lat: 25.7617, lng: -80.1918 }}
            onPinChange={() => {}}
          />
        </div>

        <Separator className="my-5" />

        {/* ── Description ── */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Description
          </h3>
          <p className="text-sm text-gray-500">Description</p>
        </div>

        <Separator className="my-5" />

        {/* ── Additional Details ── */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Additional Details
          </h3>
        </div>

        <Separator className="my-5" />

        {/* ── More Details ── */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            More Details
          </h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <InfoCell label="Currency Type" value="JMD" />
              <InfoCell label="Pin Code (optional)" value="Yes" />
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* ── Reviews ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">Reviews</h3>
              <div className="flex items-center gap-1">
                <StarRating value={5} readOnly size="sm" />
                <span className="text-xs text-gray-500">5.0</span>
              </div>
            </div>
            <button className="text-xs text-[#e53935] font-medium hover:underline">
              Jump to comments
            </button>
          </div>

          {/* Leave a review form */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Leave a review
            </p>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1.5">Rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1.5">Comments</p>
              <Textarea
                placeholder="Share what you liked (or didn't)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none text-sm min-h-[80px] border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 bg-white"
              />
              <p className="text-xs text-gray-300 text-right mt-1">
                {comment.length}/1000
              </p>
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={!rating}
              className="bg-[#e53935] hover:bg-[#c62828] text-white text-sm px-6 h-9 rounded-lg disabled:opacity-40"
            >
              Submit review
            </Button>
          </div>

          {/* Comments section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Comments</p>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">
                No reviews yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">
                        {r.author}
                      </p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                    <StarRating value={r.rating} readOnly size="sm" />
                    {r.comment && (
                      <p className="text-sm text-gray-600 mt-2">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReviewDetails;
