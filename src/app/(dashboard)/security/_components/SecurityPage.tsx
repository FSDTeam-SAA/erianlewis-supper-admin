"use client";

import React, { useState } from "react";
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

// ── Types ─────────────────────────────────────────────────────────────────────
// type Severity = "Low" | "Medium" | "High" | "Critical";
type FlagStatus = "open" | "resolved";

interface SecurityFlag {
  id: number;
  account: string;
  island: string;
  role: string;
  plan: string;
  status: FlagStatus;
  listings: number;
}

const mockFlags: SecurityFlag[] = [];

// ── Status Badge ──────────────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────────────────
function SecurityPage() {
  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("52");
  const [flags, setFlags] = useState<SecurityFlag[]>(mockFlags);
  const [selected, setSelected] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = flags.filter((f) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "unresolved" && f.status === "open") ||
      (statusFilter === "resolved" && f.status === "resolved");
    return matchStatus;
  });

  const allSelected =
    filtered.length > 0 && filtered.every((f) => selected.includes(f.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((f) => f.id));
  };

  const toggleOne = (id: number) =>
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
              {openCount} open/ {flags.length} total &nbsp;•&nbsp; user #52
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlags(mockFlags)}
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
                onChange={(e) => setUserFilter(e.target.value)}
                className="h-10 text-sm border-gray-200"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("unresolved");
                setSeverityFilter("all");
                setUserFilter("52");
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
            {filtered.map((flag) => (
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
            {filtered.length === 0 && (
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
        onConfirm={(flag) => {
          setFlags((prev) => [
            ...prev,
            {
              id: Date.now(),
              account: flag.userEmail,
              island: "—",
              role: "—",
              plan: "—",
              status: "open",
              listings: 0,
            },
          ]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}

export default SecurityPage;
