"use client";

import React, { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateSecurityModal } from "@/components/modal/CreateSecurityModal";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type FlagStatus = "open" | "resolved";

interface SecurityFlagRow {
  id: string;
  account: string;
  island: string;
  role: string;
  plan: string;
  status: FlagStatus;
  listings: number;
}

interface ApiFlag {
  _id: string;
  resolved: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    listingCount?: number;
    subscription?: {
      planId?: {
        title?: string;
        name?: string;
      };
    };
    individual?: {
      operatingLocations?: Array<{ name?: string }>;
    } | null;
    business?: {
      operatingLocations?: Array<{ name?: string }>;
    } | null;
  };
}

interface SecurityFlagsResponse {
  flags: ApiFlag[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function StatusBadge({ status }: { status: FlagStatus }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        status === "open"
          ? "bg-red-100 text-red-500"
          : "bg-green-100 text-green-600"
      }`}
    >
      {status}
    </span>
  );
}

function SecurityPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: flagsData, refetch } = useQuery({
    queryKey: ["security-flags", token, statusFilter, severityFilter, userFilter],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "50");
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (userFilter.trim()) params.set("userId", userFilter.trim());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/security-flags?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch security flags");
      }

      return json.data as SecurityFlagsResponse;
    },
  });

  const flags: SecurityFlagRow[] = useMemo(
    () =>
      (flagsData?.flags || []).map((flag) => {
        const fullName = `${flag.user?.firstName || ""} ${flag.user?.lastName || ""}`.trim();
        const account = `${fullName || "N/A"} - ${flag.user?.email || "N/A"}`;
        const island =
          flag.user?.individual?.operatingLocations?.[0]?.name ||
          flag.user?.business?.operatingLocations?.[0]?.name ||
          "N/A";

        return {
          id: flag._id,
          account,
          island,
          role: flag.user?.role || "N/A",
          plan:
            flag.user?.subscription?.planId?.title ||
            flag.user?.subscription?.planId?.name ||
            "Free",
          status: flag.resolved ? "resolved" : "open",
          listings: flag.user?.listingCount || 0,
        };
      }),
    [flagsData?.flags]
  );

  const allSelected =
    flags.length > 0 && flags.every((f) => selected.includes(f.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(flags.map((f) => f.id));
  };

  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const openCount = flags.filter((f) => f.status === "open").length;

  return (
    <div className="container mx-auto py-8 h-screen">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Security</h1>
            <p className="text-sm text-gray-400 mt-1">
              {openCount} open/ {flags.length} total &nbsp;•&nbsp; user #{userFilter || "all"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-9 px-4 text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              Reset
            </Button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-white bg-[#e53935] hover:bg-[#c62828] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Flag
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="">
          <div className="flex items-end gap-3">
            {/* Status Filter */}
            <div className="w-52">
              <label className="text-xs text-gray-500 mb-1 block">
                Status Filter
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setSelected([]);
                }}
              >
                <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved Only</SelectItem>
                  <SelectItem value="resolved">Resolved Only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div className="w-52">
              <label className="text-xs text-gray-500 mb-1 block">
                Severity Filter
              </label>
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value);
                  setSelected([]);
                }}
              >
                <SelectTrigger className="!h-10 w-full text-sm border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User optional */}
            <div className="w-52">
              <label className="text-xs text-gray-500 mb-1 block">
                User (optional)
              </label>
              <Input
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setSelected([]);
                }}
                className="h-10 text-sm border-gray-200"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("unresolved");
                setSeverityFilter("all");
                setUserFilter("");
                setSelected([]);
              }}
              className="h-10 px-4 text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
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
                  className="px-4 py-3 text-left text-xs font-semibold text-[#8B8B8B] tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flags.map((flag) => (
              <tr key={flag.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selected.includes(flag.id)}
                    onCheckedChange={() => toggleOne(flag.id)}
                  />
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {flag.account}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {flag.island}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{flag.role}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{flag.plan}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={flag.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {flag.listings}
                </td>
                <td className="px-4 py-4">
                  <button className="text-sm font-semibold text-[#e53935] hover:text-[#c62828] transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No Security Flags Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Flag Modal ── */}
      <CreateSecurityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          refetch();
          setModalOpen(false);
        }}
      />
    </div>
  );
}

export default SecurityPage;
