"use client";

import React, { useState } from "react";
import { CreditCard, RefreshCw, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillingUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  accountStatus?: string;
  hasActiveSubscription?: boolean;
  subscription?: {
    planId?: {
      _id?: string;
      title?: string;
      name?: string;
      price?: number;
      billingCycle?: string;
      maxProperties?: number;
    } | null;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
}

interface BillingResponse {
  totalRevenue: number;
  billing: BillingUser[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB");
};

function BillingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [planId, setPlanId] = useState("all");
  const [billingCycle, setBillingCycle] = useState("all");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);

  const { data: billingData, refetch, isLoading } = useQuery({
    queryKey: ["billing", token, page, perPage, search, planId, billingCycle],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (search.trim()) params.set("search", search.trim());
      if (planId !== "all") params.set("planId", planId);
      if (billingCycle !== "all") params.set("billingCycle", billingCycle);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/billing?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch billing records");
      }
      return json.data as BillingResponse;
    },
  });

  const handleRefresh = async () => {
    setLoading(true);
    await refetch();
    setLoading(false);
  };

  const billingRows = billingData?.billing || [];
  const totalRevenue = billingData?.totalRevenue ?? 0;
  const paginationInfo = billingData?.paginationInfo;
  const currentPage = paginationInfo?.currentPage ?? page;
  const totalPages = paginationInfo?.totalPages ?? 1;
  const totalData = paginationInfo?.totalData ?? 0;
  const isAuthenticated = sessionStatus === "authenticated";

  const planMap = new Map<string, string>();
  billingRows.forEach((user) => {
    const id = user?.subscription?.planId?._id;
    const label = user?.subscription?.planId?.title || user?.subscription?.planId?.name;
    if (id && label) planMap.set(id, label);
  });
  const planOptions = Array.from(planMap.entries()).map(([id, label]) => ({ id, label }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-400 mb-6">
        Stripe only billing. This section shows which Stripe account is
        receiving payments.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-4">
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

      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-400">
            {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
          </p>
          <p className="text-sm font-semibold text-gray-700">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email, name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Plan</label>
            <Select
              value={planId}
              onValueChange={(value) => {
                setPlanId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Billing Cycle</label>
            <Select
              value={billingCycle}
              onValueChange={(value) => {
                setBillingCycle(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Billing Cycles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Cycles</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing up to {perPage} per page</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Per page</span>
            <Select
              value={perPage}
              onValueChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-9 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo?.hasPrevPage}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo?.hasNextPage}
              onClick={() => setPage((prev) => prev + 1)}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["ACCOUNT", "EMAIL", "ROLE", "PLAN", "PRICE", "CYCLE", "START", "END", "STATUS"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#8B8B8B] tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={9}>
                  Loading billing records...
                </td>
              </tr>
            ) : billingRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={9}>
                  No billing records found.
                </td>
              </tr>
            ) : (
              billingRows.map((item) => {
                const fullName = `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "N/A";
                const plan = item?.subscription?.planId;
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">{fullName}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">{item?.email || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">{item?.role || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">{plan?.title || plan?.name || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">${(plan?.price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C] capitalize">{plan?.billingCycle || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">{formatDate(item?.subscription?.startDate)}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C]">{formatDate(item?.subscription?.endDate)}</td>
                    <td className="px-4 py-4 text-sm text-[#1C1C1C] capitalize">{item?.accountStatus || "N/A"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BillingPage;
