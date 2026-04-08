"use client";

import React, { useMemo, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type LogType = "inquiry" | "appointment" | "inquiry_response";

interface ApiPerson {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

interface ApiCommLog {
  _id: string;
  when: string;
  type: LogType;
  who?: ApiPerson;
  subject?: string;
  message?: string;
}

interface CommLogResponse {
  logs: ApiCommLog[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface CommLog {
  id: string;
  timestamp: string;
  type: LogType;
  who: string;
  subject: string;
  message: string;
}

function TypeBadge({ type }: { type: LogType }) {
  const styles: Record<LogType, string> = {
    inquiry: "bg-blue-100 text-blue-500",
    appointment: "bg-cyan-100 text-cyan-600",
    inquiry_response: "bg-green-100 text-green-600",
  };

  const labels: Record<LogType, string> = {
    inquiry: "Inquiry",
    appointment: "Appointment",
    inquiry_response: "Inquiry response",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

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

function formatWho(who?: ApiPerson) {
  if (!who) return "N/A";

  if (who.name) {
    return `${who.name} - ${who.email || "N/A"}`;
  }

  const fullName = `${who.firstName || ""} ${who.lastName || ""}`.trim();
  if (fullName || who.email) {
    return `${fullName || "N/A"} - ${who.email || "N/A"}`;
  }

  return "N/A";
}

function parseDateRange(input: string) {
  const value = input.trim();
  if (!value) return { startDate: "", endDate: "" };

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return { startDate: "", endDate: "" };

  const [, dd, mm, yyyy] = match;
  const isoDate = `${yyyy}-${mm}-${dd}`;
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { startDate: "", endDate: "" };

  return { startDate: isoDate, endDate: isoDate };
}

function CommunicationLog() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [dateRange, setDateRange] = useState("");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);

  const { data: communicationData, isLoading } = useQuery({
    queryKey: ["communication", token, page, perPage, search, type, dateRange],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (search.trim()) params.set("search", search.trim());
      if (type !== "all") params.set("type", type);

      const { startDate, endDate } = parseDateRange(dateRange);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/communication-logs?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch communication logs");
      }

      return json.data as CommLogResponse;
    },
  });

  const paginated: CommLog[] = useMemo(
    () =>
      (communicationData?.logs || []).map((log) => ({
        id: log._id,
        timestamp: formatTimestamp(log.when),
        type: log.type,
        who: formatWho(log.who),
        subject: log.subject || "N/A",
        message: log.message || "N/A",
      })),
    [communicationData?.logs]
  );

  const totalData = communicationData?.paginationInfo?.totalData ?? 0;
  const currentPage = communicationData?.paginationInfo?.currentPage ?? page;
  const totalPages = communicationData?.paginationInfo?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Communication Log
        </h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
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
                <SelectItem value="inquiry_response">
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
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setPage(1);
                }}
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

            {!isLoading && paginated.length === 0 && (
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
