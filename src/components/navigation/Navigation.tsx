"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { label: "Commend Center", icon: Activity, href: "/" },
  { label: "Island", icon: Map, href: "/island" },
  { label: "Accounts", icon: Users, href: "/accounts" },
  { label: "Listing", icon: Building2, href: "/listing" },
  { label: "Reviews", icon: Star, href: "/reviews" },
  { label: "Billing", icon: DollarSign, href: "/billing" },
  { label: "Manage Plans", icon: CreditCard, href: "/plan" },
  { label: "Management Inquires", icon: Mail, href: "/inquires" },
  { label: "Audit Logs", icon: FileText, href: "/audit-logs" },
  { label: "Communication Log", icon: MessageSquare, href: "/communication-log" },
];

function Navigation() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  return (
    <nav>
      {/* Nav Tabs (FULL WIDTH BORDER) */}
      <div className="bg-white border-b-2 border-t border-[#E5E7EB] mt-5">
        <div className="container mx-auto px-2 flex items-center">
          <div
            ref={scrollRef}
            className="flex items-end gap-3 overflow-x-auto flex-1 scroll-smooth no-scrollbar"
          >
            {navItems.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
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
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
