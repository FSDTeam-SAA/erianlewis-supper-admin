"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Power, PowerOff, X } from "lucide-react";
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
  createdBy?: { firstName?: string; lastName?: string; email?: string } | null;
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
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}
    >
      {status === "disabled" ? "suspended" : status}
    </span>
  );
}

const MAX_CHARS = 60;
function TruncatedText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= MAX_CHARS)
    return <p className="text-xs text-[#7A7A7A] mt-0.5">{text}</p>;
  return (
    <p className="text-xs text-[#7A7A7A] mt-0.5">
      {expanded ? text : `${text.slice(0, MAX_CHARS)}...`}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="ml-1 text-blue-500 hover:text-blue-700 font-medium"
      >
        {expanded ? "Read Less" : "Read More"}
      </button>
    </p>
  );
}

function ListingPage() {
  const router = useRouter();
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

  // Modals state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const { data: islandsData } = useQuery({
    queryKey: ["island-options", token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/islands`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      return (json?.data?.islands || []) as IslandOption[];
    },
  });

  const { data: listingData, isLoading } = useQuery({
    queryKey: [
      "listing-data",
      token,
      page,
      perPage,
      search,
      island,
      status,
      type,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: perPage,
      });
      if (search.trim()) params.set("search", search.trim());
      if (island !== "all") params.set("island", island);
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("listingType", type);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const json = await res.json();
      return json.data as ListingsResponse;
    },
  });

  // Bulk Mutation
  const bulkMutation = useMutation({
    mutationFn: async ({
      action,
      ids,
    }: {
      action: "enable" | "disable" | "delete";
      ids: string[];
    }) => {
      const method = action === "delete" ? "DELETE" : "PUT";
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties/admin/bulk/${action}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!res.ok || !json?.status)
        throw new Error(json?.message || "Operation failed");
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(`Selected listings ${variables.action}d successfully`);
      setSelected([]);
      setBulkDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["listing-data"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Single Suspend/Unsuspend Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: ListingStatus;
    }) => {
      const action = currentStatus === "active" ? "disable" : "enable";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties/admin/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      return json;
    },
    onSuccess: (_, variables) => {
      const actionLabel =
        variables.currentStatus === "active" ? "Suspended" : "Unsuspended";
      toast.success(`Listing ${actionLabel} successfully`);
      queryClient.invalidateQueries({ queryKey: ["listing-data"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rental-properties/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["listing-data"] });
    },
  });

  const listings: Listing[] = useMemo(() => {
    return (listingData?.properties || []).map((item) => ({
      id: item._id,
      property: item?.basicInformation?.propertyTitle || "N/A",
      subtitle: item?.basicInformation?.details || "No details",
      island:
        item?.address?.island?.name || item?.location?.island?.name || "N/A",
      ownerName:
        `${item?.createdBy?.firstName || ""} ${item?.createdBy?.lastName || ""}`.trim(),
      ownerEmail: item?.createdBy?.email || "N/A",
      type: item?.listingType === "buy" ? "Sale" : "Rental",
      price: `${item?.basicInformation?.preferredCurrency || ""} ${item?.basicInformation?.monthlyRent ?? 0}`,
      status: item?.status === "disabled" ? "disabled" : "active",
      views: item?.views ?? 0,
    }));
  }, [listingData?.properties]);

  const allSelected =
    listings.length > 0 && listings.every((a) => selected.includes(a.id));
  const toggleAll = () =>
    setSelected(allSelected ? [] : listings.map((a) => a.id));
  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="container mx-auto py-8">
      {/* Search & Filters */}
      <div className="bg-white rounded-[12px] border border-gray-200 shadow-[1px_1px_4px_0px_#00000040] p-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          {listingData?.paginationInfo.totalData ?? 0} total &nbsp;•&nbsp; Page{" "}
          {listingData?.paginationInfo.currentPage ?? 1}
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
                className="pl-9 h-11 border-gray-200 focus-visible:ring-1"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select
              value={island}
              onValueChange={(v) => {
                setIsland(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 border-gray-200">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {islandsData?.map((item) => (
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
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 border-gray-200">
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
              onValueChange={(v) => {
                setType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 border-gray-200">
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
          <p className="text-sm text-gray-400">
            Showing up to {perPage} per page
          </p>
          <div className="flex items-center gap-3">
            <Select
              value={perPage}
              onValueChange={(v) => {
                setPerPage(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-9 w-20 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["10", "25", "50", "100"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={!listingData?.paginationInfo.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="border-gray-200 h-9"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!listingData?.paginationInfo.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="border-gray-200 h-9"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={true}
              onCheckedChange={() => setSelected([])}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-semibold text-blue-900">
              {selected.length} listings selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-green-600 border-green-200 hover:bg-green-100 gap-2"
              onClick={() =>
                bulkMutation.mutate({ action: "enable", ids: selected })
              }
              disabled={bulkMutation.isPending}
            >
              <Power className="w-4 h-4" /> Enable
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-gray-600 border-gray-200 hover:bg-gray-100 gap-2"
              onClick={() =>
                bulkMutation.mutate({ action: "disable", ids: selected })
              }
              disabled={bulkMutation.isPending}
            >
              <PowerOff className="w-4 h-4" /> Disable
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 gap-2 bg-red-500 hover:bg-red-600"
              onClick={() => setBulkDeleteModalOpen(true)}
              disabled={bulkMutation.isPending}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            <div className="w-[1px] h-6 bg-blue-200 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected([])}
              className="h-9 w-9 p-0 hover:bg-blue-100"
            >
              <X className="w-4 h-4 text-blue-500" />
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              {[
                "PROPERTY",
                "ISLAND",
                "OWNER",
                "TYPE",
                "PRICE",
                "STATUS",
                "VIEWS",
                "ACTIONS",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-semibold text-[#8B8B8B] text-left tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9} className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-gray-400">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selected.includes(listing.id)}
                      onCheckedChange={() => toggleOne(listing.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-[#1C1C1C]">
                      {listing.property}
                    </p>
                    <TruncatedText text={listing.subtitle} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">
                    {listing.island}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[#1C1C1C]">
                      {listing.ownerName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {listing.ownerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">
                    {listing.type}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">
                    {listing.price}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#1C1C1C]">
                    {listing.views}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3 justify-center">
                      {/* Status Toggle Button */}
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: listing.id,
                            currentStatus: listing.status,
                          })
                        }
                        disabled={toggleStatusMutation.isPending}
                        className={`font-semibold text-sm hover:underline ${listing.status === "active" ? "text-orange-500" : "text-green-600"}`}
                      >
                        {listing.status === "active" ? "Suspend" : "Unsuspend"}
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/listing/edit-listing/${listing.id}`,
                          )
                        }
                        className="text-blue-500 font-semibold text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            id: listing.id,
                            name: listing.property,
                          })
                        }
                        className="text-red-500 font-semibold text-sm hover:underline"
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

      {/* single delete modal */}
      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={(id) => {
          deleteMutation.mutate(String(id));
        }}
      />

      {/* bulk delete modal */}
      <DeleteListingModal
        isOpen={bulkDeleteModalOpen}
        listingId="bulk"
        listingName={`${selected.length} Selected Listings`}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={() =>
          bulkMutation.mutate({ action: "delete", ids: selected })
        }
      />
    </div>
  );
}

export default ListingPage;
