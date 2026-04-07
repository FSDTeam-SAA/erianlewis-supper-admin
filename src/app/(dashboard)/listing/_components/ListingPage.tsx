"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteListingModal } from "@/components/modal/DeleteModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type ListingStatus = "active" | "disabled";

interface Listing {
  id: string;
  property: string;
  subtitle: string;
  island: string;
  ownerName: string;
  ownerEmail: string;
  type: string;
  price: string;
  status: ListingStatus;
  views: number;
}

interface ApiProperty {
  _id: string;
  basicInformation?: {
    propertyTitle?: string;
    details?: string;
    monthlyRent?: number;
    preferredCurrency?: string;
  };
  address?: {
    cityTown?: string;
    island?: { _id: string; name: string } | null;
  };
  location?: {
    cityTown?: string;
    island?: { _id: string; name: string } | null;
  };
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  listingType?: "rent" | "buy";
  status?: "active" | "disabled";
  views?: number;
}

interface ListingsResponse {
  properties: ApiProperty[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface IslandOption {
  _id: string;
  name: string;
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    disabled: "bg-gray-100 text-gray-500",
  };
  const label = status === "disabled" ? "suspended" : status;

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}

function ListingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("50");
  const [selected, setSelected] = useState<string[]>([]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  const { data: islandsData } = useQuery({
    queryKey: ["island-options", token],
    enabled: sessionStatus === "authenticated" && !!token,
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
      return (json?.data?.islands || []) as IslandOption[];
    },
  });

  const { data: listingData, isLoading } = useQuery({
    queryKey: ["listing-data", token, page, perPage, search, island, status, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (search.trim()) params.set("search", search.trim());
      if (island !== "all") params.set("island", island);
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("listingType", type);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch listings");
      }
      return json.data as ListingsResponse;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties/admin/${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to delete listing");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["listing-data"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const listings: Listing[] = useMemo(() => {
    return (listingData?.properties || []).map((item) => {
      const ownerName = `${item?.createdBy?.firstName || ""} ${item?.createdBy?.lastName || ""}`.trim() || "N/A";
      const islandName =
        item?.address?.island?.name ||
        item?.location?.island?.name ||
        item?.address?.cityTown ||
        item?.location?.cityTown ||
        "N/A";
      const listingTypeLabel = item?.listingType === "buy" ? "Sale" : "Rental";
      const currency = item?.basicInformation?.preferredCurrency || "";
      const amount = item?.basicInformation?.monthlyRent ?? 0;

      return {
        id: item._id,
        property: item?.basicInformation?.propertyTitle || "N/A",
        subtitle: item?.basicInformation?.details || "No details",
        island: islandName,
        ownerName,
        ownerEmail: item?.createdBy?.email || "N/A",
        type: listingTypeLabel,
        price: `${currency} ${amount}`.trim(),
        status: item?.status === "disabled" ? "disabled" : "active",
        views: item?.views ?? 0,
      };
    });
  }, [listingData?.properties]);

  const openDeleteModal = (listing: Listing) => {
    setDeleteModal({ isOpen: true, id: listing.id, name: listing.property });
  };

  const handleDeleteConfirm = (id: string | number) => {
    deleteMutation.mutate(String(id));
    setSelected((prev) => prev.filter((s) => s !== String(id)));
  };

  const allSelected = listings.length > 0 && listings.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(listings.map((a) => a.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const paginationInfo = listingData?.paginationInfo;
  const totalData = paginationInfo?.totalData ?? 0;
  const currentPage = paginationInfo?.currentPage ?? page;
  const totalPages = paginationInfo?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email, name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-11 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select
              value={island}
              onValueChange={(value) => {
                setIsland(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {(islandsData || []).map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full text-sm border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">Rental</SelectItem>
                <SelectItem value="buy">Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing up to {perPage} per page</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Per page</span>
            <Select
              value={perPage}
              onValueChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            >
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
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo?.hasPrevPage}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo?.hasNextPage}
              onClick={() => setPage((prev) => prev + 1)}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {["PROPERTY", "ISLAND", "OWNER", "TYPE", "PRICE", "STATUS", "VIEWS", "ACTIONS"].map((col) => (
                <th
                  key={col}
                  className={`px-4 py-3 text-xs font-semibold text-[#8B8B8B] tracking-wide ${col === "ACTIONS" ? "text-center" : "text-left"}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`listing-skeleton-${idx}`}>
                  <td className="px-4 py-4">
                    <Skeleton className="h-[18px] w-[18px] rounded-sm" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-56" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
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
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                        Edit
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default ListingPage;
