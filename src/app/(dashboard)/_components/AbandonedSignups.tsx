"use client";

import React, { useState } from "react";

interface SubscriptionItem {
  _id: string;
  count: number;
  planName: string;
  planTitle: string;
  price: number;
  billingCycle: string;
}

interface IslandItem {
  _id: string;
  count: number;
  islandName: string;
}

interface Props {
  subscriptionBreakdown?: SubscriptionItem[];
  listingsByIsland?: IslandItem[];
  accountsByIsland?: IslandItem[];
}

const DOT_COLORS = [
  "bg-gray-400",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-red-400",
];

function AbandonedSignups({ subscriptionBreakdown, listingsByIsland, accountsByIsland }: Props) {
  const [listingsExpanded, setListingsExpanded] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(false);

  const totalListings = listingsByIsland?.reduce((s, i) => s + i.count, 0) ?? 0;
  const totalAccounts = accountsByIsland?.reduce((s, i) => s + i.count, 0) ?? 0;
  const uniqueListingIslands = new Set(listingsByIsland?.map((i) => i.islandName)).size;
  const uniqueAccountIslands = new Set(accountsByIsland?.map((i) => i.islandName)).size;

  return (
    <div className="bg-gray-50 space-y-4 my-8">

      {/* Abandoned Signups Card */}
      {/* <div className="bg-[#FFFFFF]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[24px] font-medium text-black leading-[100%]">Abandoned signups</h2>
              <p className="text-base text-[#9A9A9A] mt-3">
                Unverified accounts older than 1 hour (and onboarding not completed).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border h-[50px]">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md h-[50px]">
                <Trash2 className="w-4 h-4" />
                Delete abandoned signups
              </Button>
            </div>
          </div>

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
      </div> */}

      {/* Subscription Breakdown Card */}
      <div className="bg-[#FFFFFF]">
        <div className="p-6">
          <h2 className="text-[24px] font-medium text-black leading-[100%] mb-3">
            Subscription Breakdown
          </h2>
          {subscriptionBreakdown && subscriptionBreakdown.length > 0 ? (
            subscriptionBreakdown.map((item, idx) => (
              <div
                key={item._id}
                className={`flex items-center justify-between py-2 ${
                  idx < subscriptionBreakdown.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full inline-block ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
                  <span className="text-lg font-medium text-gray-800">{item.planTitle}</span>
                  <span className="text-sm text-gray-400">${item.price}/{item.billingCycle}</span>
                </div>
                <span className="text-[24px] font-medium text-black">{item.count}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No subscription data available.</p>
          )}
        </div>
      </div>

      {/* Bottom Two Cards */}
      <div className="grid grid-cols-2 gap-4">

        {/* Listings by Island */}
        <div className="bg-white">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-medium text-black leading-[100%]">Listings by Island</h2>
                <p className="text-base text-[#9A9A9A] mt-3">
                  {totalListings} total across {uniqueListingIslands} island{uniqueListingIslands !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setListingsExpanded((prev) => !prev)}
                className="text-[24px] font-medium text-red-500 hover:text-red-600 leading-[100%]"
              >
                {listingsExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            {listingsExpanded && (
              <div className="mt-4 space-y-2">
                {listingsByIsland?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-sm text-gray-800">{item.islandName}</span>
                    <span className="text-sm text-gray-400">{item.count} listings</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accounts by Island */}
        <div className="bg-white">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-medium text-black leading-[100%]">Accounts by Island</h2>
                <p className="text-base text-[#9A9A9A] mt-3">
                  {totalAccounts} total across {uniqueAccountIslands} island{uniqueAccountIslands !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setAccountsExpanded((prev) => !prev)}
                className="text-[24px] font-medium text-red-500 hover:text-red-600 leading-[100%]"
              >
                {accountsExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            {accountsExpanded && (
              <div className="mt-4 space-y-2">
                {accountsByIsland?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50">
                    <span className="text-sm text-gray-800">{item.islandName}</span>
                    <span className="text-sm text-gray-400">{item.count} Accounts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AbandonedSignups;