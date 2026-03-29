"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
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

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Listing["status"] }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    draft: "bg-red-100 text-red-500",
    suspended: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ListingPage() {
  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [perPage, setPerPage] = useState("50");
  const [selected, setSelected] = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>(mockListings);

  // ── Delete Modal state ──
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  // ── Disable Modal state ──
  const [disableModal, setDisableModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });

  const openDeleteModal = (listing: Listing) => {
    setDeleteModal({ isOpen: true, id: listing.id, name: listing.property });
  };

  const openDisableModal = (listing: Listing) => {
    setDisableModal({ isOpen: true, id: listing.id });
  };

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
    const matchStatus = status === "all" || a.status === status;
    const matchType = type === "all" || a.type.toLowerCase() === type;
    return matchSearch && matchStatus && matchType;
  });

  const allSelected =
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((a) => a.id));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto py-8">
      {/* ── Filter Card ── */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {filtered.length} total &nbsp;•&nbsp; Page 1 of 1
        </p>

        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select value={island} onValueChange={setIsland}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
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
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing up to 50 per page</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Per page</span>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="!h-9 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50">
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
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {["PROPERTY", "ISLAND", "OWNER", "TYPE", "PRICE", "STATUS", "VIEWS", "ACTIONS"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-[#8B8B8B] tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <Checkbox
                    className="w-[18px] h-[18px]"
                    checked={selected.includes(listing.id)}
                    onCheckedChange={() => toggleOne(listing.id)}
                  />
                </td>

                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-[#1C1C1C]">{listing.property}</p>
                  <p className="text-xs text-[#7A7A7A] mt-0.5">{listing.subtitle}</p>
                </td>

                <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">{listing.island}</td>

                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-[#1C1C1C]">{listing.ownerName}</p>
                  <p className="text-xs text-[#7A7A7A] mt-0.5">{listing.ownerEmail}</p>
                </td>

                <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">{listing.type}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">{listing.price}</td>

                <td className="px-4 py-4">
                  <StatusBadge status={listing.status} />
                </td>

                <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">{listing.views}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => openDisableModal(listing)}
                      className="text-sm font-semibold text-orange-400 hover:text-orange-600 transition-colors"
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => openDeleteModal(listing)}
                      className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
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

export default ListingPage;