import React from "react";
import { Users, Building2, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Summary {
  totalAccounts: number;
  totalListings: number;
  totalPlans: number;
  totalLocations: number;
  totalSecurityFlags: number;
  unresolvedSecurityFlags: number;
  activeSubscriptions: number;
  estimatedMonthlyRevenue: number;
}

interface Listings {
  total: number;
  active: number;
}

interface Props {
  summary?: Summary;
  listings?: Listings;
  isLoading?: boolean;
}

function CommendCenter({ summary, listings, isLoading = false }: Props) {
  const dataSource = [
    { label: "Accounts", value: summary?.totalAccounts ?? "—", sub: null },
    { label: "Listings", value: summary?.totalListings ?? "—", sub: listings ? `${listings.active} active` : null },
    { label: "Plans", value: summary?.totalPlans ?? "—", sub: null },
    { label: "Location", value: summary?.totalLocations ?? "—", sub: null },
    // { label: "Db Configure", value: "Yes", sub: null },
  ];

  const statCards = [
    {
      icon: Users,
      iconBg: "bg-blue-500",
      value: summary?.totalAccounts ?? "—",
      label: "Total Accounts",
      sub: null,
    },
    {
      icon: Building2,
      iconBg: "bg-emerald-500",
      value: summary?.totalListings ?? "—",
      label: "Total Listing",
      sub: listings ? `${listings.active} active` : null,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-500",
      value: summary?.activeSubscriptions ?? "—",
      label: "Active Subscription",
      sub: null,
    },
    {
      icon: DollarSign,
      iconBg: "bg-emerald-500",
      value: summary ? `$${summary.estimatedMonthlyRevenue.toFixed(2)}` : "—",
      label: "Monthly Revenue",
      sub: "Estimated",
    },
    {
      icon: AlertTriangle,
      iconBg: "bg-red-500",
      value: summary?.unresolvedSecurityFlags ?? "—",
      label: "Security Flag",
      sub: "unresolved",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="flex items-start justify-between py-6">
        <div>
          <h1 className="text-2xl font-medium text-[#000000]">Commend Center</h1>
          <p className="text-base text-[#9A9A9A] mt-3">
            Refresh Updates the dashboard. It also Updates When you run actions in Superadmin.
          </p>
        </div>
        {/* <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 h-[50px] rounded-md text-base font-semibold">
          Search
        </Button> */}
      </div>

      {/* Data Source Card */}
      <div className="mb-6 border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Data source</h2>
          <p className="text-sm text-gray-400 mb-4">Production</p>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {dataSource.map(({ label, value, sub }) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{String(value)}</p>
                  {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-3 bg-[#FFFFFF]">
              <div className="p-6">
                <Skeleton className="w-10 h-10 rounded-[4px]" />
                <Skeleton className="h-9 w-28 my-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {statCards.map(({ icon: Icon, iconBg, value, label, sub }) => (
            <div key={label} className="flex flex-col gap-3 bg-[#FFFFFF]">
              <div className="p-6">
                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 my-2">{String(value)}</p>
                <div>
                  <p className="text-sm text-gray-500 my-1">{label}</p>
                  {sub && <p className="text-sm text-gray-400">{sub}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommendCenter;
