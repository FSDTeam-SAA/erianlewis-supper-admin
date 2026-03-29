"use client";

import React, { useState } from "react";
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

// ── Types ─────────────────────────────────────────────────────────────────────
type InquiryStatus = "New" | "Contacted" | "Closed";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  properties: number;
  status: InquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const mockInquiries: Inquiry[] = [
  {
    id: 1,
    name: "Erian Lewis",
    email: "erianlewisbusiness@gmail.com",
    phone: "+888 345 3455",
    properties: 3,
    status: "New",
    notes: "",
    createdAt: "1/18/2026, 1:02:02 PM",
    updatedAt: "2/23/2026, 11:33:01 AM",
  },
];

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    New: "bg-green-100 text-green-600",
    Contacted: "bg-blue-100 text-blue-600",
    Closed: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ── Detail Info Box ───────────────────────────────────────────────────────────
function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function InquiresManagement() {
  const [notifyEmail, setNotifyEmail] = useState(
    "erianlewisbusiness@gmail.com"
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<Inquiry>) => {
    if (!selectedId) return;
    setInquiries((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, ...patch } : i))
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const handleSaveDetails = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 container mx-auto">
      {/* ── Page Header ── */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Management Inquiries
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Leads from &quot;Let us list for you&quot; (List Your Property page).
      </p>

      {/* ── Notify Emails Card ── */}
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

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-[380px_1fr] gap-5">
        {/* ── Left: Inquiries List ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* List Header */}
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

          {/* Inquiry Items */}
          <div className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => setSelectedId(inquiry.id)}
                className={`px-5 py-4 cursor-pointer transition-colors ${
                  selectedId === inquiry.id
                    ? "bg-red-50 border-l-4 border-l-red-400"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {inquiry.name}
                  </p>
                  <StatusBadge status={inquiry.status} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {inquiry.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {inquiry.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Home className="w-3 h-3 text-gray-400" />
                    {inquiry.properties} Properties
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 mt-2 text-right">
                  {inquiry.createdAt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Details Panel ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-900">Details</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Update status + notes so your team stays aligned.
              </p>
            </div>
            <button
              onClick={handleSaveDetails}
              className={`flex items-center gap-1.5 px-5 h-9 text-sm font-medium rounded-lg transition-colors ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-[#e53935] hover:bg-[#c62828] text-white"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {saved ? "Saved!" : "Save"}
            </button>
          </div>

          {selected ? (
            <>
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoBox label="Name" value={selected.name} />
                <InfoBox label="Properties" value={selected.properties} />
                <InfoBox label="Email" value={selected.email} />
                <InfoBox label="Phone" value={selected.phone} />
              </div>

              {/* Status */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </p>
                <Select
                  value={selected.status}
                  onValueChange={(v) =>
                    updateSelected({ status: v as InquiryStatus })
                  }
                >
                  <SelectTrigger className="h-11 text-sm border-gray-200 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Internal Notes */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Internal notes
                </p>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={selected.notes}
                  onChange={(e) => updateSelected({ notes: e.target.value })}
                  className="min-h-[130px] text-sm border-gray-200 resize-none"
                />
              </div>

              {/* Timestamps */}
              <p className="text-xs text-gray-400">
                Created: {selected.createdAt} · Updated: {selected.updatedAt}
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