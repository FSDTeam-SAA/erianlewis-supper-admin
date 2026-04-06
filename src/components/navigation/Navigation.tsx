"use client";

import React, { useRef, useState } from "react";
import {
  Activity,
  Map,
  Users,
  Building2,
  Star,
  DollarSign,
  CreditCard,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Commend Center", icon: Activity },
  { label: "Island", icon: Map },
  { label: "Accounts", icon: Users },
  { label: "Listing", icon: Building2 },
  { label: "Reviews", icon: Star },
  { label: "Billing", icon: DollarSign },
  { label: "Manage Plans", icon: CreditCard },
  { label: "Management Inquires", icon: Mail },
  { label: "Audit Logs", icon: FileText },
  { label: "Communication Log", icon: MessageSquare },
];

function Navigation() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState("Commend Center");

  return (
    <nav>
      {/* Nav Tabs (FULL WIDTH BORDER) */}
      <div className="bg-white border-b-2 border-t border-[#E5E7EB] mt-5">
        <div className="container mx-auto px-2 flex items-center">
          <div
            ref={scrollRef}
            className="flex items-end gap-3 overflow-x-auto flex-1 scroll-smooth no-scrollbar"
          >
            {navItems.map(({ label, icon: Icon }) => {
              const isActive = activeItem === label;

              return (
                <button
                  key={label}
                  onClick={() => setActiveItem(label)}
                  className={cn(
                    "flex items-center gap-3 px-4 h-[88px] text-base font-medium whitespace-nowrap border-b-2 transition-all duration-150",
                    isActive
                      ? "border-red-500 text-red-500 bg-[#FEF2F2]"
                      : "border-transparent text-gray-500"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-red-500" : "text-gray-400"
                    )}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;