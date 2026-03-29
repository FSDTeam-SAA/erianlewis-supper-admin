"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  actionColor: string;
  entity: string;
  actor: string;
  details: string;
}

// ── Action Badge Colors ───────────────────────────────────────────────────────
const actionStyle: Record<string, string> = {
  "data export": "bg-blue-100 text-blue-600",
  "Account deleted": "bg-red-100 text-red-500",
  "legal documents updated": "bg-purple-100 text-purple-600",
  "superadmin auto mode updated": "bg-orange-100 text-orange-600",
  "listing deleted": "bg-red-100 text-red-500",
};

function getActionStyle(action: string) {
  return actionStyle[action] ?? "bg-blue-100 text-blue-600";
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const actions = [
  "data export",
  "Account deleted",
  "legal documents updated",
  "superadmin auto mode updated",
  "listing deleted",
];

const mockLogs: AuditLog[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  timestamp: "23/02/2024, 12:34:45",
  action: i === 1 ? "Account deleted"
    : i === 2 ? "legal documents updated"
    : i === 3 ? "superadmin auto mode updated"
    : i === 4 ? "listing deleted"
    : "data export",
  actionColor: "",
  entity: "accounts #N/A",
  actor: "xyz@gmail.com",
  details: "View Changes",
}));

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

// ── Main Component ────────────────────────────────────────────────────────────
function AuditLogs() {
  const [entityType, setEntityType] = useState("all");
  const [actionType, setActionType] = useState("all");
  const [island, setIsland] = useState("");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = mockLogs.filter((log) => {
    const matchAction = actionType === "all" || log.action === actionType;
    return matchAction;
  });

  const totalPages = Math.ceil(filtered.length / Number(perPage));
  const paginated = filtered.slice(
    (page - 1) * Number(perPage),
    page * Number(perPage)
  );

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {filtered.length} total &nbsp;•&nbsp; Page {page} of {totalPages}
        </p>

        {/* Filters row */}
        <div className="flex items-end gap-3 mb-5">
          {/* Entity Type */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              Entity Type
            </label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="accounts">Accounts</SelectItem>
                <SelectItem value="listings">Listings</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Type */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              Action Type
            </label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Island search */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <div className="relative">
              <Input
                placeholder="e.g. Aruba"
                value={island}
                onChange={(e) => setIsland(e.target.value)}
                className="h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
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
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
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
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginated.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Timestamp */}
                <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                  {log.timestamp}
                </td>

                {/* Action badge */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getActionStyle(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>

                {/* Entity */}
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {log.entity}
                </td>

                {/* Actor */}
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {log.actor}
                </td>

                {/* Details */}
                <td className="px-5 py-3.5">
                  <button className="flex items-center gap-1 text-sm font-semibold text-[#e53935] hover:text-[#c62828] transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                    View Changes
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
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