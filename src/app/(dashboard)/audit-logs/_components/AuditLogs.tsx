"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface IslandOption {
  _id: string;
  name: string;
}

interface AuditLogItem {
  _id: string;
  action: string;
  actor?: {
    email?: string;
  };
  entity?: {
    label?: string;
  };
  details?: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogsResponse {
  logs: AuditLogItem[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface AuditLogRow {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  actor: string;
  detailsRaw: Record<string, unknown>;
}

const actionStyle: Record<string, string> = {
  data_export: "bg-blue-100 text-blue-600",
  account_deleted: "bg-red-100 text-red-500",
  legal_documents_updated: "bg-purple-100 text-purple-600",
  config_updated: "bg-orange-100 text-orange-600",
  listing_deleted: "bg-red-100 text-red-500",
};

function getActionStyle(action: string) {
  return actionStyle[action] ?? "bg-blue-100 text-blue-600";
}

const actions = [
  "data_export",
  "account_deleted",
  "legal_documents_updated",
  "config_updated",
  "listing_deleted",
  "account_activated",
  "account_suspended",
  "listing_disabled",
  "listing_enabled",
  "security_flag_created",
  "security_flag_resolved",
  "plan_created",
  "plan_updated",
  "plan_deleted",
  "island_created",
  "island_updated",
  "island_deleted",
  "review_hidden",
  "review_visible",
  "inquiry_deleted",
];

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

function formatActionLabel(action: string) {
  return action.replaceAll("_", " ");
}

function formatTimestamp(isoDate?: string) {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function AuditLogs() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [entityType, setEntityType] = useState("all");
  const [actionType, setActionType] = useState("all");
  const [island, setIsland] = useState(""); // এটি এখনো string (free text) রাখলাম
  const [selectedIslandId, setSelectedIslandId] = useState(""); // নতুন: Select এর জন্য ID
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Islands fetch
  const { data: islandsData = [] } = useQuery({
    queryKey: ["island-options", token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      return (json?.data?.islands || []) as IslandOption[];
    },
  });

  const { data: auditData, isLoading } = useQuery({
    queryKey: ["audit", token, page, perPage, entityType, actionType, island],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (entityType !== "all") params.set("entityType", entityType);
      if (actionType !== "all") params.set("action", actionType);
      if (island.trim()) params.set("island", island.trim());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/audit-logs?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch audit logs");
      }

      return json.data as AuditLogsResponse;
    },
  });

  const paginated: AuditLogRow[] = useMemo(
    () =>
      (auditData?.logs || []).map((log) => ({
        id: log._id,
        timestamp: formatTimestamp(log.createdAt),
        action: log.action,
        entity: log.entity?.label || "N/A",
        actor: log.actor?.email || "N/A",
        detailsRaw: log.details || {},
      })),
    [auditData?.logs],
  );

  const totalData = auditData?.paginationInfo?.totalData ?? 0;
  const totalPages = auditData?.paginationInfo?.totalPages ?? 1;
  const currentPage = auditData?.paginationInfo?.currentPage ?? page;

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
        </p>

        {/* Filters row */}
        <div className="flex items-end gap-3 mb-5">
          {/* Entity Type */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              Entity Type
            </label>
            <Select
              value={entityType}
              onValueChange={(value) => {
                setEntityType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="user">Accounts</SelectItem>
                <SelectItem value="property">Listings</SelectItem>
                <SelectItem value="platform_config">Platform Config</SelectItem>
                <SelectItem value="security_flag">Security Flags</SelectItem>
                <SelectItem value="plan">Plan</SelectItem>

                {/* Optional: Baki gulo thakte pare jodi dorkar hoy */}
                {/* <SelectItem value="legal_documents">Legal Documents</SelectItem>
                <SelectItem value="island">Island</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Action Type */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              Action Type
            </label>
            <Select
              value={actionType}
              onValueChange={(value) => {
                setActionType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>

                {/* System & Data */}
                <SelectItem value="data_export">Data Export</SelectItem>
                <SelectItem value="config_updated">Config Updated</SelectItem>

                {/* Account Management */}
                <SelectItem value="account_activated">
                  Account Activated
                </SelectItem>
                <SelectItem value="account_suspended">
                  Account Suspended
                </SelectItem>
                <SelectItem value="account_deleted">Account Deleted</SelectItem>

                {/* Listing Management */}
                <SelectItem value="listing_enabled">Listing Enabled</SelectItem>
                <SelectItem value="listing_disabled">
                  Listing Disabled
                </SelectItem>
                <SelectItem value="listing_deleted">Listing Deleted</SelectItem>

                {/* Security Flags */}
                <SelectItem value="security_flag_created">
                  Security Flag Created
                </SelectItem>
                <SelectItem value="security_flag_resolved">
                  Security Flag Resolved
                </SelectItem>

                {/* Subscription Plans */}
                <SelectItem value="plan_created">Plan Created</SelectItem>
                <SelectItem value="plan_updated">Plan Updated</SelectItem>
                <SelectItem value="plan_deleted">Plan Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Island Select */}
          {/* Island Select */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select
              value={selectedIslandId || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedIslandId("");
                  setIsland(""); // island parameter খালি
                } else {
                  setSelectedIslandId(value);
                  setIsland(value); // ← এখানে ID পাঠাবে (সবচেয়ে গুরুত্বপূর্ণ পরিবর্তন)
                }
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {islandsData.map((islandItem) => (
                  <SelectItem key={islandItem._id} value={islandItem._id}>
                    {islandItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing up to {perPage} per page
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Per page</span>
            <Select
              value={perPage}
              onValueChange={(v) => {
                setPerPage(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-9 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["TIMESTAMP", "ACTION", "ENTITY", "ACTOR", "DETAILS"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold text-[#8B8B8B] tracking-wide"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-6 w-28 rounded-md" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                  </tr>
                ))
              : paginated.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors align-top"
                  >
                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap align-top">
                      {log.timestamp}
                    </td>

                    {/* Action badge */}
                    <td className="px-5 py-3.5 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getActionStyle(
                          log.action,
                        )}`}
                      >
                        {formatActionLabel(log.action)}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-5 py-3.5 text-sm text-gray-700 align-top">
                      {log.entity}
                    </td>

                    {/* Actor */}
                    <td className="px-5 py-3.5 text-sm text-gray-700 align-top">
                      {log.actor}
                    </td>

                    {/* Details */}
                    <td className="px-5 py-3.5 align-top">
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setExpandedLogId((current) =>
                              current === log.id ? null : log.id,
                            )
                          }
                          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#e53935] hover:text-[#c62828] transition-colors"
                        >
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              expandedLogId === log.id ? "rotate-90" : ""
                            }`}
                          />
                          View Changes
                        </button>

                        {expandedLogId === log.id && (
                          <div className="rounded-md bg-[#F3F4F6] p-3">
                            <pre className="text-sm text-[#475467] whitespace-pre-wrap">
                              {JSON.stringify(log.detailsRaw, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

            {!isLoading && paginated.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-gray-400"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;
