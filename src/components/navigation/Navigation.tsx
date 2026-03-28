"use client";

import React, { useRef, useState } from "react";
import {
  Search,
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
import { Input } from "@/components/ui/input";
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
      {/* Search Section (FULL WIDTH BORDER) */}
      <div className="bg-white border-b-2 border-[#E5E7EB]">
        <div className="container mx-auto px-2 py-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search superadmin section ... ( e.g., Accounts Islands, Legal)"
              className="pl-9 pr-4 h-[48px] text-sm text-gray-500 border-2 border-[#ACACAC] rounded-md bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:border-red-400 w-full"
            />
          </div>
        </div>
      </div>

      {/* Nav Tabs (FULL WIDTH BORDER) */}
      <div className="bg-white border-b-2 border-[#E5E7EB]">
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