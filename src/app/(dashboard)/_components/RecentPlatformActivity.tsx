"use client";

import React, { useRef } from "react";

const activities = [
  { action: "account deleted", actor: "user", source: "System", time: "1/8/2026, 10:33:31 PM" },
  { action: "account deleted", actor: "user", source: "System", time: "1/8/2026, 10:33:31 PM" },
  { action: "legal document updated", actor: "user", source: "System", time: "1/8/2026, 10:33:31 PM" },
  { action: "account deleted", actor: "user", source: "System", time: "1/8/2026, 10:33:31 PM" },
  { action: "account created", actor: "user", source: "System", time: "1/8/2026, 10:31:15 PM" },
  { action: "password changed", actor: "user", source: "System", time: "1/8/2026, 10:35:45 PM" },
  { action: "legal document updated", actor: "user", source: "System", time: "1/8/2026, 10:33:31 PM" },
];

function RecentPlatformActivity() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-gray-50 pb-10">
      <div className="bg-white">
        <div className="p-0">
          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {/* Title */}
              <div className="px-6 pt-5 pb-3">
                <h2 className="text-[24px] font-medium text-black leading-[100%]">
                  Recent Platform Activity
                </h2>
              </div>

              {/* Scrollable List */}
              <div
                ref={scrollRef}
                className="overflow-y-auto max-h-[420px] divide-y divide-gray-100 pr-2 custom-scrollbar"
              >
                {activities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    {/* Left */}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.actor} · {item.source}
                      </p>
                    </div>

                    {/* Right */}
                    <p className="text-sm text-gray-400 whitespace-nowrap ml-8">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentPlatformActivity;