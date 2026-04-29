"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Mail,
  Phone,
  Home,
  Save,
  CheckCircle,
  Send,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  }>;
}

interface InquiriesResponse {
  inquiries: InquiryListItem[];
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    new: "bg-green-100 text-green-600",
    replied: "bg-blue-100 text-blue-600",
    closed: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-bold">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function InquiresManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [replyText, setReplyText] = useState("");

  const { data: allInquires, refetch } = useQuery({
    queryKey: ["all-inquires", token],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/inquiries/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      return json.data as InquiriesResponse;
    },
  });

  const inquiries = useMemo(() => allInquires?.inquiries || [], [allInquires]);

  useEffect(() => {
    if (!selectedId && inquiries.length > 0) setSelectedId(inquiries[0]._id);
  }, [inquiries, selectedId]);

  const selected = useMemo(
    () => inquiries.find((i) => i._id === selectedId) ?? null,
    [inquiries, selectedId],
  );

  // Mutation for Internal Notes (Save Button)
  const noteMutation = useMutation({
    mutationFn: async () => {
      if (!noteText.trim()) throw new Error("Please write a note");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/inquiries/admin/${selectedId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note: noteText }),
        },
      );
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Internal note saved");
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["all-inquires"] });
    },
  });

  // Mutation for Customer Reply (Reply Button)
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!replyText.trim()) throw new Error("Please write a reply message");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/inquiries/${selectedId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyText }),
        },
      );
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reply sent to customer");
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["all-inquires"] });
    },
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-8 container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Inquiry Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage property leads and customer communication.
        </p>
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-6">
        {/* Left Sidebar: Inquiry List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <span className="text-sm font-bold text-gray-700">All Leads</span>
            <button
              onClick={() => {
                setRefreshing(true);
                refetch().then(() => setRefreshing(false));
              }}
              className="p-2 hover:bg-white rounded-lg border transition-all shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                onClick={() => setSelectedId(inquiry._id)}
                className={`p-4 cursor-pointer transition-all ${selectedId === inquiry._id ? "bg-blue-50/50 border-r-4 border-blue-500" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-gray-900 truncate w-40">
                    {inquiry.fullName || "N/A"}
                  </h4>
                  <StatusBadge
                    status={(inquiry.status || "new") as InquiryStatus}
                  />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" /> {inquiry.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {inquiry.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Details and Actions */}
        <div className="space-y-6 overflow-y-auto h-[calc(100vh-200px)] pr-2">
          {selected ? (
            <>
              {/* Customer Info Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                  Lead Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="Full Name" value={selected.fullName} />
                  <InfoBox
                    label="Property Interested"
                    value={
                      selected.property?.basicInformation?.propertyTitle ||
                      "General Inquiry"
                    }
                  />
                  <InfoBox label="Email Address" value={selected.email} />
                  <InfoBox label="Phone Number" value={selected.phone} />
                </div>
                <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">
                    Customer Message
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{selected.message || "No message provided."}"
                  </p>
                </div>
              </div>

              {/* Action Tabs: Reply and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reply Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-gray-800">
                      Reply to Customer
                    </h3>
                  </div>
                  <Textarea
                    placeholder="Type your email response here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 min-h-[120px] mb-4 bg-gray-50 focus:bg-white transition-all border-gray-200"
                  />
                  <button
                    onClick={() => replyMutation.mutate()}
                    disabled={replyMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100"
                  >
                    {replyMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Reply
                  </button>
                </div>

                {/* Internal Notes Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Save className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-gray-800">
                      Internal Admin Notes
                    </h3>
                  </div>
                  <Textarea
                    placeholder="Private notes for the team..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 min-h-[120px] mb-4 bg-gray-50 focus:bg-white transition-all border-gray-200"
                  />
                  <button
                    onClick={() => noteMutation.mutate()}
                    disabled={noteMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
                  >
                    {noteMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Save Note
                  </button>
                </div>
              </div>

              {/* History Section: Displaying Last Note/Reply */}
              {(selected.replies?.length || selected.adminNotes?.length) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-gray-400" /> Activity
                    History
                  </h3>
                  <div className="space-y-4">
                    {selected.replies?.slice(-1).map((r) => (
                      <div
                        key={r._id}
                        className="flex gap-3 items-start p-3 bg-blue-50/30 rounded-lg border border-blue-100"
                      >
                        <div className="bg-blue-500 p-1.5 rounded-full mt-1">
                          <Send className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-blue-600 uppercase">
                            Last Sent Reply
                          </p>
                          <p className="text-sm text-gray-700">{r.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(r.repliedAt).toLocaleString("en-GB")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {selected.adminNotes?.slice(-1).map((n) => (
                      <div
                        key={n._id}
                        className="flex gap-3 items-start p-3 bg-emerald-50/30 rounded-lg border border-emerald-100"
                      >
                        <div className="bg-emerald-500 p-1.5 rounded-full mt-1">
                          <Save className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-emerald-600 uppercase">
                            Latest Admin Note
                          </p>
                          <p className="text-sm text-gray-700">{n.note}</p>
                          {n.addedAt && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.addedAt).toLocaleString("en-GB")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
              Select an inquiry to view details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InquiresManagement;
