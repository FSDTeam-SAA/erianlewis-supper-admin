"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Search, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
  messageRaw: unknown;
}

function TypeBadge({ type }: { type: LogType }) {
  const styles: Record<LogType, string> = {
    inquiry: "bg-blue-100 text-blue-600",
    appointment: "bg-cyan-100 text-cyan-600",
    inquiry_response: "bg-green-100 text-green-600",
  };

  const labels: Record<LogType, string> = {
    inquiry: "Inquiry",
    appointment: "Appointment",
    inquiry_response: "Inquiry Response",
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
  if (who.name) return `${who.name} - ${who.email || "N/A"}`;
  const fullName = `${who.firstName || ""} ${who.lastName || ""}`.trim();
  return `${fullName || "N/A"} - ${who.email || "N/A"}`;
}

function CommunicationLog() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const searchParams = useSearchParams();

  // Get initial search value from URL
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Sync with URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams, search]);

  const { data: communicationData, isLoading } = useQuery({
    queryKey: [
      "communication",
      token,
      page,
      perPage,
      search,
      type,
      selectedDate,
    ],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);

      if (search.trim()) params.set("search", search.trim());
      if (type !== "all") params.set("type", type);

      if (selectedDate) {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        params.set("startDate", dateStr);
        params.set("endDate", dateStr);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/communication-logs?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
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
        messageRaw: log.message ?? null,
      })),
    [communicationData?.logs],
  );

  const totalData = communicationData?.paginationInfo?.totalData ?? 0;
  const currentPage = communicationData?.paginationInfo?.currentPage ?? page;
  const totalPages = communicationData?.paginationInfo?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-8">
      {/* Filter Card */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Communication Log
        </h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {totalData} total • Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-end gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[280px]">
            <label className="text-xs text-gray-500 mb-1 block">
              Search (visitor, owner, sender, email or property)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="e.g. erian, erian@gmail.com"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11 text-sm border-gray-200"
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
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="inquiry_response">
                  Inquiry Response
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="w-60">
            <label className="text-xs text-gray-500 mb-1 block">
              Select Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-11 w-full justify-start text-left font-normal border-gray-200 ${
                    !selectedDate && "text-gray-400"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setPage(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Pagination Controls */}
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

      {/* Table */}
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
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </td>
                  </tr>
                ))
              : paginated.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors align-top"
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap align-top">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <TypeBadge type={log.type} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 align-top">
                      {log.who}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 align-top">
                      {log.subject}
                    </td>

                    {/* Message Column */}
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
                          View Message
                        </button>

                        {expandedLogId === log.id && (
                          <div className="max-h-96 overflow-auto rounded-md bg-[#F3F4F6] p-4 border border-gray-200">
                            <pre className="text-sm text-[#475467] whitespace-pre-wrap break-words">
                              {typeof log.messageRaw === "string"
                                ? (() => {
                                    try {
                                      return JSON.stringify(
                                        JSON.parse(log.messageRaw),
                                        null,
                                        2,
                                      );
                                    } catch {
                                      return log.messageRaw || "N/A";
                                    }
                                  })()
                                : log.messageRaw
                                  ? JSON.stringify(log.messageRaw, null, 2)
                                  : "N/A"}
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
