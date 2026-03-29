"use client";

import React, { useState } from "react";
import { Search, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteListingModal } from "@/components/modal/DeleteModal";
import { DisableListingModal } from "@/components/modal/DisableModal";

interface Listing {
  id: number;
  property: string;
  subtitle: string;
  island: string;
  ownerName: string;
  ownerEmail: string;
  type: string;
  price: string;
  status: "active" | "draft" | "suspended";
  views: number;
}

const mockListings: Listing[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  property: "Saharaj",
  subtitle: "Testing",
  island: "Aruba",
  ownerName: "waqas ahmed",
  ownerEmail: "waqas00@gmail.com",
  type: "Rental",
  price: "$567.67",
  status: i === 1 ? "draft" : "active",
  views: 0,
}));

function StatusBadge({ status }: { status: Listing["status"] }) {
  const styles = {
    active: "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]",
    draft: "bg-[#fce4ec] text-[#c62828] border border-[#f8bbd0]",
    suspended: "bg-[#f5f5f5] text-[#757575] border border-[#e0e0e0]",
  };
  const labels = {
    active: "visible",
    draft: "Hidden",
    suspended: "Suspended",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function ReviewPage() {
  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [perPage, setPerPage] = useState("50");
  const [selected, setSelected] = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>(mockListings);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  const [disableModal, setDisableModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });

  const openDeleteModal = (listing: Listing) =>
    setDeleteModal({ isOpen: true, id: listing.id, name: listing.property });

  const openDisableModal = (listing: Listing) =>
    setDisableModal({ isOpen: true, id: listing.id });

  const handleDeleteConfirm = (id: number) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSelected((prev) => prev.filter((s) => s !== id));
  };

  const handleDisableConfirm = (id: number, reason: string) => {
    console.log(`Listing ${id} disabled. Reason: ${reason}`);
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "suspended" } : l))
    );
  };

  const filtered = listings.filter((a) => {
    const matchSearch =
      a.property.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchVisibility =
      visibility === "all" ||
      (visibility === "visible" && a.status === "active") ||
      (visibility === "hidden" && a.status === "draft") ||
      (visibility === "suspended" && a.status === "suspended");
    return matchSearch && matchVisibility;
  });

  const allSelected =
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((a) => a.id));
  };

  const toggleOne = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Listings (Rentals Only)
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} total &nbsp;•&nbsp; Page 1 of 1
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-3 mt-5 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Property title, address, user email, comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-sm border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          <div className="w-44">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select value={island} onValueChange={setIsland}>
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                <SelectItem value="aruba">Aruba</SelectItem>
                <SelectItem value="anguilla">Anguilla</SelectItem>
                <SelectItem value="bahamas">Bahamas</SelectItem>
                <SelectItem value="barbados">Barbados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">
              Visibility
            </label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Visible + Hidden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visible + Hidden</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing up to {perPage} per page</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Per page</span>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="!h-9 w-20 text-sm border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="w-10 px-4 py-3.5">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {[
                "WHEN",
                "LISTING",
                "USER",
                "RATING",
                "COMMENT",
                "STATUS",
                "ACTIONS",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3.5 text-left text-xs font-semibold text-[#9e9e9e] tracking-wider uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.map((listing) => (
              <tr
                key={listing.id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selected.includes(listing.id)}
                    onCheckedChange={() => toggleOne(listing.id)}
                  />
                </td>

                {/* WHEN */}
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  13/03/2026, 21:34:45
                </td>

                {/* LISTING */}
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-[#e53935] hover:underline cursor-pointer">
                    {listing.property}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{listing.island}</p>
                </td>

                {/* USER */}
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-700">{listing.ownerEmail}</p>
                </td>

                {/* RATING */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">5/5</span>
                  </div>
                </td>

                {/* COMMENT */}
                <td className="px-4 py-4 text-sm text-gray-400">–</td>

                {/* STATUS */}
                <td className="px-4 py-4">
                  <StatusBadge status={listing.status} />
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {/* Unhide / Hide toggle */}
                    {listing.status === "draft" ? (
                      <button
                        onClick={() => openDisableModal(listing)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Unhide
                      </button>
                    ) : (
                      <button
                        onClick={() => openDisableModal(listing)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide
                      </button>
                    )}

                    {/* View details */}
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      View details
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => openDeleteModal(listing)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e53935] text-xs font-medium text-white hover:bg-[#c62828] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No listings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Delete Modal ── */}
      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDeleteConfirm}
      />

      {/* ── Disable Modal ── */}
      <DisableListingModal
        isOpen={disableModal.isOpen}
        listingId={disableModal.id}
        onClose={() => setDisableModal({ isOpen: false, id: null })}
        onConfirm={handleDisableConfirm}
      />
    </div>
  );
}

export default ReviewPage;