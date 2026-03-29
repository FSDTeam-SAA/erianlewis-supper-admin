"use client";

import React, { useState } from "react";

interface DeleteListingModalProps {
  listingId: number | null;
  listingName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteListingModal({
  listingId,
  isOpen,
  onClose,
  onConfirm,
}: DeleteListingModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || listingId === null) return null;

  const handleConfirm = async () => { 
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm(listingId);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Delete account?
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          The permanently deletes the user and any owned listings. This cannot
          be undone.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#DF2634] hover:bg-[#c41f2c] rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}