"use client";

import React, { useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";

function BillingPage() {
  const [isAuthenticated, ] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="container mx-auto py-8 h-screen">
      {/* ── Page Header ── */}
      <h1 className="text-xl font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-400 mb-6">
        Stripe only billing. This section shows which Stripe account is
        receiving payments.
      </p>

      {/* ── Stripe Receiving Account Card ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Stripe Receiving Account
            </span>
            <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
              Live payments
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4">
          {isAuthenticated ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
              ✓ Authenticated — Stripe account connected successfully.
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-500 font-medium">
              Not authenticated
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingPage;