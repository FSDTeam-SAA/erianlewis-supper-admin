"use client";

import React, { useState } from "react";
import { Search, ChevronRight, Calendar } from "lucide-react";
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
type LogType = "inquiry" | "Appointment" | "Inquiry response";

interface CommLog {
  id: number;
  timestamp: string;
  type: LogType;
  who: string;
  subject: string;
  message: string;
}

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: LogType }) {
  const styles: Record<LogType, string> = {
    inquiry: "bg-blue-100 text-blue-500",
    Appointment: "bg-cyan-100 text-cyan-600",
    "Inquiry response": "bg-green-100 text-green-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[type]}`}
    >
      {type}
    </span>
  );
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const typeSequence: LogType[] = [
  "inquiry",
  "Appointment",
  "Inquiry response",
  "inquiry",
  "inquiry",
  "inquiry",
  "inquiry",
  "Appointment",
  "Appointment",
  "Appointment",
  "Appointment",
  "Inquiry response",
  "Inquiry response",
  "Inquiry response",
  "Appointment",
  "Appointment",
  "Appointment",
  "inquiry",
  "inquiry",
];

const messageMap: Record<LogType, string> = {
  inquiry: "I'm interest",
  Appointment: "Testing",
  "Inquiry response": "Dewe",
};

const mockLogs: CommLog[] = Array.from({ length: 10 }, (_, i) => {
  const type = typeSequence[i % typeSequence.length];
  return {
    id: i + 1,
    timestamp: "23/02/2024, 12:34:45",
    type,
    who: "Moon sky - xyz@gmail.com",
    subject: "Appointment request",
    message: messageMap[type],
  };
});

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

// ── Main Component ────────────────────────────────────────────────────────────
function CommunicationLog() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [dateRange, setDateRange] = useState("");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      search === "" ||
      log.who.toLowerCase().includes(search.toLowerCase()) ||
      log.subject.toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase());
    const matchType =
      type === "all" || log.type.toLowerCase() === type.toLowerCase();
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / Number(perPage)));
  const paginated = filtered.slice(
    (page - 1) * Number(perPage),
    page * Number(perPage)
  );

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Communication Log
        </h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {filtered.length} total &nbsp;•&nbsp; Page {page} of {totalPages}
        </p>

        {/* Filters */}
        <div className="flex items-end gap-3 mb-5">
          {/* Search */}
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">
              Search (visitor, owner, sender, email or property)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="e.g.erian, erian@gmail.com"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          {/* Type */}
          <div className="w-52">
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="inquiry response">
                  Inquiry Response
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="w-52">
            <label className="text-xs text-gray-500 mb-1 block">
              Date range
            </label>
            <div className="relative">
              <Input
                placeholder="dd/mm/yyyy"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-11 text-sm border-gray-200 pr-9 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
              {["WHEN", "TYPE", "WHO", "SUBJECT", "MESSAGE"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-xs font-semibold text-[#8B8B8B] tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginated.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                {/* WHEN */}
                <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                  {log.timestamp}
                </td>

                {/* TYPE badge */}
                <td className="px-5 py-3.5">
                  <TypeBadge type={log.type} />
                </td>

                {/* WHO */}
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {log.who}
                </td>

                {/* SUBJECT */}
                <td className="px-5 py-3.5 text-sm text-gray-700">
                  {log.subject}
                </td>

                {/* MESSAGE */}
                <td className="px-5 py-3.5">
                  <button className="flex items-center gap-1 text-sm font-semibold text-[#e53935] hover:text-[#c62828] transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {log.message}
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
                  No communication logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CommunicationLog;