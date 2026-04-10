"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

type ExportType = "accounts" | "listings" | "revenue" | "audit-logs";

interface ExportApiResponse {
  status: boolean;
  message: string;
  data: unknown;
}

interface RecentExportItem {
  _id: string;
  createdAt: string;
  actor?: {
    email?: string;
    userId?: {
      email?: string;
    };
  };
  entity?: {
    label?: string;
  };
  details?: {
    count?: number;
  };
}

const exportCards: Array<{
  key: ExportType;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    key: "accounts",
    title: "All Accounts",
    description: "Export all user accounts with profile information",
    icon: "👤",
  },
  {
    key: "listings",
    title: "All Listings",
    description: "Export all property listings with Owner Details",
    icon: "🏠",
  },
  {
    key: "revenue",
    title: "Revenue Data",
    description: "Export subscription and revenue information",
    icon: "💰",
  },
  {
    key: "audit-logs",
    title: "Audit Logs",
    description: "Export complete system audit trail",
    icon: "📋",
  },
];

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatDate(iso?: string) {
  if (!iso) return "N/A";
  const date = new Date(iso);
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

function DataExport() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const { data: recentExports = [], refetch: refetchRecent } = useQuery({
    queryKey: ["recent-exports", token],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/export/recent`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch recent exports");
      }

      return (json.data || []) as RecentExportItem[];
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (exportType: ExportType) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/export/${exportType}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = (await res.json()) as ExportApiResponse;
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Export failed");
      }

      return { exportType, data: json.data };
    },
    onSuccess: () => {
      refetchRecent();
    },
  });

  const handleExport = async (exportType: ExportType) => {
    const payload = await exportMutation.mutateAsync(exportType);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJsonFile(`${payload.exportType}-${timestamp}.json`, payload.data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Data & Reporting Exports</h1>
          <p className="text-sm text-gray-600 mt-1">
            Export raw platform data for analysis, compliance, and reporting. All exports are logged in the audit trail.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exportCards.map((card) => {
            const isCurrent =
              exportMutation.isPending && exportMutation.variables === card.key;

            return (
              <div key={card.key} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport(card.key)}
                  disabled={exportMutation.isPending}
                  className="w-full bg-[#DC2626] hover:bg-[#DC2626]/80 transition-colors text-white font-medium py-2 px-6 rounded-[8px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Download />
                  {isCurrent ? "Exporting..." : "Export JSON"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Recent Exports Section */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Exports</h3>
              <p className="text-sm text-gray-600">Pulled from the audit trail.</p>
            </div>
            <button
              onClick={() => refetchRecent()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="border border-dashed border-gray-300 rounded-xl py-6 px-4 text-center">
            {recentExports.length === 0 ? (
              <p className="text-gray-500">No Export logs yet.</p>
            ) : (
              <div className="space-y-3 text-left">
                {recentExports.map((item) => (
                  <div key={item._id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {item.entity?.label || "Data Export"}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDate(item.createdAt)} • {item.actor?.email || item.actor?.userId?.email || "system"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Records: {item.details?.count ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <strong>Note:</strong> Exported data may contain sensitive information. Handle exports securely and in compliance with data protection regulations.
        </div>
      </div>
    </div>
  );
}

export default DataExport;
