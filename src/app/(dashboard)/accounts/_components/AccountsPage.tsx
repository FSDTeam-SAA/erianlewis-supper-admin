"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccoutntModal } from "@/app/modal/AccoutntModal";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface Account {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  island: string;
  role: string;
  plan: string;
  status: "active" | "pending_payment" | "suspended";
  listings: number;
}

interface ApiAccount {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountStatus: "active" | "suspended" | "pending_payment";
  individual?: {
    operatingLocations?: Array<{ _id: string; name: string }>;
  } | null;
  business?: {
    operatingLocations?: Array<{ _id: string; name: string }>;
  } | null;
  subscription?: {
    planId?: {
      title?: string;
      name?: string;
    } | null;
  } | null;
}

interface AccountsResponse {
  accounts: ApiAccount[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface IslandOption {
  _id: string;
  name: string;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Account["status"] }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    pending_payment: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`px-3 py-2 rounded-full text-base font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function AccountsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("50");
  const [selected, setSelected] = useState<string[]>([]);

  const { data: islandsData } = useQuery({
    queryKey: ["island-options", token],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch islands");
      }
      return (json?.data?.islands || []) as IslandOption[];
    },
  });

  const { data: accountData, isLoading } = useQuery({
    queryKey: ["account", token, page, perPage, search, role, status, island],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (search.trim()) params.set("search", search.trim());
      if (role !== "all") params.set("role", role);
      if (status !== "all") params.set("status", status);
      if (island !== "all") params.set("island", island);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-accounts?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch accounts");
      }
      return json.data as AccountsResponse;
    },
  });

  const tableData: Account[] = useMemo(() => {
    const accounts = accountData?.accounts || [];
    return accounts.map((item) => {
      const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A";
      const islandName =
        item?.individual?.operatingLocations?.[0]?.name ||
        item?.business?.operatingLocations?.[0]?.name ||
        "N/A";
      const planName = item?.subscription?.planId?.title || item?.subscription?.planId?.name || "Free";
      const mappedStatus: Account["status"] =
        item.accountStatus === "pending_payment"
          ? "pending_payment"
          : item.accountStatus === "suspended"
            ? "suspended"
            : "active";

      return {
        _id: item._id,
        firstName: item.firstName,
        lastName: item.lastName,
        name: fullName,
        email: item.email || "N/A",
        island: islandName,
        role: item.role || "N/A",
        plan: planName,
        status: mappedStatus,
        listings: 0,
      };
    });
  }, [accountData?.accounts]);

  const allSelected =
    tableData.length > 0 && tableData.every((a) => selected.includes(a._id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(tableData.map((a) => a._id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const paginationInfo = accountData?.paginationInfo;
  const totalData = paginationInfo?.totalData ?? 0;
  const currentPage = paginationInfo?.currentPage ?? page;
  const totalPages = paginationInfo?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white !rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
        </p>

        {/* Search + Filters */}
        <div className="flex items-end gap-3 mb-5">
          {/* Search */}
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          {/* Island */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select
              value={island}
              onValueChange={(value) => {
                setIsland(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {(islandsData || []).map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_payment">Onboarding</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Role</label>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="LANDLORD">Landlord</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination row */}
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

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {[
                "ACCOUNT",
                "ISLAND",
                "ROLE",
                "PLAN",
                "STATUS",
                "LISTINGS",
                "ACTIONS",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-base font-semibold text-[#8B8B8B] leading-[120%]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>
                  Loading accounts...
                </td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>
                  No accounts found.
                </td>
              </tr>
            ) : tableData.map((account) => (
              <tr
                key={account._id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox  className="w-[20px] h-[20px]"
                    checked={selected.includes(account._id)}
                    onCheckedChange={() => toggleOne(account._id)}
                  />
                </td>

                {/* Account */}
                <td className="px-4 py-4">
                  <p className="text-[20px] leading-[120%] font-semibold text-[#1C1C1C]">
                    {account.name}
                  </p>
                  <p className="text-base leading-[150%] text-[#7A7A7A] mt-0.5">
                    {account.email}
                  </p>
                </td>

                {/* Island */}
                <td className="px-4 py-4 text-[18px] leading-[120%] font-medium text-[#1C1C1C]">
                  {account.island}
                </td>

                {/* Role */}
                <td className="px-4 py-4 text-[17px] leading-[120%] font-medium text-[#1C1C1C]">
                  {account.role}
                </td>

                {/* Plan */}
                <td className="px-4 py-4 text-[18px] leading-[120%] font-medium text-[#1C1C1C]">
                  {account.plan}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={account.status} />
                </td>

                {/* Listings */}
                <td className="px-4 py-4 text-[18px] leading-[120%] font-medium text-[#1C1C1C]">
                  {account.listings}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <AccoutntModal id={account?._id}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountsPage;
