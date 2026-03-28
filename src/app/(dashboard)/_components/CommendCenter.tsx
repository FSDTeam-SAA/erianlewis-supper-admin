import React from "react";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Data ────────────────────────────────────────────────────────────────────
const dataSource = [
  { label: "Accounts", value: "33", sub: null },
  { label: "Listings", value: "8", sub: "7 active" },
  { label: "Plans", value: "33", sub: null },
  { label: "Location", value: "33", sub: null },
  { label: "Db Configure", value: "Yes", sub: null },
];

const statCards = [
  {
    icon: Users,
    iconBg: "bg-blue-500",
    value: "33",
    label: "Total Accounts",
    sub: "6 verified",
  },
  {
    icon: Building2,
    iconBg: "bg-emerald-500",
    value: "8",
    label: "Total Listing",
    sub: "7 active",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-purple-500",
    value: "29",
    label: "Active Subscription",
    sub: null,
  },
  {
    icon: DollarSign,
    iconBg: "bg-emerald-500",
    value: "$9.99",
    label: "Monthly Revuenue",
    sub: "Estimated",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-red-500",
    value: "0",
    label: "Security Flag",
    sub: "unresolved",
  },
];

// ── Component ────────────────────────────────────────────────────────────────
function CommendCenter() {
  return (
    <div className="bg-gray-50">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between py-6">
        <div>
          <h1 className="text-2xl font-medium text-[#000000]">
            Commend Center
          </h1>
          <p className="text-base text-[#9A9A9A] mt-3">
            Refresh Updates the dashboard. It also Updates When you run actions
            in Superadmin.
          </p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 h-[50px] rounded-md text-base font-semibold">
          Search
        </Button>
      </div>

      {/* ── Data Source Card ── */}
      <div className="mb-6 border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Data source
          </h2>
          <p className="text-sm text-gray-400 mb-4">Production</p>

          <div className="grid grid-cols-5 gap-4">
            {dataSource.map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-gray-50 border border-gray-100 rounded-lg p-4"
              >
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="">
        <div className="">
          <div className="grid grid-cols-3 gap-6">
            {statCards.map(({ icon: Icon, iconBg, value, label, sub }) => (
              <div key={label} className="flex flex-col gap-3 bg-[#FFFFFF]">
                <div className="p-6">
                  {/* Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-[4px] flex items-center justify-center ${iconBg}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Value */}
                  <p className="text-3xl font-bold text-gray-900 my-2">{value}</p>

                  {/* Label + Sub */}
                  <div>
                    <p className="text-sm text-gray-500 my-1">{label}</p>
                    {sub && <p className="text-sm text-gray-400">{sub}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommendCenter;
