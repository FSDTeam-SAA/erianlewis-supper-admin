"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Mail,
  Phone,
  Home,
  Save,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type InquiryStatus = "new" | "replied" | "closed";

interface InquiryListItem {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: InquiryStatus;
  createdAt?: string;
  updatedAt?: string;
  property?: {
    basicInformation?: { propertyTitle?: string };
    location?: { island?: string | { _id?: string; name?: string } | null };
  } | null;
  replies?: Array<{
    _id: string;
    message: string;
    repliedAt: string;
    repliedBy?: { firstName?: string; lastName?: string } | null;
  }>;
  adminNotes?: Array<{
    _id: string;
    note: string;
    addedAt?: string;
    addedBy?: { firstName?: string; lastName?: string } | null;
  }>;
}

interface InquiriesResponse {
  inquiries: InquiryListItem[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    new: "bg-green-100 text-green-600",
    replied: "bg-blue-100 text-blue-600",
    closed: "bg-gray-100 text-gray-500",
  };
  const labels: Record<InquiryStatus, string> = {
    new: "New",
    replied: "Replied",
    closed: "Closed",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function InquiresManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [notifyEmail, setNotifyEmail] = useState(
    "erianlewisbusiness@gmail.com"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noteText, setNoteText] = useState("");

  const { data: allInquires, refetch } = useQuery({
    queryKey: ["all-inquires", token],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/inquiries/admin/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch inquiries");
      }
      return json.data as InquiriesResponse;
    },
  });

  const inquiries = useMemo(() => allInquires?.inquiries || [], [allInquires?.inquiries]);

  useEffect(() => {
    if (!selectedId && inquiries.length > 0) {
      setSelectedId(inquiries[0]._id);
    }
  }, [inquiries, selectedId]);

  const selected = useMemo(
    () => inquiries.find((i) => i._id === selectedId) ?? null,
    [inquiries, selectedId]
  );

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No inquiry selected");
      const note = noteText.trim();
      if (!note) throw new Error("Please write a note before reply");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/inquiries/admin/${selectedId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to send reply");
      }
      return json;
    },
    onSuccess: async () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setNoteText("");
      toast.success("Reply sent successfully");
      await queryClient.invalidateQueries({ queryKey: ["all-inquires"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const selectedStatus = (selected?.status || "new") as InquiryStatus;
  const selectedCreatedAt = selected?.createdAt
    ? new Date(selected.createdAt).toLocaleString("en-GB")
    : "N/A";
  const selectedUpdatedAt = selected?.updatedAt
    ? new Date(selected.updatedAt).toLocaleString("en-GB")
    : "N/A";
  const propertyTitle = selected?.property?.basicInformation?.propertyTitle || "N/A";
  const latestReply = selected?.replies?.length
    ? selected.replies[selected.replies.length - 1]?.message
    : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8 container mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Management Inquiries
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Leads from &quot;Let us list for you&quot; (List Your Property page).
      </p>

      <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-5 flex items-center justify-between gap-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Notify emails
          </p>
          <p className="text-xs text-gray-400">
            Enter one or more emails (comma separated). We&apos;ll email these
            when a new inquiry arrives.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Input
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            className="w-72 h-10 text-sm border-gray-200"
          />
          <button className="flex items-center gap-1.5 px-5 h-10 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-5">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-220px)] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Inquiries</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                onClick={() => setSelectedId(inquiry._id)}
                className={`px-5 py-4 cursor-pointer transition-colors ${
                  selectedId === inquiry._id
                    ? "bg-red-50 border-l-4 border-l-red-400"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {inquiry.fullName || "N/A"}
                  </p>
                  <StatusBadge status={(inquiry.status || "new") as InquiryStatus} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {inquiry.email || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {inquiry.phone || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Home className="w-3 h-3 text-gray-400" />
                    1 Property
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 mt-2 text-right">
                  {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString("en-GB") : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-900">Details</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Update status + notes so your team stays aligned.
              </p>
            </div>
            <button
              onClick={() => replyMutation.mutate()}
              className={`flex items-center gap-1.5 px-5 h-9 text-sm font-medium rounded-lg transition-colors ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-[#e53935] hover:bg-[#c62828] text-white"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {saved ? "Sent!" : "Reply"}
            </button>
          </div>

          {selected ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoBox label="Name" value={selected.fullName || "N/A"} />
                <InfoBox label="Property" value={propertyTitle} />
                <InfoBox label="Email" value={selected.email || "N/A"} />
                <InfoBox label="Phone" value={selected.phone || "N/A"} />
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </p>
                <Select value={selectedStatus}>
                  <SelectTrigger className="h-11 text-sm border-gray-200 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Internal notes
                </p>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[130px] text-sm border-gray-200 resize-none"
                />
                {!!latestReply && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last reply: {latestReply}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Created: {selectedCreatedAt} · Updated: {selectedUpdatedAt}
              </p>
            </>
          ) : (
            <div className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400">
              Pick an inquiry from list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InquiresManagement;
