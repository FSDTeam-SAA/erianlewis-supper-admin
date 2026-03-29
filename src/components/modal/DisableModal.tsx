"use client";

import React, { useState } from "react";

interface DisableListingModalProps {
  listingId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, reason: string) => void;
}

export function DisableListingModal({
  listingId,
  isOpen,
  onClose,
  onConfirm,
}: DisableListingModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || listingId === null) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm(listingId, reason);
    setLoading(false);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      {/* Modal — browser dialog style */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-300">
        {/* Header bar */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <p className="text-sm font-bold text-gray-900">
            www.alorarealty.com says
          </p>
        </div>

        {/* Body */}
        <div className="px-4 pt-4 pb-5">
          <label className="block text-sm text-gray-700 mb-2">
            Reason for disabling :
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className="w-full border border-gray-300 focus:border-blue-500 focus:outline-none rounded px-3 py-2 text-sm text-gray-800"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-70 flex items-center gap-1.5"
          >
            {loading && (
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            OK
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}