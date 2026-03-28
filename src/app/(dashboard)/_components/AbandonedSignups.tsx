import React from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AbandonedSignups() {
  return (
    <div className="bg-gray-50 space-y-4 my-8">

      {/* ── Abandoned Signups Card ── */}
      <div className="bg-[#FFFFFF]">
        <div className="p-6">

          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[24px] font-medium text-black leading-[100%]">Abandoned signups</h2>
              <p className="text-base text-[#9A9A9A] mt-3">
                Unverified accounts older than 1 hour (and onboarding not completed).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border h-[50px]"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md h-[50px]"
              >
                <Trash2 className="w-4 h-4" />
                Delete abandoned signups
              </Button>
            </div>
          </div>

          {/* Stale unverified accounts row */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-start justify-between">
            <div>
              <p className="text-lg font-medium text-gray-800">Stale unverified accounts</p>
              <p className="text-[14px] text-[#4B4B4B] mt-0.5">
                Deleting these accounts also deletes their auth sessions (forces sign-out).
              </p>
            </div>
            <span className="text-[24px] font-medium text-black">6</span>
          </div>

        </div>
      </div>

      {/* ── Subscription Breakdown Card ── */}
      <div className="bg-[#FFFFFF]">
        <div className="p-6">
          <h2 className="text-[24px] font-medium text-black leading-[100%]">Subscription Breakdown</h2>

          {/* Row 1 — Gray dot Free */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-gray-400 inline-block" />
              <span className="text-lg font-medium text-gray-800">Free</span>
            </div>
            <span className="text-[24px] font-medium text-black">28</span>
          </div>

          {/* Row 2 — Blue dot Free */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
              <span className="text-lg font-medium text-gray-800">Free</span>
            </div>
            <span className="text-[24px] font-medium text-black">1</span>
          </div>

        </div>
      </div>

      {/* ── Bottom Two Cards ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Listings by Island */}
        <div className="bg-white">
          <div className="p-6 flex items-start justify-between">
            <div>
              <h2 className="text-[24px] font-medium text-black leading-[100%]">Listings by Island</h2>
              <p className="text-base text-[#9A9A9A] mt-3">8 total across 4 islands</p>
            </div>
            <button className="text-[24px] font-medium text-red-500 hover:text-red-600 leading-[100%]">
              Expand
            </button>
          </div>
        </div>

        {/* Accounts by Island */}
        <div className="bg-white">
          <div className="p-6 flex items-start justify-between">
            <div>
              <h2 className="text-[24px] font-medium text-black leading-[100%]">Accounts by Island</h2>
              <p className="text-base text-[#9A9A9A] mt-3">21 total across 13 islands</p>
            </div>
            <button className="text-[24px] font-medium text-red-500 hover:text-red-600 leading-[100%]">
              Expand
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AbandonedSignups