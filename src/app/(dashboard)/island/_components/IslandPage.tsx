"use client";

import React, { useMemo, useState } from "react";
import { Map, Building2, Users, Search, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IslandEditDialog } from "./IslandEditDialog";

interface IslandItem {
  _id: string;
  name: string;
  totalProperties: number;
  salesCount: number;
  rentalsCount: number;
  accountsCount: number;
  totalActivity: number;
}

interface OverviewData {
  totalAccounts: number;
  totalProperties: number;
  salesCount: number;
  rentalsCount: number;
  managedIslands: number;
}

interface ListingItem {
  _id: string;
  basicInformation?: {
    propertyTitle?: string;
    details?: string;
    propertyType?: {
      name?: string;
    };
    monthlyRent?: number;
    preferredCurrency?: string;
  };
  address?: {
    streetNumber?: string;
    cityTown?: string;
    island?: {
      name?: string;
    };
  };
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    yearBuilt?: number;
  };
  amenities?: {
    amenities?: string[];
  };
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  listingType?: string;
  status?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

function IslandCard({
  island,
  onViewListings,
  onDeleteIsland,
}: {
  island: IslandItem;
  onViewListings: (island: IslandItem) => void;
  onDeleteIsland: (island: IslandItem) => void;
}) {
  return (
    <div className="rounded-[12px] border border-gray-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{island.name}</h3>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-base leading-[120%] font-medium text-[#4B4B4B]">Properties</span>
          </div>
          <span className="text-2xl font-medium text-[#4B4B4B]">{island.totalProperties}</span>
        </div>

        <p className="text-xs text-gray-400 mb-2 pl-6">
          Sales: {island.salesCount} • Rentals: {island.rentalsCount}
        </p>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-base leading-[120%] font-medium text-[#4B4B4B]">Accounts</span>
          </div>
          <span className="text-2xl font-medium text-[#4B4B4B]">{island.accountsCount}</span>
        </div>

        {/* <div className="py-2 border-t border-gray-100 mb-3">
          <p className="text-xs text-gray-500 mb-1">Total Activity</p>
          <p className="text-2xl font-medium text-red-500">{island.totalActivity}</p>
        </div> */}

        <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
          {/* <Button variant="outline" size="sm" className="text-base text-black hover:bg-gray-50 bg-[#F3F4F6] h-[40px]">
            View Accounts
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewListings(island)}
            className="text-base text-black hover:bg-gray-50 bg-[#F3F4F6] h-[40px] flex-1"
          >
            View Listings
          </Button>
          <IslandEditDialog id={island?._id} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteIsland(island)}
            className="text-[#DC2626] hover:bg-red-50 bg-[#F3F4F6] h-[40px] w-[40px] p-0 flex-shrink-0"
            aria-label="Delete island"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteIslandModal({
  island,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: {
  island: IslandItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen || !island) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">
            <Trash2 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-950">Delete island?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Are you sure you want to delete <span className="font-medium text-gray-800">{island.name}</span>? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 px-5 text-sm text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-10 bg-[#DC2626] px-5 text-sm text-white hover:bg-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function IslandCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-12" />
      </div>

      <div className="mb-2 pl-6">
        <Skeleton className="h-3 w-36" />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-12" />
      </div>

      <div className="border-t border-gray-100 pt-3 mt-1">
        <Skeleton className="h-[40px] w-full" />
      </div>
    </div>
  );
}

function ListingModal({
  isOpen,
  onClose,
  islandName,
  listings,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  islandName: string;
  listings: ListingItem[];
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Island Listings</h3>
            <p className="text-sm text-gray-500 mt-1">{islandName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-84px)]">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-gray-500">No listings found for this island.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing._id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {listing.basicInformation?.propertyTitle || "Untitled Property"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {listing.basicInformation?.propertyType?.name || "N/A"} • Listing:{" "}
                        {(listing.listingType || "N/A").toUpperCase()}
                      </p>
                    </div>
                    <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-white border border-gray-200 text-gray-700">
                      {(listing.status || "unknown").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.basicInformation?.preferredCurrency || ""}{" "}
                        {listing.basicInformation?.monthlyRent ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="text-sm font-semibold text-gray-900">{listing.views ?? 0}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Island</p>
                      <p className="text-sm font-semibold text-gray-900">{listing.address?.island?.name || "N/A"}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Listing ID</p>
                      <p className="break-all text-sm font-semibold text-gray-900">{listing._id}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.address?.streetNumber || "N/A"}, {listing.address?.cityTown || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Property Details</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Beds: {listing.propertyDetails?.bedrooms ?? 0} • Baths: {listing.propertyDetails?.bathrooms ?? 0} • SqFt:{" "}
                        {listing.propertyDetails?.squareFeet ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Owner</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.createdBy?.firstName || ""} {listing.createdBy?.lastName || ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {listing.createdBy?.email || "N/A"} {listing.createdBy?.role ? `• ${listing.createdBy.role}` : ""}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Extras</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Amenities: {listing.amenities?.amenities?.length ?? 0} • Built: {listing.propertyDetails?.yearBuilt ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg bg-white border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-800 mt-1">
                      {listing.basicInformation?.details || "No description provided"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {listing.createdAt ? new Date(listing.createdAt).toLocaleString() : "N/A"} • Updated:{" "}
                      {listing.updatedAt ? new Date(listing.updatedAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IslandPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIslandName, setNewIslandName] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<IslandItem | null>(null);
  const [deleteModalIsland, setDeleteModalIsland] = useState<IslandItem | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const { data: islandData, isLoading: isIslandLoading } = useQuery({
    queryKey: ["island-data", token],
    enabled: status === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch islands");
      }
      return json.data;
    },
  });

  const { data: overViewData } = useQuery({
    queryKey: ["island-overview", token],
    enabled: status === "authenticated" && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands/overview`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch island overview");
      }
      return json.data as OverviewData;
    },
  });

  const addIslandMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to add island");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Island added successfully");
      setNewIslandName("");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["island-data"] });
      queryClient.invalidateQueries({ queryKey: ["island-overview"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { data: listingData, isLoading: isListingLoading } = useQuery({
    queryKey: ["island-listings", selectedIsland?._id, token],
    enabled: status === "authenticated" && !!token && !!selectedIsland?._id && isListingModalOpen,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands/${selectedIsland?._id}/listings`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch island listings");
      }
      return json.data?.listings as ListingItem[];
    },
  });

  const filteredIslands = useMemo(
    () => ((islandData?.islands || []) as IslandItem[]).filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [islandData?.islands, search]
  );

  const handleAdd = () => {
    const name = newIslandName.trim();
    if (!name) return;
    addIslandMutation.mutate(name);
  };

  const handleCancel = () => {
    setNewIslandName("");
    setShowAddForm(false);
  };

  const dataSource = [
    { label: "Accounts", value: String(overViewData?.totalAccounts ?? 0), sub: null },
    {
      label: "Total Property's",
      value: String(overViewData?.totalProperties ?? 0),
      sub: `Sales: ${overViewData?.salesCount ?? 0} • Rentals: ${overViewData?.rentalsCount ?? 0}`,
    },
    { label: "Managed Islands", value: String(overViewData?.managedIslands ?? 0), sub: null },
  ];

  const openListings = (island: IslandItem) => {
    setSelectedIsland(island);
    setIsListingModalOpen(true);
  };

  const deleteIsland = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to delete island");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Island deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["island-data"] });
      queryClient.invalidateQueries({ queryKey: ["island-overview"] });
      setDeleteModalIsland(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto py-8">
      <div className="flex items-start gap-3 mb-6">
        <Map className="w-5 h-5 text-gray-700 mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-medium text-[#000000]">Island & Jurisdiction Control</h1>
          <p className="text-base text-[#9A9A9A] mt-3">
            Geographic segmentation and control layer for platform operations.
          </p>
        </div>
      </div>

      <div className="bg-white mb-6">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Data source</h2>
          <p className="text-sm text-gray-400 mb-4">Production</p>
          <div className="grid grid-cols-3 gap-4">
            {dataSource.map(({ label, value, sub }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Island"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:border-red-400 text-sm h-[48px]"
          />
        </div>
        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-[#DC2626] hover:bg-red-600 text-white flex items-center gap-2 px-4 text-sm h-[45px]"
        >
          <Plus className="w-4 h-4" />
          Add Island
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-[#F9FAFB] border border-gray-200 rounded-[12px] p-4 mb-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Add New Island</p>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Enter island name (e.g, Aruba, Bonaire)"
              value={newIslandName}
              onChange={(e) => setNewIslandName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 border-gray-200 text-sm h-[44px] focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500"
              autoFocus
            />
            <Button
              onClick={handleAdd}
              disabled={addIslandMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 h-[44px]"
            >
              {addIslandMutation.isPending ? "Adding..." : "Add"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="text-sm text-gray-600 border-gray-200 px-5 h-[44px] hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isIslandLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <IslandCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredIslands.map((island) => (
            <IslandCard
              key={island._id}
              island={island}
              onViewListings={openListings}
              onDeleteIsland={setDeleteModalIsland}
            />
          ))}
        </div>
      )}

      <DeleteIslandModal
        island={deleteModalIsland}
        isOpen={!!deleteModalIsland}
        isDeleting={deleteIsland.isPending}
        onClose={() => setDeleteModalIsland(null)}
        onConfirm={() => {
          if (deleteModalIsland?._id) {
            deleteIsland.mutate(deleteModalIsland._id);
          }
        }}
      />

      <ListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        islandName={selectedIsland?.name || ""}
        listings={listingData || []}
        isLoading={isListingLoading}
      />
    </div>
  );
}

export default IslandPage;
