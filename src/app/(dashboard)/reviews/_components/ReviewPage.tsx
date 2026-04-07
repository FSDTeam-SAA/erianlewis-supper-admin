"use client";

import React, { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type ReviewStatus = "visible" | "hidden";

interface ReviewRow {
  id: string;
  when: string;
  property: string;
  island: string;
  ownerEmail: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
}

interface IslandOption {
  _id: string;
  name: string;
}

interface ApiReviewItem {
  _id: string;
  rating?: number;
  comment?: string;
  status?: ReviewStatus;
  createdAt?: string;
  user?: {
    email?: string;
  } | null;
  property?: {
    basicInformation?: {
      propertyTitle?: string;
    };
    address?: {
      island?: {
        _id: string;
        name: string;
      } | null;
    };
  } | null;
}

interface ReviewsResponse {
  reviews: ApiReviewItem[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles = {
    visible: "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]",
    hidden: "bg-[#fce4ec] text-[#c62828] border border-[#f8bbd0]",
  };
  const labels = {
    visible: "visible",
    hidden: "Hidden",
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
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [island, setIsland] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsReviewId, setDetailsReviewId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  const apiStatusFilter = visibility === "visible" || visibility === "hidden" ? visibility : "";

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

  const { data: reviewData, isLoading, refetch } = useQuery({
    queryKey: ["review", token, page, perPage, apiStatusFilter],
    enabled: sessionStatus === "authenticated" && !!token,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", perPage);
      if (apiStatusFilter) params.set("status", apiStatusFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/all?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch reviews");
      }
      return json.data as ReviewsResponse;
    },
  });

  const { data: reviewDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["review-details", detailsReviewId, token],
    enabled: detailsModalOpen && !!detailsReviewId && !!token,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/${detailsReviewId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to fetch review details");
      }
      return json.data;
    },
  });

  const hideUnhideMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/${reviewId}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to update review visibility");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Review visibility updated");
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews/admin/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to delete review");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openDeleteModal = (listing: ReviewRow) => {
    setDeleteModal({ isOpen: true, id: listing.id, name: listing.property });
  };

  const handleDeleteConfirm = (id: string | number) => {
    deleteMutation.mutate(String(id));
    setSelected((prev) => prev.filter((s) => s !== String(id)));
  };

  const openDetailsModal = (reviewId: string) => {
    setDetailsReviewId(reviewId);
    setDetailsModalOpen(true);
  };

  const rows: ReviewRow[] = useMemo(() => {
    return (reviewData?.reviews || []).map((item) => {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;
      const when = createdDate && !Number.isNaN(createdDate.getTime())
        ? createdDate.toLocaleString("en-GB")
        : "N/A";

      return {
        id: item._id,
        when,
        property: item?.property?.basicInformation?.propertyTitle || "N/A",
        island: item?.property?.address?.island?.name || "N/A",
        ownerEmail: item?.user?.email || "N/A",
        rating: item?.rating ?? 0,
        comment: item?.comment?.trim() ? item.comment : "–",
        status: item?.status === "hidden" ? "hidden" : "visible",
      };
    });
  }, [reviewData?.reviews]);

  const filtered = useMemo(() => {
    return rows.filter((a) => {
      const searchValue = search.toLowerCase();
      const matchSearch =
        a.property.toLowerCase().includes(searchValue) ||
        a.ownerEmail.toLowerCase().includes(searchValue) ||
        a.comment.toLowerCase().includes(searchValue);
      const matchIsland = island === "all" || a.island === (islandsData || []).find((i) => i._id === island)?.name;
      return matchSearch && matchIsland;
    });
  }, [rows, search, island, islandsData]);

  const allSelected =
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((a) => a.id));
  };

  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const paginationInfo = reviewData?.paginationInfo;
  const totalData = paginationInfo?.totalData ?? 0;
  const currentPage = paginationInfo?.currentPage ?? page;
  const totalPages = paginationInfo?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Listings (Rentals Only)
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalData} total &nbsp;•&nbsp; Page {currentPage} of {totalPages}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex items-end gap-3 mt-5 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Property title, address, user email, comment..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 text-sm border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
          </div>

          <div className="w-44">
            <label className="text-xs text-gray-500 mb-1 block">Island</label>
            <Select
              value={island}
              onValueChange={(value) => {
                setIsland(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200 rounded-lg">
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
            <label className="text-xs text-gray-500 mb-1 block">
              Visibility
            </label>
            <Select
              value={visibility}
              onValueChange={(value) => {
                setVisibility(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-10 w-full text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Visible + Hidden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visible + Hidden</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Showing up to {perPage} per page</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Per page</span>
            <Select
              value={perPage}
              onValueChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            >
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
              disabled={!paginationInfo?.hasPrevPage}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!paginationInfo?.hasNextPage}
              onClick={() => setPage((prev) => prev + 1)}
              className="!h-9 px-4 text-sm text-gray-500 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

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
                  className={`px-4 py-3.5 text-xs font-semibold text-[#9e9e9e] tracking-wider uppercase ${col === "ACTIONS" ? "text-center" : "text-left"}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  Loading reviews...
                </td>
              </tr>
            ) : (
              filtered.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selected.includes(listing.id)}
                      onCheckedChange={() => toggleOne(listing.id)}
                    />
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {listing.when}
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-[#e53935] hover:underline cursor-pointer">
                      {listing.property}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{listing.island}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{listing.ownerEmail}</p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= listing.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{listing.rating}/5</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-400">{listing.comment}</td>

                  <td className="px-4 py-4">
                    <StatusBadge status={listing.status} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {listing.status === "hidden" ? (
                        <button
                          onClick={() => hideUnhideMutation.mutate(listing.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => hideUnhideMutation.mutate(listing.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide
                        </button>
                      )}

                      <button
                        onClick={() => openDetailsModal(listing.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View details
                      </button>

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
              ))
            )}

            {!isLoading && filtered.length === 0 && (
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

      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        listingId={deleteModal.id}
        listingName={deleteModal.name}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDeleteConfirm}
      />

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>

          {isDetailsLoading ? (
            <p className="text-sm text-gray-500">Loading details...</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Property</p>
                <p className="font-medium text-gray-900">
                  {reviewDetails?.property?.basicInformation?.propertyTitle || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">User</p>
                  <p className="font-medium text-gray-900">
                    {reviewDetails?.user?.firstName || ""} {reviewDetails?.user?.lastName || ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{reviewDetails?.user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-medium text-gray-900">{reviewDetails?.rating ?? 0}/5</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{reviewDetails?.status || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Comment</p>
                <p className="font-medium text-gray-900">{reviewDetails?.comment || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">
                    {reviewDetails?.createdAt ? new Date(reviewDetails.createdAt).toLocaleString("en-GB") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Updated At</p>
                  <p className="font-medium text-gray-900">
                    {reviewDetails?.updatedAt ? new Date(reviewDetails.updatedAt).toLocaleString("en-GB") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReviewPage;
