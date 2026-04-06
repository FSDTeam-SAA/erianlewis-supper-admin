"use client";

import React, { useRef } from "react";

interface Actor {
  userId: { _id: string; email: string };
  email: string;
  role: string;
}

interface Entity {
  type: string;
  id: string;
  label: string;
}

interface ActivityItem {
  _id: string;
  action: string;
  actor: Actor;
  entity: Entity;
  details: Record<string, string>;
  createdAt: string;
}

interface Props {
  recentActivity?: ActivityItem[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function RecentPlatformActivity({ recentActivity }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-gray-50 pb-10">
      <div className="bg-white">
        <div className="p-0">
          <div className="flex">
            <div className="flex-1 overflow-hidden">
              <div className="px-6 pt-5 pb-3">
                <h2 className="text-[24px] font-medium text-black leading-[100%]">
                  Recent Platform Activity
                </h2>
              </div>

              <div
                ref={scrollRef}
                className="overflow-y-auto max-h-[420px] divide-y divide-gray-100 pr-2 custom-scrollbar"
              >
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <div key={item._id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.actor.email} · {item.actor.role}
                          {item.details?.userName ? ` · ${item.details.userName}` : ""}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 whitespace-nowrap ml-8">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="px-6 py-4 text-sm text-gray-400">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentPlatformActivity;